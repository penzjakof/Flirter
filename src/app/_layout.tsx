import { useEffect } from 'react';
import { LocaleProvider, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BootScreen } from '@/components/layout/boot-screen';
import { AppFrame } from '@/components/layout/app-frame';
import { useAppReady } from '@/hooks/use-app-ready';
import { useMotionPreferences } from '@/hooks/use-motion-preferences';
import { useWebViewport } from '@/hooks/use-web-viewport';
import { initI18n } from '@/i18n';
import { initPwaInstallListener } from '@/lib/pwa-install';
import { selectIsRTL, selectResolvedLanguage, useLanguageStore } from '@/store/language-store';
import { selectIsOnboarded, useSessionStore } from '@/store/session-store';
import { sizes } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

// Ініціалізація підсистеми локалізації перед монтуванням дерева компонентів
initI18n();

// beforeinstallprompt може прийти до монтування будь-якого екрана.
initPwaInstallListener();

export default function RootLayout() {
  useWebViewport();
  const { reduceMotion } = useMotionPreferences();
  const isReady = useAppReady();
  const isOnboarded = useSessionStore(selectIsOnboarded);
  const { isDark, colors } = useTheme();
  const isRTL = useLanguageStore(selectIsRTL);
  const resolvedLanguage = useLanguageStore(selectResolvedLanguage);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = resolvedLanguage;
    }
  }, [isRTL, resolvedLanguage]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = colors.background;
    document.body.style.backgroundColor = colors.background;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute('content', colors.background);
    });
  }, [colors.background]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LocaleProvider direction={isRTL ? 'rtl' : 'ltr'}>
          <AppFrame
            style={[styles.frame, { backgroundColor: colors.background }]}
            {...(Platform.OS === 'web' ? ({ dir: isRTL ? 'rtl' : 'ltr' } as Record<string, unknown>) : {})}
          >
            {isReady ? (
              <Stack screenOptions={{ headerShown: false, animation: reduceMotion ? 'none' : 'default', contentStyle: { backgroundColor: colors.background } }}>
                {/* Без завершених вікового контролю, входу та AI-disclosure — лише онбординг (F01). */}
                <Stack.Protected guard={!isOnboarded}>
                  <Stack.Screen name="(onboarding)" />
                </Stack.Protected>
                <Stack.Protected guard={isOnboarded}>
                  <Stack.Screen name="(app)" />
                </Stack.Protected>
              </Stack>
            ) : (
              <BootScreen />
            )}
          </AppFrame>
        </LocaleProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  // На desktop — центральна колонка, функції ті самі (03 §5).
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? sizes.maxContentWidth : undefined,
    alignSelf: 'center',
    overflow: 'hidden',
  },
});
