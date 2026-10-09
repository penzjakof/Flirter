import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { colors, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * S25: спокійний екран відновлення сесії замість «спалаху» Welcome.
 * Також є статичним HTML до гідрації.
 */
export function BootScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} accessibilityLabel="Відновлюємо сесію" accessibilityLiveRegion="polite">
      <BrandMark size={56} showWordmark={false} />
      <ActivityIndicator color={colors.brand} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  spinner: {
    marginTop: spacing.xl,
  },
});
