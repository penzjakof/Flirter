import { Stack } from 'expo-router';

import { useTheme } from '@/theme/use-theme';
import { useMotionPreferences } from '@/hooks/use-motion-preferences';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function OnboardingLayout() {
  const { colors } = useTheme();
  const { reduceMotion } = useMotionPreferences();

  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true, contentStyle: { backgroundColor: colors.background }, animation: reduceMotion ? 'none' : 'default' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="age" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="disclosure" />
    </Stack>
  );
}
