import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import type { Character } from '@/models/types';
import { colors, radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const CARD_ASPECT_RATIO = 3 / 4;
const ACTION_SIZE = 40;
const ACTION_HIT_SLOP = (sizes.tapTarget - ACTION_SIZE) / 2;
const SCRIM_COLORS = ['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.78)'] as const;
const SCRIM_LOCATIONS = [0.35, 0.6, 1] as const;

interface CharacterGridCardProps {
  character: Character;
  width: number;
  hasConversation: boolean;
  onOpenProfile: (characterId: string) => void;
  /** Like (немає розмови) або перехід у чат (розмова вже є). */
  onPrimaryAction: (characterId: string) => void;
}

/**
 * Картка персонажа в сітці S08: фото 3:4, ім’я/вік на підкладці, швидка дія.
 * Відкриття профілю і кнопка дії — сусідні Pressable (не вкладені), щоб уникнути
 * «button inside button» на web.
 */
function CharacterGridCardComponent({ character, width, hasConversation, onOpenProfile, onPrimaryAction }: CharacterGridCardProps) {
  const { colors } = useTheme();
  const actionLabel = hasConversation ? `Відкрити чат з ${character.name}` : `Вподобати ${character.name}`;

  return (
    <View style={[styles.card, { width, backgroundColor: colors.surfaceMuted }]}>
      <Pressable
        testID={`grid-card-${character.id}`}
        onPress={() => onOpenProfile(character.id)}
        accessibilityRole="button"
        accessibilityLabel={`${character.name}, ${character.age}. ${character.tagline}. Відкрити профіль`}
        style={({ pressed }) => [StyleSheet.absoluteFill, pressed && styles.pressed]}>
        <Image
          source={character.photos[0]}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="top"
          transition={150}
          accessibilityIgnoresInvertColors
        />
        <LinearGradient colors={SCRIM_COLORS} locations={SCRIM_LOCATIONS} style={StyleSheet.absoluteFill} />
      </Pressable>

      <View style={[styles.bottomRow, styles.passThrough]}>
        <View style={[styles.info, styles.noPointer]}>
          <AppText variant="bodyStrong" color="textOnMedia" numberOfLines={1}>
            {character.name}, <AppText variant="body" color="textOnMedia">{character.age}</AppText>
          </AppText>
          <AppText variant="caption" color="textOnMedia" numberOfLines={2} style={styles.tagline}>
            {character.tagline}
          </AppText>
        </View>
        <Pressable
          testID={`grid-action-${character.id}`}
          onPress={() => onPrimaryAction(character.id)}
          hitSlop={ACTION_HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: colors.surface },
            hasConversation && [styles.actionChat, { backgroundColor: colors.brand }],
            pressed && styles.actionPressed,
          ]}>
          <Ionicons
            name={hasConversation ? 'chatbubble' : 'heart'}
            size={sizes.iconSm}
            color={hasConversation ? colors.textOnBrand : colors.brand}
          />
        </Pressable>
      </View>
    </View>
  );
}

export const CharacterGridCard = memo(CharacterGridCardComponent);

const styles = StyleSheet.create({
  card: {
    aspectRatio: CARD_ASPECT_RATIO,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  // Текст не перехоплює тапи — вони йдуть у Pressable профілю під ним.
  passThrough: {
    pointerEvents: 'box-none',
  },
  noPointer: {
    pointerEvents: 'none',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  info: {
    flex: 1,
    paddingBottom: spacing.xxs,
  },
  tagline: {
    opacity: 0.9,
    fontWeight: '400',
  },
  action: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  actionChat: {
    backgroundColor: colors.brand,
  },
  actionPressed: {
    transform: [{ scale: 0.92 }],
  },
});
