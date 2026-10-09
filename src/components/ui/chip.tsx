import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface ChipProps {
  label: string;
  tone?: 'neutral' | 'brand' | 'onMedia';
}

export function Chip({ label, tone = 'neutral' }: ChipProps) {
  const { colors } = useTheme();

  const backgroundColors = {
    neutral: colors.surfaceMuted,
    brand: colors.brandSubtle,
    onMedia: 'rgba(255, 255, 255, 0.22)',
  };

  return (
    <View style={[styles.chip, { backgroundColor: backgroundColors[tone] }]}>
      <AppText
        variant="secondary"
        color={tone === 'onMedia' ? 'textOnMedia' : tone === 'brand' ? 'brand' : 'textPrimary'}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
});

