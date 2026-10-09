import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { formatCountdown, pluralizeUk } from '@/lib/format';
import { ENERGY_CONFIG } from '@/store/energy-store';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const HERO_IMAGE = require('@/assets/illustrations/energy-hero.jpg');
const HERO_IMAGE_SIZE = 116;
const MESSAGE_FORMS = ['повідомлення', 'повідомлення', 'повідомлень'] as const;

interface EnergyHeroCardProps {
  total: number;
  isFull: boolean;
  msUntilNext: number;
}

/** Hero S19: великий баланс, що він означає в повідомленнях, і таймер безкоштовного відновлення. */
export function EnergyHeroCard({ total, isFull, msUntilNext }: EnergyHeroCardProps) {
  const { colors } = useTheme();
  const progress = isFull ? 1 : Math.min(1, Math.max(0, 1 - msUntilNext / ENERGY_CONFIG.regenIntervalMs));
  const messagesLeft = Math.floor(total / ENERGY_CONFIG.costs.textMessage);
  const progressPercent = Math.round(progress * 100);

  return (
    <LinearGradient colors={[colors.premiumDeep, colors.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.balance}>
          <AppText variant="secondary" style={[styles.muted, { color: colors.textOnPremiumMuted }]}>
            Твій баланс
          </AppText>
          <AppText variant="hero" color="textOnMedia" style={styles.amount} testID="energy-total">
            {total} <AppText variant="title" style={{ color: colors.premiumGold }}>⚡</AppText>
          </AppText>
          <AppText variant="bodyStrong" color="textOnMedia">
            ≈ {messagesLeft} {pluralizeUk(messagesLeft, MESSAGE_FORMS)}
          </AppText>
        </View>
        <Image source={HERO_IMAGE} style={styles.image} contentFit="cover" accessibilityIgnoresInvertColors />
      </View>

      <View style={styles.regen}>
        <View style={styles.regenRow}>
          <AppText variant="caption" style={[styles.muted, { color: colors.textOnPremiumMuted }]}>
            {isFull ? `Безкоштовний запас повний · ${ENERGY_CONFIG.renewableCap} ⚡` : 'Безкоштовно +1 ⚡'}
          </AppText>
          {!isFull && (
            <AppText variant="caption" color="textOnMedia">
              через {formatCountdown(msUntilNext)}
            </AppText>
          )}
        </View>
        <View
          style={[styles.track, { backgroundColor: colors.premiumTrack }]}
          accessibilityRole="progressbar"
          accessibilityLabel="Прогрес до наступної одиниці енергії"
          accessibilityValue={{ min: 0, max: 100, now: progressPercent }}>
          <View style={[styles.fill, { width: `${progressPercent}%`, backgroundColor: colors.premiumGold }]} />
        </View>
      </View>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  balance: {
    flex: 1,
    gap: spacing.xxs,
  },
  muted: {},
  amount: {
    fontSize: 48,
    lineHeight: 54,
  },
  image: {
    width: HERO_IMAGE_SIZE,
    height: HERO_IMAGE_SIZE,
    borderRadius: radius.card,
  },
  regen: {
    gap: spacing.xs,
  },
  regenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
