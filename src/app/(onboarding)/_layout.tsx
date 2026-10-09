import { Stack } from 'expo-router';

import { useTheme } from '@/theme/use-theme';

export const unstable_settings = {
  initialRouteName: 'welcome',
};

export default function OnboardingLayout() {
  const { colors } = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="age" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="disclosure" />
    </Stack>
  );
}
