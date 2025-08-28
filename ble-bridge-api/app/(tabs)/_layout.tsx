import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: {
          fontSize: 18,
          fontWeight: '700',
          marginTop: 1,
          marginBottom: 2,
        },
        tabBarStyle: Platform.select({
          default: {
            height: 90,
            paddingBottom: 4,
            paddingTop: 2,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'WebSocket',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="wifi" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'BLE Devices',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="antenna.radiowaves.left.and.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Logs',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet.rectangle" color={color} />,
        }}
      />
    </Tabs>
  );
}
