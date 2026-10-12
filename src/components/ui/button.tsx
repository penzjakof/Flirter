import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { radius, sizes, spacing, type ColorToken, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: ComponentProps<typeof Ionicons>['name'];
  trailing?: ReactNode;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function getVariantStyles(colors: ThemeColors): Record<
  ButtonVariant,
  { background: string; pressed: string; text: ColorToken; border?: string }
> {
  return {
    primary: { background: colors.brand, pressed: colors.brandPressed, text: 'textOnBrand' },
    secondary: { background: colors.surface, pressed: colors.surfaceMuted, text: 'textPrimary', border: colors.border },
    ghost: { background: colors.transparent, pressed: colors.brandSubtle, text: 'brandText' },
    danger: { background: colors.surface, pressed: colors.surfaceMuted, text: 'danger', border: colors.border },
  };
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  trailing,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const { colors } = useTheme();
  const variantStyles = getVariantStyles(colors);
  const variantStyle = variantStyles[variant];
  const textColor = colors[variantStyle.text];
  const isInactive = disabled || loading || !onPress;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      aria-busy={loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? variantStyle.pressed : variantStyle.background,
          borderColor: variantStyle.border ?? colors.transparent,
        },
        isInactive && styles.inactive,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={sizes.icon} color={textColor} />}
          <AppText variant="button" color={variantStyle.text} style={styles.label}>
            {label}
          </AppText>
          {trailing}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.buttonHeight,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inactive: {
    opacity: 0.45,
  },
  label: { flexShrink: 1, textAlign: 'center' },
});
