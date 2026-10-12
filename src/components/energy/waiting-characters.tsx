import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { getCharacterById } from '@/data/characters';
import type { Character } from '@/models/types';
import { useChatsStore } from '@/store/chats-store';
import { colors, radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const MAX_AVATARS = 4;
const AVATAR_OVERLAP = -12;

/** Персонажі, чиє останнє повідомлення залишилось без відповіді користувача (найсвіжіші — першими). */
function useWaitingCharacters(): Character[] {
  const conversations = useChatsStore((state) => state.conversations);

  return useMemo(() => {
    return Object.values(conversations)
      .map((conversation) => ({ conversation, last: conversation.messages[conversation.messages.length - 1] }))
      .filter(({ last }) => last?.author === 'character')
      .sort((a, b) => (b.last?.createdAt ?? 0) - (a.last?.createdAt ?? 0))
      .map(({ conversation }) => getCharacterById(conversation.characterId))
      .filter((character): character is Character => Boolean(character));
  }, [conversations]);
}

/** Мотиваційний блок S19: показує, на кого витратити енергію. Прихований, якщо ніхто не чекає. */
export function WaitingCharacters() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const characters = useWaitingCharacters();
  if (characters.length === 0) return null;

  const visible = characters.slice(0, MAX_AVATARS);
  const label =
    characters.length === 1
      ? t('chat.waiting_chats.one')
      : t('chat.waiting_chats.other', { count: characters.length });

  return (
    <Pressable
      testID="energy-waiting"
      onPress={() => router.navigate('/chats')}
      accessibilityRole="button"
      accessibilityLabel={t('chat.waiting_chats.row_accessibility', { label })}
      style={({ pressed }) => [styles.card, { backgroundColor: pressed ? colors.surfaceMuted : colors.surface, borderColor: colors.cardBorderSubtle }]}>
      <View style={styles.avatars}>
        {visible.map((character, index) => (
          <View key={character.id} style={index > 0 && styles.overlap}>
            <Avatar source={character.photos[0]} size={sizes.avatarSm} ringColor={colors.surface} />
          </View>
        ))}
      </View>
      <View style={styles.textContainer}>
        <AppText variant="secondary" style={styles.label} numberOfLines={1}>
          {label}
        </AppText>
        <AppText variant="secondary" color="textSecondary">
          {t('character.continue_chat')}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={sizes.iconSm} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(33, 28, 36, 0.06)',
    minHeight: sizes.tapTarget,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  avatars: {
    flexDirection: 'row',
  },
  overlap: {
    marginLeft: AVATAR_OVERLAP,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontWeight: '700',
  },
});
