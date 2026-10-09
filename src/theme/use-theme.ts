import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useThemeStore } from '@/store/theme-store';
import {
  darkColors,
  lightColors,
  type ColorToken,
  type ResolvedTheme,
  type ThemeColors,
  type ThemeMode,
} from '@/theme/tokens';

export interface UseThemeResult {
  mode: ThemeMode;
  theme: ResolvedTheme;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
}

export function useTheme(): UseThemeResult {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const theme: ResolvedTheme = useMemo(() => {
    if (mode === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemScheme]);

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return {
    mode,
    theme,
    isDark,
    colors,
    setMode,
  };
}

export function useThemeColor(token: ColorToken): string {
  const { colors } = useTheme();
  return colors[token];
}

export function useThemedStyles<T>(factory: (colors: ThemeColors, isDark: boolean) => T): T {
  const { colors, isDark } = useTheme();
  return useMemo(() => factory(colors, isDark), [factory, colors, isDark]);
}
