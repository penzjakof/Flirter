import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Composer } from '@/components/chat/composer';
import { MessageBubble } from '@/components/chat/message-bubble';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { EnergyChip } from '@/components/energy/energy-chip';
import { InsufficientEnergySheet } from '@/components/energy/insufficient-energy-sheet';
import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/icon-button';
import { getCharacterById } from '@/data/characters';
import type { ChatMessage } from '@/models/types';
import { useChatsStore } from '@/store/chats-store';
import { ENERGY_CONFIG } from '@/store/energy-store';
import { colors, radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const EMPTY_MESSAGES: ChatMessage[] = [];

// Хелпер для додавання прозорості до HEX кольорів
function getGradientColors(hexColor: string) {
  const hex = hexColor.replace('#', '');
  return [`#${hex}00`, `#${hex}66`, `#${hex}B3`]; // Максимальна непрозорість знижена до 70%
}

const WEB_TOP_BLUR = Platform.select<any>({
  web: {
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
  },
  default: {},
});

const WEB_BOTTOM_BLUR = Platform.select<any>({
  web: {
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
  },
  default: {},
});

/** S13. Чат — центральний екран продукту. Tab bar прихований для місця під клавіатуру. */
export default function ChatScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const characterId = id ?? '';
  const character = getCharacterById(characterId);

  const conversation = useChatsStore((state) => state.conversations[characterId]);
  const isTyping = useChatsStore((state) => Boolean(state.typingCharacterIds[characterId]));
  const sendMessage = useChatsStore((state) => state.sendMessage);
  const markRead = useChatsStore((state) => state.markRead);

  const [draft, setDraft] = useState('');
  const [isEnergySheetVisible, setIsEnergySheetVisible] = useState(false);
  const [isComingSoonVisible, setIsComingSoonVisible] = useState(false);
  const [overlayHeight, setOverlayHeight] = useState(120);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const handleOverlayLayout = (event: LayoutChangeEvent) => setOverlayHeight(event.nativeEvent.layout.height);

  const messages = conversation?.messages ?? EMPTY_MESSAGES;
  const unreadCount = conversation?.unreadCount ?? 0;

  // Поки чат відкритий — вхідні вважаються прочитаними.
  useEffect(() => {
    if (unreadCount > 0) markRead(characterId);
  }, [characterId, unreadCount, markRead]);

  // Прокручуємо список, якщо висота оверлею (наприклад, підказки з'явились/зникли) змінилася
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [overlayHeight, messages.length]);

  if (!character || !conversation) return <Redirect href="/chats" />;

  const lastMessage = messages[messages.length - 1];
  const showSuggestions = !isTyping && lastMessage?.author === 'character' && draft.length === 0;

  const handleSend = () => {
    const result = sendMessage(characterId, draft);
    if (result === 'sent') {
      setDraft('');
      return;
    }
    // Чернетка не втрачається при нестачі енергії (S13 → S20).
    if (result === 'insufficient-energy') setIsEnergySheetVisible(true);
  };

  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/chats'));
  const openProfile = () => router.push({ pathname: '/character/[id]', params: { id: characterId } });

  const gradientColors = getGradientColors(colors.background);

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(message) => message.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={<View style={{ height: insets.top + sizes.headerHeight + spacing.md }} />}
          ListFooterComponent={
            <View>
              {isTyping && <TypingIndicator />}
              <View style={{ height: overlayHeight + spacing.md }} />
            </View>
          }
        />

        {/* Плаваючий оверлей: стрічка проглядає крізь скляні елементи composer’а. */}
        <View style={styles.overlay} onLayout={handleOverlayLayout}>
          <View style={[StyleSheet.absoluteFill, WEB_BOTTOM_BLUR]} pointerEvents="none" />
          <LinearGradient
            colors={gradientColors}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {showSuggestions && (
            <View style={styles.suggestions}>
              {character.suggestedReplies.map((reply) => (
                <Pressable
                  key={reply}
                  // Підказка лише вставляє текст — надсилання окремою дією (без витрат).
                  onPress={() => setDraft(reply)}
                  accessibilityRole="button"
                  accessibilityLabel={`Вставити підказку: ${reply}`}
                  style={({ pressed }) => [styles.suggestion, { backgroundColor: colors.surface, borderColor: colors.brand }, pressed && { backgroundColor: colors.brandSubtle }]}>
                  <AppText variant="secondary" color="brand" style={styles.suggestionText}>
                    {reply}
                  </AppText>
                </Pressable>
              ))}
            </View>
          )}

          <Composer
            value={draft}
            onChangeText={setDraft}
            onSend={handleSend}
            onAttachPhoto={() => setIsComingSoonVisible(true)}
            onRecordVoice={() => setIsComingSoonVisible(true)}
            isBusy={isTyping}
          />
        </View>
      </KeyboardAvoidingView>

      <View style={[styles.headerWrapper, { paddingTop: insets.top }]} pointerEvents="box-none">
        <View style={[StyleSheet.absoluteFill, WEB_TOP_BLUR]} pointerEvents="none" />
        <LinearGradient
          colors={[gradientColors[2], gradientColors[1], gradientColors[0]]}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.header}>
          <IconButton icon="chevron-back" onPress={handleBack} accessibilityLabel="Назад до чатів" />
          <Pressable
            onPress={openProfile}
            style={styles.headerIdentity}
            accessibilityRole="button"
            accessibilityLabel={`Профіль: ${character.name}`}>
            <Avatar source={character.photos[0]} size={sizes.avatarSm} />
            <View style={styles.headerText}>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {character.name}
              </AppText>
              {isTyping && (
                <AppText variant="caption" color="brand">
                  друкує…
                </AppText>
              )}
            </View>
          </Pressable>
          <EnergyChip />
        </View>
      </View>

      <InsufficientEnergySheet
        visible={isEnergySheetVisible}
        requiredAmount={ENERGY_CONFIG.costs.textMessage}
        actionLabel="Надіслати повідомлення"
        onClose={() => setIsEnergySheetVisible(false)}
      />

      {/* Фото й голосові потребують бекенду та модерації — у прототипі чесно повідомляємо. */}
      <BottomSheet visible={isComingSoonVisible} onClose={() => setIsComingSoonVisible(false)} title="Уже незабаром">
        <AppText variant="body" color="textSecondary">
          Надсилання фото й голосових повідомлень з’явиться в наступних версіях.
        </AppText>
        <Button label="Добре" onPress={() => setIsComingSoonVisible(false)} testID="coming-soon-close" />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: spacing.xl,
  },
  header: {
    height: sizes.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.xs,
    paddingRight: spacing.lg,
    gap: spacing.xs,
  },
  headerIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  messages: {
    paddingTop: spacing.md,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    // Оверлей composer’а поверх стрічки (glass), тапи між елементами проходять до списку.
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  suggestions: {
    pointerEvents: 'box-none',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  suggestion: {
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brand,
    backgroundColor: colors.surface,
  },
  suggestionPressed: {
    backgroundColor: colors.brandSubtle,
  },
  suggestionText: {
    fontWeight: '500',
  },
});
