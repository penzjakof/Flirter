import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceCard } from '@/components/energy/balance-card';
import { EnergyPackagesList } from '@/components/energy/energy-packages-list';
import { EnergyPlusCard } from '@/components/energy/energy-plus-card';
import { WaitingCharacters } from '@/components/energy/waiting-characters';
import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import type { EnergyPackage } from '@/data/energy-packages';
import { useEnergy } from '@/hooks/use-energy';
import { colors, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * S19. Енергія — окремий екран стеку (відкривається з energy chip у header).
 * Порядок: баланс і його цінність → на кого витратити → пакети (тап = покупка) → VIP.
 * Оплата не підключена — чесно повідомляємо в bottom sheet.
 */
export default function EnergyScreen() {
  const { colors } = useTheme();
  const { total, isFull, msUntilNext } = useEnergy();
  const [pendingPackage, setPendingPackage] = useState<EnergyPackage | null>(null);

  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const closePaymentSheet = () => setPendingPackage(null);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton icon="chevron-back" onPress={handleBack} accessibilityLabel="Назад" testID="energy-back" />
        <AppText variant="title" accessibilityRole="header">
          Енергія
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <BalanceCard total={total} isFull={isFull} msUntilNext={msUntilNext} />

        <WaitingCharacters />

        <View style={styles.section}>
          <AppText variant="title" style={styles.sectionTitle}>Більше енергії з підпискою</AppText>
          <EnergyPlusCard onSubscribe={() => setPendingPackage({ id: 'large', amount: 999, price: 149 })} />
        </View>

        <View style={styles.section}>
          <AppText variant="title" style={styles.sectionTitle}>Разове поповнення</AppText>
          <EnergyPackagesList onPurchase={setPendingPackage} />
        </View>
      </ScrollView>

      <BottomSheet
        visible={pendingPackage !== null}
        onClose={closePaymentSheet}
        title={pendingPackage ? `${pendingPackage.amount} ⚡ — оплата незабаром` : 'Оплата незабаром'}>
        <AppText variant="body" color="textSecondary">
          Оплату ще не підключено — це прототип. Ціни з’являться після інтеграції платіжного провайдера, і ти побачиш їх до
          підтвердження покупки.
        </AppText>
        <Button label="Зрозуміло" onPress={closePaymentSheet} testID="energy-payment-close" />
      </BottomSheet>
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
