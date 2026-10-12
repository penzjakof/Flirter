import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={t('discover.sheet.who_to_show')}>
      {GENDER_OPTIONS.map((option) => {
        const isSelected = option.value === value;
        const contentColor = isSelected ? colors.brandText : colors.textSecondary;
        const localizedLabel = t(`discover.filter_options.gender.${option.value}` as const, { defaultValue: option.label });
        return (
          <Pressable
            key={option.value}
            testID={`sheet-gender-${option.value}`}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={localizedLabel}
            accessibilityState={{ selected: isSelected, checked: isSelected }}
            aria-checked={isSelected}
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: colors.surfaceMuted, borderColor: colors.transparent },
              isSelected && [styles.tileSelected, { backgroundColor: colors.brandSubtle, borderColor: colors.brand }],
              pressed && styles.pressed,
            ]}>
            {option.icon && <Ionicons name={option.icon} size={sizes.icon} color={contentColor} />}
            <AppText variant="caption" style={{ color: contentColor }} numberOfLines={1}>
              {localizedLabel}
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
