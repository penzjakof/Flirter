import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/layout/app-header';
import { useFloatingTabBarInset } from '@/components/layout/glass-tab-bar';
import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getCharacterById } from '@/data/characters';
import { formatListTime } from '@/lib/format';
import type { Character, Conversation } from '@/models/types';
import { isPendingRequest, useChatsStore } from '@/store/chats-store';
import { radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface ConversationItem {
  conversation: Conversation;
  character: Character;
  lastActivityAt: number;
}

function openChat(characterId: string) {
  router.push({ pathname: '/chat/[id]', params: { id: characterId } });
}

interface ConversationRowProps {
  item: ConversationItem;
  isTyping: boolean;
  /** Для запиту на діалог — кнопка «Прибрати» праворуч. */
  onDismiss?: (characterId: string) => void;
}

/** Рядок списку чатів. Запити й звичайні розмови виглядають однаково; запит має ще кнопку ✕. */
function ConversationRow({ item, isTyping, onDismiss }: ConversationRowProps) {
  const { colors } = useTheme();
  const { conversation, character } = item;
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const preview = isTyping ? 'друкує…' : lastMessage ? `${lastMessage.author === 'user' ? 'Ти: ' : ''}${lastMessage.text}` : '';
  const hasUnread = conversation.unreadCount > 0;

  return (
    <View style={styles.rowContainer}>
      <Pressable
        testID={`chat-row-${character.id}`}
        onPress={() => openChat(character.id)}
        accessibilityRole="button"
        accessibilityLabel={`${character.name}. ${preview}${hasUnread ? `. Непрочитаних: ${conversation.unreadCount}` : ''}`}
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceMuted }]}>
        <Avatar source={character.photos[0]} size={sizes.avatarMd} ringColor={colors.surface} />
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <AppText variant="bodyStrong" numberOfLines={1} style={styles.rowName}>
              {character.name}
            </AppText>
            <AppText variant="caption" color={hasUnread ? 'brand' : 'textSecondary'}>
              {formatListTime(item.lastActivityAt)}
            </AppText>
          </View>
          <View style={styles.rowBottom}>
            <AppText
              variant="secondary"
              color={isTyping ? 'brand' : hasUnread ? 'textPrimary' : 'textSecondary'}
              numberOfLines={1}
              style={[styles.rowPreview, hasUnread && styles.unreadText]}>
              {preview}
            </AppText>
            {hasUnread && !onDismiss && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.brand }]}>
                <AppText variant="caption" color="textOnBrand">
                  {conversation.unreadCount}
                </AppText>
              </View>
            )}
          </View>
        </View>
      </Pressable>
      {onDismiss && (
        <Pressable
          testID={`request-dismiss-${character.id}`}
          onPress={() => onDismiss(character.id)}
          hitSlop={spacing.xs}
          accessibilityRole="button"
          accessibilityLabel={`Прибрати запит від ${character.name}`}
          style={({ pressed }) => [styles.dismiss, { backgroundColor: colors.surfaceMuted }, pressed && styles.dismissPressed]}>
          <Ionicons name="close" size={sizes.iconSm} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="bodyStrong">{title}</AppText>
      {count !== undefined && count > 0 && (
        <View style={[styles.countBadge, { backgroundColor: colors.brand }]}>
          <AppText variant="caption" color="textOnBrand">
            {count}
          </AppText>
        </View>
      )}
    </View>
  );
}

type ListEntry =
  | { type: 'header'; key: string; title: string; count?: number }
  | { type: 'request'; key: string; item: ConversationItem }
  | { type: 'dialog'; key: string; item: ConversationItem };

/** S12. Чати: запити на діалог (ініціативні повідомлення персонажів), розмови, empty state. */
export default function ChatsScreen() {
  const { colors } = useTheme();
  const conversations = useChatsStore((state) => state.conversations);
  const typingCharacterIds = useChatsStore((state) => state.typingCharacterIds);
  const dismissRequest = useChatsStore((state) => state.dismissRequest);
  const tabBarInset = useFloatingTabBarInset();

  const items: ConversationItem[] = Object.values(conversations)
    .map((conversation) => {
      const character = getCharacterById(conversation.characterId);
      if (!character) return null;
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      return { conversation, character, lastActivityAt: lastMessage?.createdAt ?? conversation.matchedAt };
    })
    .filter((item): item is ConversationItem => item !== null)
    .sort((a, b) => b.lastActivityAt - a.lastActivityAt);

  const requests = items.filter(({ conversation }) => isPendingRequest(conversation));
  const dialogs = items.filter(({ conversation }) => !isPendingRequest(conversation));

  // Один плаский список із заголовками секцій — віртуалізація без вкладених скролів.
  const entries: ListEntry[] = [
    ...(requests.length > 0
      ? [
          { type: 'header' as const, key: 'h-requests', title: 'Запити на діалог', count: requests.length },
          ...requests.map((item) => ({ type: 'request' as const, key: `r-${item.character.id}`, item })),
        ]
      : []),
    ...(dialogs.length > 0
      ? [
          { type: 'header' as const, key: 'h-dialogs', title: 'Повідомлення' },
          ...dialogs.map((item) => ({ type: 'dialog' as const, key: `d-${item.character.id}`, item })),
        ]
      : []),
  ];

  const renderEntry = ({ item: entry }: { item: ListEntry }) => {
    if (entry.type === 'header') return <SectionHeader title={entry.title} count={entry.count} />;
    const isTyping = Boolean(typingCharacterIds[entry.item.character.id]);
    return <ConversationRow item={entry.item} isTyping={isTyping} onDismiss={entry.type === 'request' ? dismissRequest : undefined} />;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <AppHeader title="Чати" />
      {items.length === 0 ? (
        <View style={[styles.empty, { paddingBottom: tabBarInset }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.brandSubtle }]}>
            <Ionicons name="chatbubbles-outline" size={36} color={colors.brand} />
          </View>
          <AppText variant="heading" align="center">
            Поки що тут тихо
          </AppText>
          <AppText variant="body" color="textSecondary" align="center">
            Обери персонажа для першої розмови.
          </AppText>
          <Button label="До знайомств" onPress={() => router.navigate('/')} style={styles.emptyButton} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(entry) => entry.key}
          renderItem={renderEntry}
          contentContainerStyle={{ paddingBottom: tabBarInset }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: spacing.xs + 2,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowBody: {
    flex: 1,
    gap: spacing.xxs,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowName: {
    flex: 1,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowPreview: {
    flex: 1,
  },
  unreadText: {
    fontWeight: '600',
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: spacing.xs + 2,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismiss: {
    width: 36,
    height: 36,
    marginRight: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissPressed: {
    opacity: 0.7,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyButton: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
});
