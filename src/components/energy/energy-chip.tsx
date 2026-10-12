import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GlassSurface } from '@/components/ui/glass-surface';
import { useEnergy } from '@/hooks/use-energy';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Компактний постійно видимий баланс енергії. Тап → магазин (S19). */
export function EnergyChip() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { total } = useEnergy();
  const glassTint = colors.energySurface + 'A6'; // 65% прозорості для видимості блюру

  return (
    <Pressable
      testID="energy-chip"
      onPress={() => router.navigate('/energy')}
      accessibilityRole="button"
      accessibilityLabel={t('energy.chip_accessibility', { total })}
      style={styles.chip}>
      {({ pressed }) => (
        <>
          <GlassSurface style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]} tintColor={glassTint} />
          <View style={[styles.inner, pressed && styles.pressedInner]}>
            <Ionicons name="flash" size={16} color={colors.energyIcon} />
            <AppText variant="bodyStrong" color="energyText">
              {total}
            </AppText>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 44,
    borderRadius: radius.pill,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  pressedInner: {
    opacity: 0.6,
  },
});
