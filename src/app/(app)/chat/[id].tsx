import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Composer } from '@/components/chat/composer';
import { MessageBubble } from '@/components/chat/message-bubble';
import { QuickReply } from '@/components/chat/quick-reply';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { EnergyChip } from '@/components/energy/energy-chip';
import { InsufficientEnergySheet } from '@/components/energy/insufficient-energy-sheet';
import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/icon-button';
import { CHARACTERS, getCharacterById } from '@/data/characters';
import { useKeyboardVisible } from '@/hooks/use-web-viewport';
import { useScrollKeyboardDismiss } from '@/hooks/use-scroll-keyboard-dismiss';
import { useWebChatScroll } from '@/hooks/use-web-chat-scroll';
import { useMotionPreferences } from '@/hooks/use-motion-preferences';
import type { ChatMessage } from '@/models/types';
import { useChatsStore } from '@/store/chats-store';
import { useDraftsStore } from '@/store/drafts-store';
import { ENERGY_CONFIG } from '@/store/energy-store';
import { sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const EMPTY_MESSAGES: ChatMessage[] = [];

export function generateStaticParams() {
  return CHARACTERS.map(({ id }) => ({ id }));
}

// Хелпер для додавання прозорості до HEX кольорів
function getGradientColors(hexColor: string): readonly [string, string, string] {
  const hex = hexColor.replace('#', '');
  return [`#${hex}00`, `#${hex}66`, `#${hex}B3`] as const;
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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const { reduceMotion } = useMotionPreferences();
  const scrollKeyboardDismiss = useScrollKeyboardDismiss();
  const { id } = useLocalSearchParams<{ id: string }>();
  const characterId = id ?? '';
  const character = getCharacterById(characterId);

  const conversation = useChatsStore((state) => state.conversations[characterId]);
  const isTyping = useChatsStore((state) => Boolean(state.typingCharacterIds[characterId]));
  const sendMessage = useChatsStore((state) => state.sendMessage);
  const markRead = useChatsStore((state) => state.markRead);

  const draft = useDraftsStore((state) => state.drafts[characterId] ?? '');
  const updateDraft = useDraftsStore((state) => state.setDraft);
  const setDraft = (text: string) => updateDraft(characterId, text);
  const [isEnergySheetVisible, setIsEnergySheetVisible] = useState(false);
  const [overlayHeight, setOverlayHeight] = useState(120);
  const [sentMessageId, setSentMessageId] = useState<string>();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const nearBottom = useRef(true);
  useWebChatScroll(listRef, nearBottom, conversation ? characterId : '', spacing.md);

  const handleOverlayLayout = (event: LayoutChangeEvent) => setOverlayHeight(event.nativeEvent.layout.height);

  const messages = conversation?.messages ?? EMPTY_MESSAGES;
  const unreadCount = conversation?.unreadCount ?? 0;

  // Поки чат відкритий — вхідні вважаються прочитаними.
  useEffect(() => {
    if (unreadCount > 0) markRead(characterId);
  }, [characterId, unreadCount, markRead]);

  // Прокручуємо список, якщо висота оверлею (наприклад, підказки з'явились/зникли) змінилася
  useEffect(() => {
    if (Platform.OS !== 'web' && messages.length > 0 && nearBottom.current) {
      const timeout = setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
      return () => clearTimeout(timeout);
    }
  }, [overlayHeight, messages.length]);

  if (!character || !conversation) return <Redirect href="/chats" />;

  const lastMessage = messages[messages.length - 1];
  const showSuggestions = (Platform.OS === 'web' || !keyboardVisible) && !isTyping && lastMessage?.author === 'character' && draft.length === 0;

  const handleSend = (text = draft) => {
    const result = sendMessage(characterId, text);
    if (result === 'sent') {
      const sentMessages = useChatsStore.getState().conversations[characterId]?.messages;
      setSentMessageId(sentMessages?.[sentMessages.length - 1]?.id);
      setDraft('');
      nearBottom.current = true;
      if (Platform.OS !== 'web') listRef.current?.scrollToEnd({ animated: false });
      return;
    }
    // Чернетка не втрачається при нестачі енергії (S13 → S20).
    if (result === 'insufficient-energy') setIsEnergySheetVisible(true);
  };

  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/chats'));
  const openProfile = () => router.push({ pathname: '/character/[id]', params: { id: characterId } });

  const gradientColors = getGradientColors(colors.background);

  return (
    <View testID="chat-shell" style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} enabled={Platform.OS !== 'web'} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Keep the absolute composer inside the area reduced by native KAV padding. */}
        <View style={styles.flex}>
        <FlatList
          testID="chat-messages"
          {...scrollKeyboardDismiss}
          ref={listRef}
          data={messages}
          keyExtractor={(message) => message.id}
          extraData={sentMessageId}
          renderItem={({ item }) => <MessageBubble message={item} animateEntry={item.id === sentMessageId && !reduceMotion} />}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => {
            if (Platform.OS !== 'web' && nearBottom.current) listRef.current?.scrollToEnd({ animated: false });
          }}
          onScroll={(event) => {
            if (Platform.OS === 'web') return;
            const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
            nearBottom.current = contentSize.height - layoutMeasurement.height - contentOffset.y < 80;
          }}
          scrollEventThrottle={32}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'}
          ListHeaderComponent={<View style={{ height: insets.top + sizes.headerHeight + spacing.md }} />}
          ListFooterComponent={
            <View>
              {isTyping && <TypingIndicator />}
              {Platform.OS !== 'web' && <View style={{ height: overlayHeight + spacing.md }} />}
            </View>
          }
        />

        {/* Плаваючий оверлей: стрічка проглядає крізь скляні елементи composer’а. */}
        <View testID="chat-overlay" style={styles.overlay} onLayout={Platform.OS === 'web' ? undefined : handleOverlayLayout}>
          <View style={[StyleSheet.absoluteFill, WEB_BOTTOM_BLUR]} pointerEvents="none" />
          <LinearGradient
            colors={gradientColors}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {showSuggestions && (
            <View testID="chat-suggestions" aria-hidden={keyboardVisible} style={Platform.OS === 'web' ? { display: 'grid' } as object : undefined}>
            <View>
            <View style={styles.suggestions}>
              {character.suggestedReplies.map((reply) => (
                <QuickReply
                  key={reply}
                  reply={reply}
                  disabled={Platform.OS === 'web' && keyboardVisible}
                  reduceMotion={reduceMotion}
                  onSend={handleSend}
                />
              ))}
            </View>
            </View>
            </View>
          )}

          <Composer
            value={draft}
            onChangeText={setDraft}
            onSend={() => handleSend()}
            isBusy={isTyping}
          />
        </View>
        </View>
      </KeyboardAvoidingView>

      <View testID="chat-header" style={[styles.headerWrapper, { paddingTop: insets.top }]} pointerEvents="box-none">
        <View style={[StyleSheet.absoluteFill, WEB_TOP_BLUR]} pointerEvents="none" />
        <LinearGradient
          colors={[gradientColors[2], gradientColors[1], gradientColors[0]]}
          locations={[0, 0.6, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.header}>
          <IconButton icon="chevron-back" onPress={handleBack} accessibilityLabel={t('chat.back_accessibility')} />
          <Pressable
            onPress={openProfile}
            style={styles.headerIdentity}
            accessibilityRole="button"
            accessibilityLabel={t('chat.profile_accessibility', { name: character.name })}>
            <Avatar source={character.photos[0]} size={sizes.avatarSm} />
            <View style={styles.headerText}>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {character.name}
              </AppText>
              {isTyping && (
                <AppText variant="caption" color="brand">
                  {t('chat.typing')}
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
        actionLabel={t('chat.insufficient_energy_action')}
        onClose={() => setIsEnergySheetVisible(false)}
      />

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
});
