import { Stack } from 'expo-router';

import { useIncomingRequests } from '@/hooks/use-incoming-requests';
import { useMotionPreferences } from '@/hooks/use-motion-preferences';
import { useTheme } from '@/theme/use-theme';

export default function AppLayout() {
  const { colors } = useTheme();
  const { reduceMotion } = useMotionPreferences();

  // Ініціативні повідомлення персонажів надходять, поки користувач у продуктовій частині.
  useIncomingRequests();

  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true, animation: reduceMotion ? 'none' : 'default', contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="character/[id]" options={{ presentation: 'modal', animation: reduceMotion ? 'none' : 'slide_from_bottom' }} />
      <Stack.Screen name="chat/[id]" options={{ animation: reduceMotion ? 'none' : 'default' }} />
      {/* Енергія відкривається з energy chip у header — окрема вкладка не потрібна. */}
      <Stack.Screen name="energy" options={{ animation: reduceMotion ? 'none' : 'default' }} />
    </Stack>
  );
}
