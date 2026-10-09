import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import type { EnergyPackage } from '@/data/energy-packages';
import { pluralizeUk } from '@/lib/format';
import { ENERGY_CONFIG } from '@/store/energy-store';
import { radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const ICON_BOX = 44;
const MESSAGE_FORMS = ['повідомлення', 'повідомлення', 'повідомлень'] as const;

interface PackageOptionProps {
  pack: EnergyPackage;
  onPurchase: (pack: EnergyPackage) => void;
}

/** Пояснює цінність пакета в «живих» одиницях замість абстрактних ⚡. */
function describeValue(amount: number): string {
  const messages = Math.floor(amount / ENERGY_CONFIG.costs.textMessage);
  const photos = Math.floor(amount / ENERGY_CONFIG.costs.aiPhoto);
  return `≈ ${messages} ${pluralizeUk(messages, MESSAGE_FORMS)} або ${photos} фото`;
}

/**
 * Пакет енергії — сама картка є кнопкою покупки: тап одразу веде до оплати цього пакета
 * (без проміжного вибору й окремої CTA). Рекомендований пакет підсвічений брендом.
 */
export function PackageOption({ pack, onPurchase }: PackageOptionProps) {
  const { colors } = useTheme();
  const isRecommended = Boolean(pack.isRecommended);

  return (
    <Pressable
      testID={`energy-package-${pack.id}`}
      onPress={() => onPurchase(pack)}
      accessibilityRole="button"
      accessibilityLabel={`Купити ${pack.amount} енергії. ${describeValue(pack.amount)}${isRecommended ? '. Рекомендуємо' : ''}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isRecommended ? colors.brandSubtle : colors.surface,
          borderColor: isRecommended ? colors.brand : colors.border,
        },
        pressed && styles.pressed,
      ]}>
      <View
        style={[
          styles.icon,
          { backgroundColor: isRecommended ? colors.brand : colors.energySurface },
        ]}>
        <Ionicons name="flash" size={sizes.icon} color={isRecommended ? colors.textOnBrand : colors.energyText} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="heading">{pack.amount} ⚡</AppText>
          {isRecommended && (
            <View style={[styles.badge, { backgroundColor: colors.brand }]}>
              <AppText variant="caption" color="textOnBrand">
                Рекомендуємо
              </AppText>
            </View>
          )}
        </View>
        <AppText variant="secondary" color="textSecondary">
          {describeValue(pack.amount)}
        </AppText>
      </View>

      <View
        style={[
          styles.buy,
          { backgroundColor: isRecommended ? colors.brand : colors.brandSubtle },
        ]}>
        <AppText variant="secondary" color={isRecommended ? 'textOnBrand' : 'brand'} style={styles.buyText}>
          Купити
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  icon: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  buy: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  buyText: {
    fontWeight: '700',
  },
});
