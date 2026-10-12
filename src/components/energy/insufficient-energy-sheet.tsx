import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BalanceCard } from '@/components/energy/balance-card';
import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { useEnergy } from '@/hooks/use-energy';
import { spacing } from '@/theme/tokens';

interface InsufficientEnergySheetProps {
  visible: boolean;
  requiredAmount: number;
  actionLabel: string;
  onClose: () => void;
}

/** Real balance and regeneration; unavailable payments never masquerade as active actions. */
export function InsufficientEnergySheet({ visible, requiredAmount, actionLabel, onClose }: InsufficientEnergySheetProps) {
  const { t } = useTranslation();
  const { total, isFull, msUntilNext } = useEnergy();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('energy.insufficient_sheet.title')}>
      <View style={styles.content}>
        <AppText variant="body" color="textSecondary">
          {actionLabel} · {requiredAmount} ⚡
        </AppText>
        <BalanceCard total={total} isFull={isFull} msUntilNext={msUntilNext} />
        <AppText variant="secondary" color="textSecondary">
          {t('energy.payment_prototype_modal.description')}
        </AppText>
        <Button label={t('energy.insufficient_sheet.not_now')} onPress={onClose} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({ content: { gap: spacing.lg } });
