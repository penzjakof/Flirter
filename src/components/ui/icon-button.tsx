import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { GlassSurface } from '@/components/ui/glass-surface';
import { radius, sizes, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  size?: number;
  badgeCount?: number;
  testID?: string;
  variant?: 'ghost' | 'glass';
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  color,
  size = sizes.icon,
  badgeCount,
  testID,
  variant = 'ghost',
}: IconButtonProps) {
  const { colors, isDark } = useTheme();
  const iconColor = color ?? colors.textPrimary;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={spacing.xs}
      style={({ pressed }) => [
        styles.button,
        variant === 'ghost' && pressed && { backgroundColor: colors.surfaceMuted },
      ]}>
      {({ pressed }) => (
        <>
          {variant === 'glass' && (
            <GlassSurface
              style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]}
              tintColor={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)'}
            />
          )}
          <View style={[styles.inner, variant === 'glass' && pressed && styles.pressedInner]}>
            <Ionicons name={icon} size={size} color={iconColor} />
            {badgeCount !== undefined && badgeCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.brand }]}>
                <AppText variant="caption" color="textOnBrand">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </AppText>
              </View>
            )}
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: sizes.tapTarget,
    height: sizes.tapTarget,
    borderRadius: radius.pill,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedInner: {
    opacity: 0.6,
  },
  badge: {
    position: 'absolute',
    top: spacing.xxs,
    right: spacing.xxs,
    minWidth: 18,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
});

