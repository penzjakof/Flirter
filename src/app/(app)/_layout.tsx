import { Stack } from 'expo-router';

import { useIncomingRequests } from '@/hooks/use-incoming-requests';
import { useTheme } from '@/theme/use-theme';

export default function AppLayout() {
  const { colors } = useTheme();

  // Ініціативні повідомлення персонажів надходять, поки користувач у продуктовій частині.
  useIncomingRequests();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="character/[id]" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
      {/* Енергія відкривається з energy chip у header — окрема вкладка не потрібна. */}
      <Stack.Screen name="energy" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
