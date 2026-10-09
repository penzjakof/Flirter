import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GlassSurface } from '@/components/ui/glass-surface';
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

const CHIP_HEIGHT = 40;
/** Компенсуємо візуальну висоту до мінімального tap target 44. */
const HIT_SLOP = (sizes.tapTarget - CHIP_HEIGHT) / 2;

/** Мінімалістичний чіп-перемикач для мультивибору (фільтри): без рамки, м’який фон. */
export function SelectableChip({ label, selected, onPress, icon, testID }: SelectableChipProps) {
  const { colors, isDark } = useTheme();
  // Для темної теми скло — це ледь помітний білий (15%), для світлої — "молочне" напівпрозоре біле скло (60%)
  const unselectedColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.6)';
  // Додаємо 65% прозорості (A6) до кольору бренду, щоб крізь нього працював блюр
  const backgroundColor = selected ? colors.brand + 'A6' : unselectedColor;
  const contentColor = selected ? colors.textOnBrand : colors.textPrimary;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      hitSlop={HIT_SLOP}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      style={styles.chip}>
      {({ pressed }) => (
        <>
          <GlassSurface style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]} tintColor={backgroundColor} />
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
    height: CHIP_HEIGHT,
    borderRadius: radius.pill,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md + 2,
  },
  pressedInner: {
    opacity: 0.6,
  },
  label: {
    fontWeight: '500',
  },
});

