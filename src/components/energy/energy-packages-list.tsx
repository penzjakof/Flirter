import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ENERGY_PACKAGES, type EnergyPackage } from '@/data/energy-packages';
import { colors, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface EnergyPackagesListProps {
  onPurchase: (pack: EnergyPackage) => void;
}

export function EnergyPackagesList({ onPurchase }: EnergyPackagesListProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.cardBorderSubtle }]}>
      {ENERGY_PACKAGES.map((pack, index) => {
        const isRecommended = Boolean(pack.isRecommended);
        const isLast = index === ENERGY_PACKAGES.length - 1;

        return (
          <View key={pack.id}>
            <Pressable
              onPress={() => onPurchase(pack)}
              style={({ pressed }) => [
                styles.row,
                isRecommended && [styles.rowRecommended, { backgroundColor: colors.energyPlusCardBg }],
                pressed && styles.pressed,
              ]}>
              <View style={styles.left}>
                <AppText variant="bodyStrong" style={isRecommended ? [styles.textRecommended, { color: colors.energyPlusCardText }] : undefined}>
                  {pack.amount} енергії
                </AppText>
                {isRecommended && (
                  <View style={[styles.badge, { backgroundColor: colors.energyPlusBadgeBg }]}>
                    <AppText variant="caption" style={[styles.badgeText, { color: colors.energyPlusBadgeText }]}>
                      Рекомендовано
                    </AppText>
                  </View>
                )}
              </View>

              <View style={styles.right}>
                <AppText variant="bodyStrong" style={isRecommended ? [styles.textRecommended, { color: colors.energyPlusCardText }] : undefined}>
                  {pack.price} ₴
                </AppText>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
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
