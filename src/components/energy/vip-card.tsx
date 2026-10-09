import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { VIP_BENEFITS } from '@/data/energy-packages';
import { radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** VIP-картка S19 на темному преміальному градієнті. Підписка ще не підключена — чесне «Незабаром». */
export function VipCard() {
  const { colors } = useTheme();

  return (
    <LinearGradient colors={[colors.premiumInk, colors.premiumDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="diamond" size={sizes.icon} color={colors.premiumGold} />
          <AppText variant="heading" color="textOnMedia">
            Flirter VIP
          </AppText>
        </View>
        <View style={[styles.soonPill, { borderColor: colors.premiumGold }]}>
          <AppText variant="caption" style={{ color: colors.premiumGold }}>
            Незабаром
          </AppText>
        </View>
      </View>

      <View style={styles.benefits}>
        {VIP_BENEFITS.map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={sizes.icon} color={colors.premiumGold} />
            <AppText variant="body" color="textOnMedia" style={styles.benefitText}>
              {benefit}
            </AppText>
          </View>
        ))}
      </View>

      <AppText variant="caption" style={[styles.muted, { color: colors.textOnPremiumMuted }]}>
        Ціну, період і умови скасування буде показано до оплати.
      </AppText>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  soonPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  benefits: {
    gap: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  benefitText: {
    flex: 1,
  },
  muted: {},
});
