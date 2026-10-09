import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { GlassTabBar } from '@/components/layout/glass-tab-bar';
import { selectTotalUnread, useChatsStore } from '@/store/chats-store';
import { useTheme } from '@/theme/use-theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(active: IconName, inactive: IconName) {
  function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
  }
  return TabIcon;
}

/** Нижня навігація: Знайомства / Чати / Профіль (03 §2) — плаваюча glass-«пігулка». Енергія — через chip у header. */
export default function TabsLayout() {
  const { colors } = useTheme();
  const unreadCount = useChatsStore(selectTotalUnread);

  return (
    <Tabs
      // Плаваючий Liquid Glass tab bar; екрани самі резервують місце знизу (useFloatingTabBarInset).
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Знайомства', tabBarIcon: tabIcon('flame', 'flame-outline') }} />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Чати',
          tabBarIcon: tabIcon('chatbubbles', 'chatbubbles-outline'),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Профіль', tabBarIcon: tabIcon('person', 'person-outline') }} />
    </Tabs>
  );
}
