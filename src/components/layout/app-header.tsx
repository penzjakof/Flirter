import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { EnergyChip } from '@/components/energy/energy-chip';
import { AppText } from '@/components/ui/app-text';
import { colors, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

interface AppHeaderProps {
  title?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

/** Header основних вкладок: назва + енергія (видима на всіх продуктових екранах). */
export function AppHeader({ title, leading, trailing }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leading}>
        {leading ?? (
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
        )}
      </View>
      <View style={styles.trailing}>
        {trailing}
        <EnergyChip />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: sizes.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  leading: {
    flexShrink: 1,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
