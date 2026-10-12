import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ENERGY_CONFIG } from '@/store/energy-store';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface EnergyPlusCardProps {
  onSubscribe?: () => void;
}

export function EnergyPlusCard({ onSubscribe }: EnergyPlusCardProps) {
  const available = Boolean(onSubscribe);
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.energyPlusCardBg, borderColor: colors.energyPlusCardBorder, borderWidth: 1 }]}>
      <View style={styles.header}>
        <AppText style={[styles.title, { color: colors.energyPlusCardText }]}>
          {t('energy.subscription_card.title')}
        </AppText>
        <View style={[styles.badge, { backgroundColor: colors.energyPlusBadgeBg }]}>
          <AppText variant="caption" style={[styles.badgeText, { color: colors.energyPlusBadgeText }]}>
          {available ? t('energy.subscription_card.badge_best_value') : t('common.coming_soon')}
          </AppText>
        </View>
      </View>

      {available && <View style={styles.priceRow}>
        <AppText style={[styles.price, { color: colors.brand }]}>
          {t('energy.subscription_card.price')}
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.period}>
          {t('energy.subscription_card.period')}
        </AppText>
      </View>}

      <View style={[styles.divider, { backgroundColor: colors.energyPlusCardBorder }]} />

      <View style={styles.benefits}>
        <View style={styles.benefitRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.energyPlusBadgeBg }]}>
            <Ionicons name="flash" size={16} color={colors.energyPlusCardText} />
          </View>
          <AppText variant="body" style={styles.benefitText}>
            {t('energy.subscription_card.feature_limit', { cap: ENERGY_CONFIG.renewableCap })}
          </AppText>
        </View>
        <View style={styles.benefitRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.energyPlusBadgeBg }]}>
            <Ionicons name="time-outline" size={16} color={colors.energyPlusCardText} />
          </View>
          <AppText variant="body" style={styles.benefitText}>
            {t('energy.subscription_card.feature_speed')}
          </AppText>
        </View>
      </View>

      <Button
        label={available ? t('energy.subscription_card.subscribe_button') : t('common.coming_soon')}
        disabled={!available}
        onPress={onSubscribe}
        style={[styles.button, { backgroundColor: colors.brand }]}
      />
      
      <AppText variant="caption" color="textSecondary" align="center" style={styles.footnote}>
        {available ? t('energy.subscription_card.footnote') : t('energy.payment_prototype_modal.description')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FDF2F6',
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5A122D',
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: '#F7DDE6',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  badgeText: {
    color: '#9A1D4B',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: -spacing.md,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9A1D4B',
  },
  period: {
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(182, 36, 90, 0.1)',
  },
  benefits: {
    gap: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F7DDE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
  },
  button: {
    backgroundColor: '#9A1D4B',
  },
  footnote: {
    marginTop: -spacing.xs,
    fontSize: 11,
  },
});
