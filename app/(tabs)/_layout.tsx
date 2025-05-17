import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { withLayoutContext } from 'expo-router';

const { Navigator, Screen } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <MaterialTopTabs
        screenOptions={{
          tabBarActiveTintColor: tintColor,
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarIndicatorStyle: { backgroundColor: tintColor },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          tabBarStyle: { 
            backgroundColor: '#fff',
            shadowOpacity: 0,
            elevation: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb'
          },
          tabBarShowIcon: true,
          tabBarPressColor: 'transparent',
        }}
      >
        <Screen
          name="track"
          options={{
            title: 'Track',
            tabBarIcon: ({ color }) => <IconSymbol size={20} name="drop.fill" color={color} />,
          }}
          children={() => <React.Fragment />}
        />
        <Screen
          name="remind"
          options={{
            title: 'Remind',
            tabBarIcon: ({ color }) => <IconSymbol size={20} name="bell.fill" color={color} />,
          }}
          children={() => <React.Fragment />}
        />
        <Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color }) => <IconSymbol size={20} name="chart.bar.fill" color={color} />,
          }}
          children={() => <React.Fragment />}
        />
      </MaterialTopTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
