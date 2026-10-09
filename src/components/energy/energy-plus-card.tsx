import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ENERGY_CONFIG } from '@/store/energy-store';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface EnergyPlusCardProps {
  onSubscribe: () => void;
}

export function EnergyPlusCard({ onSubscribe }: EnergyPlusCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.energyPlusCardBg, borderColor: colors.energyPlusCardBorder, borderWidth: 1 }]}>
      <View style={styles.header}>
        <AppText style={[styles.title, { color: colors.energyPlusCardText }]}>Energy+</AppText>
        <View style={[styles.badge, { backgroundColor: colors.energyPlusBadgeBg }]}>
          <AppText variant="caption" style={[styles.badgeText, { color: colors.energyPlusBadgeText }]}>
            Найвигідніше
          </AppText>
        </View>
      </View>

      <View style={styles.priceRow}>
        <AppText style={[styles.price, { color: colors.brand }]}>149 ₴</AppText>
        <AppText variant="body" color="textSecondary" style={styles.period}>
          {' '}
          / тиждень
        </AppText>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.energyPlusCardBorder }]} />

      <View style={styles.benefits}>
        <View style={styles.benefitRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.energyPlusBadgeBg }]}>
            <Ionicons name="flash" size={16} color={colors.energyPlusCardText} />
          </View>
          <AppText variant="body" style={styles.benefitText}>
            <AppText variant="bodyStrong">Ліміт 60</AppText> замість {ENERGY_CONFIG.renewableCap}
          </AppText>
        </View>
        <View style={styles.benefitRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.energyPlusBadgeBg }]}>
            <Ionicons name="time-outline" size={16} color={colors.energyPlusCardText} />
          </View>
          <AppText variant="body" style={styles.benefitText}>
            Відновлення вдвічі швидше · 1 кожні 6 хв
          </AppText>
        </View>
      </View>

      <Button label="Оформити підписку" onPress={onSubscribe} style={[styles.button, { backgroundColor: colors.brand }]} />
      
      <AppText variant="caption" color="textSecondary" align="center" style={styles.footnote}>
        Автоподовження · скасувати можна будь-коли
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
