import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
  testID?: string;
}

/** Мінімалістичний чіп-перемикач для мультивибору (фільтри): без рамки, м’який фон. */
export function SelectableChip({ label, selected, onPress, icon, testID }: SelectableChipProps) {
  const { colors } = useTheme();
  // Filters belong to the content layer; solid materials also maintain the selected label's contrast.
  const backgroundColor = selected ? colors.brand : colors.surfaceMuted;
  const contentColor = selected ? colors.textOnBrand : colors.textPrimary;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      style={[styles.chip, { backgroundColor }]}>
      {({ pressed }) => (
        <>
          <View style={[styles.inner, pressed && styles.pressedInner]}>
            {icon && <Ionicons name={icon} size={sizes.iconSm - 4} color={contentColor} />}
            <AppText variant="secondary" style={[styles.label, { color: contentColor }]}>
              {label}
            </AppText>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: sizes.tapTarget,
    maxWidth: '100%',
    borderRadius: radius.pill,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
  },
  pressedInner: {
    opacity: 0.6,
  },
  label: {
    fontWeight: '500',
    flexShrink: 1,
  },
});

