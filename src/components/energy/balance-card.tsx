import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { formatCountdown } from '@/lib/format';
import { ENERGY_CONFIG } from '@/store/energy-store';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface BalanceCardProps {
  total: number;
  isFull: boolean;
  msUntilNext: number;
}

export function BalanceCard({ total, isFull, msUntilNext }: BalanceCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const progress = isFull ? 1 : Math.min(1, Math.max(0, 1 - msUntilNext / ENERGY_CONFIG.regenIntervalMs));
  const progressPercent = Math.round(progress * 100);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorderSubtle }]}>
      <View style={styles.row}>
        <View style={styles.amountContainer}>
          <Ionicons name="flash" size={36} color={colors.brand} style={styles.flashIcon} />
          <AppText style={[styles.amountText, { color: colors.textPrimary }]}>{total}</AppText>
          <AppText variant="title" color="textSecondary" style={styles.outOf}>/ {ENERGY_CONFIG.renewableCap}</AppText>
        </View>

        {!isFull && (
          <View style={styles.timerContainer}>
            <AppText variant="secondary" color="textSecondary">
              {t('energy.insufficient_sheet.regen_countdown', { time: formatCountdown(msUntilNext) })}
            </AppText>
          </View>
        )}
      </View>

      <View
        style={[styles.track, { backgroundColor: colors.energyTrackBg }]}
        accessibilityRole="progressbar"
        accessibilityLabel={t('energy.hero_card.progress_accessibility')}
        accessibilityValue={{ min: 0, max: 100, now: progressPercent }}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
        <View style={[styles.fill, { width: `${progressPercent}%`, backgroundColor: colors.brand }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(33, 28, 36, 0.06)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountText: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  flashIcon: {
    marginRight: 4,
  },
  outOf: {
    marginTop: 12,
    marginLeft: 2,
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: '#EAE5E8',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: '#9A1D4B',
  },
});
