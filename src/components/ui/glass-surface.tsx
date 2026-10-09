import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type ColorValue, type StyleProp, type ViewStyle } from 'react-native';

import { shadows } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Нативне «рідке скло» доступне лише на iOS 26+; деінде — світла напівпрозора поверхня з backdrop blur. */
const HAS_NATIVE_LIQUID_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable();

/**
 * CSS backdrop-filter (web/PWA): сильне розмиття + підсилена насиченість і яскравість —
 * саме це дає «світле» скло як у iOS/Telegram, а не сірий напівпрозорий шар.
 * У типах RN цих властивостей немає, тому приводимо тип явно.
 */
const WEB_BACKDROP = Platform.select<ViewStyle>({
  web: { backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' } as ViewStyle,
  default: {},
});

export interface GlassSurfaceProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  tintColor?: ColorValue;
  colorScheme?: 'auto' | 'light' | 'dark';
}

/** Поверхня в стилі iOS Liquid Glass: плаваючі панелі, tab bar, composer. */
export function GlassSurface({
  children,
  style,
  testID,
  tintColor,
  colorScheme,
}: GlassSurfaceProps) {
  const { colors, isDark } = useTheme();
  
  const defaultColorScheme = isDark ? 'dark' : 'light';
  // Нативний Liquid Glass iOS в dark mode використовує свої вбудовані матеріали (без tint).
  const defaultTintColor = isDark ? undefined : 'rgba(255, 255, 255, 0.40)';

  if (HAS_NATIVE_LIQUID_GLASS) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme={colorScheme ?? defaultColorScheme}
        tintColor={tintColor ?? defaultTintColor}
        isInteractive
        style={[styles.base, style]}
        testID={testID}>
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        styles.base,
        styles.fallback,
        {
          backgroundColor: tintColor ?? colors.glass,
          borderColor: colors.glassBorder,
        },
        WEB_BACKDROP,
        style,
      ]}
      testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  fallback: {
    borderWidth: 1,
    ...shadows.glass,
  },
});

