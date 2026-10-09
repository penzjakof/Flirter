import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/ui/app-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconButton } from '@/components/ui/icon-button';
import { useEnergy } from '@/hooks/use-energy';
import { formatCountdown } from '@/lib/format';
import { ENERGY_CONFIG } from '@/store/energy-store';
import { colors, radius, spacing, sizes } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface InsufficientEnergySheetProps {
  visible: boolean;
  requiredAmount: number;
  actionLabel: string;
  onClose: () => void;
}

export function InsufficientEnergySheet({ visible, onClose }: InsufficientEnergySheetProps) {
  const { colors } = useTheme();
  const { total, msUntilNext } = useEnergy();
  const maxEnergy = ENERGY_CONFIG.renewableCap; // Maximum renewable capacity

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Header section with Close button absolute top right */}
        <View style={styles.headerRow}>
          <AppText variant="title" style={styles.title}>
            Енергія закінчилась
          </AppText>
          <View style={[styles.closeButtonWrapper, { backgroundColor: colors.surfaceMuted }]}>
            <IconButton icon="close" size={sizes.iconSm} onPress={onClose} accessibilityLabel="Закрити" />
          </View>
        </View>

        <AppText variant="body" color="textSecondary" style={styles.subtitle}>
          Поповни енергію, щоб продовжити розмову
        </AppText>

        {/* Energy bar row */}
        <View style={styles.energyBarContainer}>
          <View style={[styles.energyIconBox, { backgroundColor: colors.surfaceMuted }]}>
            <Ionicons name="flash" size={16} color={colors.textPrimary} />
          </View>
          <View style={[styles.energyTrack, { backgroundColor: colors.surfaceMuted }]}>
            {msUntilNext > 0 && (
              <AppText variant="caption" color="textSecondary" style={styles.countdownInside}>
                +1 через {formatCountdown(msUntilNext)}
              </AppText>
            )}
          </View>
          <AppText variant="bodyStrong" style={[styles.energyText, { color: colors.textPrimary }]}>
            {total} із {maxEnergy}
          </AppText>
        </View>

        {/* Subscription Card */}
        <View style={[styles.subCard, { backgroundColor: colors.energyPlusCardBg, borderColor: colors.energyPlusCardBorder }]}>
          <View style={styles.subHeader}>
            <View style={styles.subTitleRow}>
              <AppText variant="title" style={[styles.subTitleText, { color: colors.energyPlusCardText }]}>Energy+</AppText>
              <View style={[styles.subBadge, { backgroundColor: colors.energyPlusBadgeBg }]}>
                <AppText variant="caption" style={[styles.subBadgeText, { color: colors.energyPlusBadgeText }]}>Найвигідніше</AppText>
              </View>
            </View>
            <View style={styles.subPriceBox}>
              <AppText variant="heading" style={styles.subPrice}>149 ₴</AppText>
              <AppText variant="secondary" color="textSecondary" style={styles.subPricePeriod}> / тиждень</AppText>
            </View>
          </View>

          <View style={styles.subFeatures}>
            <View style={styles.subFeatureRow}>
              <Ionicons name="flash" size={16} color={colors.brand} />
              <AppText variant="body">Ліміт 60 енергії</AppText>
            </View>
            <View style={styles.subFeatureRow}>
              <Ionicons name="time" size={16} color={colors.brand} />
              <AppText variant="body">Відновлення вдвічі швидше</AppText>
            </View>
          </View>

          <Pressable style={[styles.subButton, { backgroundColor: colors.brand }]} onPress={() => {}}>
            <AppText variant="button" color="textOnBrand">Оформити підписку</AppText>
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.dividerBox}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <AppText variant="secondary" color="textSecondary" style={styles.dividerText}>або разово</AppText>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* One-time purchases */}
        <View style={styles.packagesBox}>
          {/* 50 Energy */}
          <Pressable style={[styles.packageOption, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.packageOptionLeft}>
              <Ionicons name="flash" size={20} color={colors.brand} />
              <AppText style={styles.packageAmountText}>50 <AppText variant="body">енергії</AppText></AppText>
            </View>
            <View style={styles.packageOptionRight}>
              <AppText style={styles.packagePriceText}>49 ₴</AppText>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </View>
          </Pressable>

          {/* 150 Energy (Recommended) */}
          <Pressable style={[styles.packageOption, styles.packageOptionRecommended, { backgroundColor: colors.energyPlusCardBg, borderColor: colors.energyPlusCardBorder }]}>
            <View style={styles.packageOptionLeft}>
              <Ionicons name="flash" size={20} color={colors.brand} />
              <AppText style={styles.packageAmountText}>150 <AppText variant="body">енергії</AppText></AppText>
              <View style={[styles.recommendedBadge, { backgroundColor: colors.energyPlusBadgeBg }]}>
                <AppText style={[styles.recommendedBadgeText, { color: colors.energyPlusBadgeText }]}>Рекомендовано</AppText>
              </View>
            </View>
            <View style={styles.packageOptionRight}>
              <AppText style={styles.packagePriceText}>129 ₴</AppText>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </View>
          </Pressable>

          {/* 400 Energy */}
          <Pressable style={[styles.packageOption, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.packageOptionLeft}>
              <Ionicons name="flash" size={20} color={colors.brand} />
              <AppText style={styles.packageAmountText}>400 <AppText variant="body">енергії</AppText></AppText>
            </View>
            <View style={styles.packageOptionRight}>
              <AppText style={styles.packagePriceText}>299 ₴</AppText>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </View>
          </Pressable>
        </View>

        <Pressable style={styles.notNowButton} onPress={onClose}>
          <AppText style={[styles.notNowText, { color: colors.textSecondary }]}>Не зараз</AppText>
        </Pressable>

      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    flex: 1,
  },
  closeButtonWrapper: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
    marginTop: spacing.xxs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  energyBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  energyIconBox: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyTrack: {
    flex: 1,
    height: 24, // increased to fit the text inside
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownInside: {
    fontSize: 12,
    fontWeight: '500',
  },
  energyText: {
    color: colors.textPrimary,
    flexShrink: 0,
  },
  subCard: {
    backgroundColor: '#FDF2F5', // very light pink
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F3D2DF',
    marginBottom: spacing.md,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subTitleText: {
    color: '#8A1538', // Darker brand for Energy+
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subBadge: {
    backgroundColor: '#F3D2DF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  subBadgeText: {
    color: '#8A1538',
    fontSize: 10,
    fontWeight: '700',
  },
  subPriceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  subPrice: {
    fontSize: 18,
    fontWeight: '800',
  },
  subPricePeriod: {
    fontSize: 13,
  },
  subFeatures: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  subFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subFeatureIcon: {
    width: 20,
    alignItems: 'center',
  },
  subButton: {
    backgroundColor: '#982755', // Brand color
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBE5E8',
  },
  dividerText: {
    fontSize: 13,
  },
  packagesBox: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  packageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#EBE5E8',
    backgroundColor: colors.surface,
  },
  packageOptionRecommended: {
    backgroundColor: '#FDF2F5',
    borderColor: '#F3D2DF',
  },
  packageOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  packageOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recommendedBadge: {
    backgroundColor: '#F3D2DF',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginLeft: spacing.xxs,
  },
  recommendedBadgeText: {
    color: '#8A1538',
    fontSize: 10,
    fontWeight: '700',
  },
  packageAmountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  packagePriceText: {
    fontSize: 16,
    fontWeight: '800',
  },
  notNowButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  notNowText: {
    color: '#6C626C',
    fontSize: 15,
    fontWeight: '500',
  },
});
