import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ENERGY_PACKAGES, type EnergyPackage } from '@/data/energy-packages';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface EnergyPackagesListProps {
  onPurchase?: (pack: EnergyPackage) => void;
}

export function EnergyPackagesList({ onPurchase }: EnergyPackagesListProps) {
  const available = Boolean(onPurchase);
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.cardBorderSubtle }]}>
      {ENERGY_PACKAGES.map((pack, index) => {
        const isRecommended = Boolean(pack.isRecommended);
        const isLast = index === ENERGY_PACKAGES.length - 1;

        return (
          <View key={pack.id}>
            <Pressable
              testID={`energy-package-${pack.id}`}
              disabled={!available}
              accessibilityRole="button"
              accessibilityState={{ disabled: !available }}
              accessibilityLabel={`${t('energy.packages.amount_energy', { amount: pack.amount })}. ${available ? t('energy.packages.price_uah', { price: pack.price }) : t('common.coming_soon')}`}
              onPress={onPurchase ? () => onPurchase(pack) : undefined}
              style={({ pressed }) => [
                styles.row,
                isRecommended && [styles.rowRecommended, { backgroundColor: colors.energyPlusCardBg }],
                pressed && styles.pressed,
              ]}>
              <View style={styles.left}>
                <AppText variant="bodyStrong" style={isRecommended ? [styles.textRecommended, { color: colors.energyPlusCardText }] : undefined}>
                  {t('energy.packages.amount_energy', { amount: pack.amount })}
                </AppText>
                {isRecommended && (
                  <View style={[styles.badge, { backgroundColor: colors.energyPlusBadgeBg }]}>
                    <AppText variant="caption" style={[styles.badgeText, { color: colors.energyPlusBadgeText }]}>
                      {t('energy.packages.badge_recommended')}
                    </AppText>
                  </View>
                )}
              </View>

              <View style={styles.right}>
                <AppText variant="bodyStrong" style={isRecommended ? [styles.textRecommended, { color: colors.energyPlusCardText }] : undefined}>
                  {available ? t('energy.packages.price_uah', { price: pack.price }) : t('common.coming_soon')}
                </AppText>
                {available && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
              </View>
            </Pressable>
            {!isLast && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(33, 28, 36, 0.06)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  rowRecommended: {
    backgroundColor: '#FDF2F6',
  },
  pressed: {
    opacity: 0.8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  textRecommended: {
    color: '#5A122D',
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
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
