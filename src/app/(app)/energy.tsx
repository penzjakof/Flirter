import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceCard } from '@/components/energy/balance-card';
import { EnergyPackagesList } from '@/components/energy/energy-packages-list';
import { EnergyPlusCard } from '@/components/energy/energy-plus-card';
import { WaitingCharacters } from '@/components/energy/waiting-characters';
import { AppText } from '@/components/ui/app-text';
import { IconButton } from '@/components/ui/icon-button';
import { useEnergy } from '@/hooks/use-energy';
import { colors, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * S19. Енергія — окремий екран стеку (відкривається з energy chip у header).
 * Balance → conversations → upcoming subscription/packages. Purchases are disabled until payment integration.
 */
export default function EnergyScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { total, isFull, msUntilNext } = useEnergy();

  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton icon="chevron-back" onPress={handleBack} accessibilityLabel={t('common.back')} testID="energy-back" />
        <AppText variant="title" accessibilityRole="header">
          {t('energy.title')}
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <BalanceCard total={total} isFull={isFull} msUntilNext={msUntilNext} />

        <WaitingCharacters />

        <View style={styles.section}>
          <AppText variant="title" style={styles.sectionTitle}>
            {t('energy.subscription')}
          </AppText>
          <EnergyPlusCard />
        </View>

        <View style={styles.section}>
          <AppText variant="title" style={styles.sectionTitle}>
            {t('energy.one_time')}
          </AppText>
          <EnergyPackagesList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: sizes.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.xs,
    paddingRight: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
