import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BootScreen } from '@/components/layout/boot-screen';
import { useAppReady } from '@/hooks/use-app-ready';
import { initPwaInstallListener } from '@/lib/pwa-install';
import { selectIsOnboarded, useSessionStore } from '@/store/session-store';
import { sizes } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

// beforeinstallprompt може прийти до монтування будь-якого екрана.
initPwaInstallListener();

export default function RootLayout() {
  const isReady = useAppReady();
  const isOnboarded = useSessionStore(selectIsOnboarded);
  const { isDark, colors } = useTheme();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.frame, { backgroundColor: colors.background }]}>
          {isReady ? (
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
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
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
