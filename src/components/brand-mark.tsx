import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface BrandMarkProps {
  size?: number;
  showWordmark?: boolean;
  inverted?: boolean;
}

/** Власна айдентика Flirter: серце-бульбашка + wordmark. */
export function BrandMark({ size = 32, showWordmark = true, inverted = false }: BrandMarkProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="Flirter">
      <View
        style={[
          styles.badge,
          { width: size, height: size, borderRadius: size * 0.3 },
          { backgroundColor: inverted ? colors.surface : colors.brand },
        ]}>
        <Ionicons name="heart" size={size * 0.58} color={inverted ? colors.brand : colors.textOnBrand} />
      </View>
      {showWordmark && (
        <AppText variant="heading" color={inverted ? 'textOnMedia' : 'textPrimary'} style={styles.wordmark}>
          flirter
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  wordmark: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
