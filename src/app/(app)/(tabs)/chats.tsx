import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { conversation, character } = item;
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const preview = isTyping
    ? t('chats.typing')
    : lastMessage
      ? `${lastMessage.author === 'user' ? t('chats.you_prefix') : ''}${lastMessage.text}`
      : '';
  const hasUnread = conversation.unreadCount > 0;

  return (
    <View style={styles.rowContainer}>
      <Pressable
        testID={`chat-row-${character.id}`}
        onPress={() => openChat(character.id)}
        accessibilityRole="button"
        accessibilityLabel={`${character.name}. ${preview}${hasUnread ? t('chats.unread_suffix', { count: conversation.unreadCount }) : ''}`}
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
          accessibilityLabel={t('chats.dismiss_request_accessibility', { name: character.name })}
          style={({ pressed }) => [styles.dismiss, { backgroundColor: colors.surfaceMuted }, pressed && styles.dismissPressed]}>
          <Ionicons name="close" size={sizes.iconSm} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  count?: number;
  actionLabel?: string;
  expanded?: boolean;
  onToggle?: () => void;
}

function SectionHeader({ title, count, actionLabel, expanded, onToggle }: SectionHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeading}>
        <AppText variant="bodyStrong" style={styles.sectionTitle}>{title}</AppText>
        {count !== undefined && count > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.brand }]}>
            <AppText variant="caption" color="textOnBrand">
              {count}
            </AppText>
          </View>
        )}
      </View>
      {onToggle && (
        <Pressable
          testID="chat-requests-toggle"
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          accessibilityState={{ expanded }}
          style={({ pressed }) => [styles.sectionAction, { backgroundColor: colors.surfaceMuted }, pressed && styles.dismissPressed]}>
          <AppText variant="caption" color="textSecondary">{actionLabel}</AppText>
        </Pressable>
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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const conversations = useChatsStore((state) => state.conversations);
  const typingCharacterIds = useChatsStore((state) => state.typingCharacterIds);
  const dismissRequest = useChatsStore((state) => state.dismissRequest);
  const tabBarInset = useFloatingTabBarInset();
  const [showAllRequests, setShowAllRequests] = useState(false);

  const items: ConversationItem[] = Object.values(conversations)
    .map((conversation) => {
      const character = getCharacterById(conversation.characterId);
      if (!character) return null;
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      return { conversation, character, lastActivityAt: lastMessage?.createdAt ?? conversation.matchedAt };
    })
    .filter((item): item is ConversationItem => item !== null)
    .sort((a, b) => b.lastActivityAt - a.lastActivityAt);

  const requests = items
    .filter(({ conversation }) => isPendingRequest(conversation))
    .sort((a, b) => b.conversation.matchedAt - a.conversation.matchedAt);
  const visibleRequests = showAllRequests ? requests : requests.slice(0, 1);
  const dialogs = items.filter(({ conversation }) => !isPendingRequest(conversation));

  // Один плаский список із заголовками секцій — віртуалізація без вкладених скролів.
  const entries: ListEntry[] = [
    ...(requests.length > 0
      ? [
          { type: 'header' as const, key: 'h-requests', title: t('chats.section_requests'), count: requests.length },
          ...visibleRequests.map((item) => ({ type: 'request' as const, key: `r-${item.character.id}`, item })),
        ]
      : []),
    ...(dialogs.length > 0
      ? [
          { type: 'header' as const, key: 'h-dialogs', title: t('chats.section_dialogs') },
          ...dialogs.map((item) => ({ type: 'dialog' as const, key: `d-${item.character.id}`, item })),
        ]
      : []),
  ];

  const renderEntry = ({ item: entry }: { item: ListEntry }) => {
    if (entry.type === 'header') {
      const canToggle = entry.key === 'h-requests' && requests.length > 1;
      return (
        <SectionHeader
          title={entry.title}
          count={entry.count}
          actionLabel={canToggle ? t(showAllRequests ? 'chats.show_less_requests' : 'chats.show_all_requests') : undefined}
          expanded={canToggle ? showAllRequests : undefined}
          onToggle={canToggle ? () => setShowAllRequests((previous) => !previous) : undefined}
        />
      );
    }
    const isTyping = Boolean(typingCharacterIds[entry.item.character.id]);
    return <ConversationRow item={entry.item} isTyping={isTyping} onDismiss={entry.type === 'request' ? dismissRequest : undefined} />;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <AppHeader title={t('chats.header_title')} />
      {items.length === 0 ? (
        <View style={[styles.empty, { paddingBottom: tabBarInset }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.brandSubtle }]}>
            <Ionicons name="chatbubbles-outline" size={36} color={colors.brand} />
          </View>
          <AppText variant="heading" align="center">
            {t('chats.empty_title')}
          </AppText>
          <AppText variant="body" color="textSecondary" align="center">
            {t('chats.empty_subtitle')}
          </AppText>
          <Button label={t('chats.to_dating_button')} onPress={() => router.navigate('/')} style={styles.emptyButton} />
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
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionHeading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.tapTarget,
  },
  sectionTitle: {
    flexShrink: 1,
  },
  sectionAction: {
    minHeight: sizes.tapTarget,
    maxWidth: '45%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: sizes.tapTarget,
    height: sizes.tapTarget,
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
