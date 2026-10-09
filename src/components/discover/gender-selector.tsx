import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GENDER_OPTIONS } from '@/data/filter-options';
import type { GenderFilter } from '@/models/types';
import { colors, radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface GenderSelectorProps {
  value: GenderFilter;
  onChange: (value: GenderFilter) => void;
}

/** Іконковий селектор гендеру (один обов’язковий вибір) для S09. */
export function GenderSelector({ value, onChange }: GenderSelectorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Кого показувати">
      {GENDER_OPTIONS.map((option) => {
        const isSelected = option.value === value;
        const contentColor = isSelected ? colors.brand : colors.textSecondary;
        return (
          <Pressable
            key={option.value}
            testID={`sheet-gender-${option.value}`}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isSelected, checked: isSelected }}
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: colors.surfaceMuted, borderColor: colors.transparent },
              isSelected && [styles.tileSelected, { backgroundColor: colors.brandSubtle, borderColor: colors.brand }],
              pressed && styles.pressed,
            ]}>
            {option.icon && <Ionicons name={option.icon} size={sizes.icon} color={contentColor} />}
            <AppText variant="caption" style={{ color: isSelected ? colors.brand : colors.textSecondary }} numberOfLines={1}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    minHeight: sizes.actionButton,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.transparent,
  },
  tileSelected: {
    backgroundColor: colors.brandSubtle,
    borderColor: colors.brand,
  },
  pressed: {
    opacity: 0.7,
  },
});
