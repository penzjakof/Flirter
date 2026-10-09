import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { formatMessageTime } from '@/lib/format';
import type { ChatMessage } from '@/models/types';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface MessageBubbleProps {
  message: ChatMessage;
}

const LIKE_STICKER_SIZE = 72;
const LIKE_ICON_SIZE = 36;

/** Бульбашка повідомлення. Стабільна макс. ширина — рядки не надто довгі. */
export function MessageBubble({ message }: MessageBubbleProps) {
  const { colors } = useTheme();
  const kind = message.kind ?? 'text';

  if (kind === 'disclaimer') return <DisclaimerMessage text={message.text} />;
  if (kind === 'like') return <LikeSticker message={message} />;

  if (message.author === 'system') {
    return (
      <View style={styles.systemWrapper} accessibilityRole="text">
        <AppText variant="secondary" color="textSecondary" align="center">
          {message.text}
        </AppText>
      </View>
    );
  }

  const isOutgoing = message.author === 'user';

  return (
    <View style={[styles.row, isOutgoing ? styles.rowOutgoing : styles.rowIncoming]}>
      <View
        style={[
          styles.bubble,
          isOutgoing
            ? [styles.outgoing, { backgroundColor: colors.brand }]
            : [styles.incoming, { backgroundColor: colors.surface, borderColor: colors.border }],
        ]}>
        <AppText variant="body" color={isOutgoing ? 'textOnBrand' : 'textPrimary'} selectable>
          {message.text}
        </AppText>
        <AppText
          variant="caption"
          color={isOutgoing ? 'textOnBrand' : 'textSecondary'}
          style={[styles.time, isOutgoing && styles.timeOutgoing]}>
          {formatMessageTime(message.createdAt)}
        </AppText>
      </View>
    </View>
  );
}

/** Службове AI-нагадування: перше в історії, тихий сірий підпис по центру, без кнопок. */
function DisclaimerMessage({ text }: { text: string }) {
  return (
    <View style={styles.disclaimer} accessibilityRole="text" testID="chat-ai-disclaimer">
      <AppText variant="caption" color="textSecondary" align="center" style={styles.disclaimerText}>
        {text}
      </AppText>
    </View>
  );
}

/** Стікер симпатії від користувача — праворуч, як вихідне повідомлення. */
function LikeSticker({ message }: { message: ChatMessage }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, styles.rowOutgoing]} accessibilityRole="text" accessibilityLabel={message.text} testID="chat-like-sticker">
      <View style={styles.sticker}>
        <View style={[styles.stickerCircle, { backgroundColor: colors.brand }]}>
          <Ionicons name="heart" size={LIKE_ICON_SIZE} color={colors.textOnBrand} />
        </View>
        <AppText variant="caption" color="textSecondary">
          {message.text} · {formatMessageTime(message.createdAt)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xxs + 1,
  },
  rowIncoming: {
    justifyContent: 'flex-start',
  },
  rowOutgoing: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md + 2,
    paddingTop: spacing.sm + 2,
    paddingBottom: spacing.sm,
    borderRadius: radius.bubble,
    gap: spacing.xxs,
  },
  incoming: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.sm - 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outgoing: {
    backgroundColor: colors.brand,
    borderBottomRightRadius: radius.sm - 2,
  },
  time: {
    alignSelf: 'flex-end',
    fontSize: 11,
  },
  timeOutgoing: {
    opacity: 0.8,
  },
  systemWrapper: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
  },
  disclaimer: {
    alignSelf: 'center',
    maxWidth: 280,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  disclaimerText: {
    fontWeight: '400',
  },
  sticker: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  stickerCircle: {
    width: LIKE_STICKER_SIZE,
    height: LIKE_STICKER_SIZE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    transform: [{ rotate: '-8deg' }],
  },
});
