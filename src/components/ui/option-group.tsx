import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export interface Option<TValue extends string> {
  value: TValue;
  label: string;
}

interface OptionGroupProps<TValue extends string> {
  label: string;
  options: readonly Option<TValue>[];
  value: TValue | null;
  onChange: (value: TValue | null) => void;
  testIDPrefix?: string;
}

/** Група radio-опцій у вигляді «пігулок». Повторний тап знімає вибір (поле необов’язкове). */
export function OptionGroup<TValue extends string>({ label, options, value, onChange, testIDPrefix }: OptionGroupProps<TValue>) {
  const { colors } = useTheme();

  return (
    <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <AppText variant="bodyStrong">{label}</AppText>
      <View style={styles.options}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              testID={testIDPrefix ? `${testIDPrefix}-${option.value}` : undefined}
              onPress={() => onChange(isSelected ? null : option.value)}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected, checked: isSelected }}
              aria-checked={isSelected}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: isSelected ? colors.brandSubtle : colors.surface,
                  borderColor: isSelected ? colors.brand : colors.border,
                },
                pressed && styles.pressed,
              ]}>
              <AppText variant="bodyStrong" color={isSelected ? 'brand' : 'textPrimary'}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.md,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    minHeight: sizes.tapTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});

