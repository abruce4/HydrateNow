import React, { useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { withLayoutContext } from 'expo-router';
import type { MaterialTopTabNavigationEventMap, MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import type { ParamListBase, TabNavigationState } from '@react-navigation/native';

const { Navigator, Screen } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

interface TabBarProps {
  state: TabNavigationState<ParamListBase>;
  descriptors: Record<string, any>;
  navigation: any;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  const [activeTab, setActiveTab] = useState('track');
  
  // Video references with proper typing
  const trackVideoRef = useRef<Video>(null);
  const remindVideoRef = useRef<Video>(null);
  const insightsVideoRef = useRef<Video>(null);

  // Custom tab bar with video icons
  const CustomTabBar = ({ state, descriptors, navigation }: TabBarProps) => {
    return (
      <View style={styles.tabContainer}>
        {state.routes.map((route: {key: string, name: string}, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = state.index === index;
          
          const videoRef = 
            route.name === 'track' ? trackVideoRef : 
            route.name === 'remind' ? remindVideoRef : insightsVideoRef;
            
          const videoSource = 
            route.name === 'track' ? require('@/assets/videos/track.mp4') : 
            route.name === 'remind' ? require('@/assets/videos/remind.mp4') : 
            require('@/assets/videos/insights.mp4');
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
              setActiveTab(route.name);
              
              // Play video animation
              if (videoRef.current) {
                videoRef.current.setPositionAsync(0);
                videoRef.current.playAsync();
              }
            }
          };

          return (
            <Pressable
              key={index}
              onPress={onPress}
              style={styles.tab}
            >
              <View style={[styles.tabIconContainer, isFocused && styles.tabIconContainerFocused]}>
                <Video
                  ref={videoRef}
                  source={videoSource}
                  style={styles.tabVideo}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                  isLooping={false}
                  isMuted={true}
                />
              </View>
              <Text style={[
                styles.tabLabel, 
                { color: isFocused ? '#000' : '#9CA3AF' }
              ]}>
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </Text>
            </Pressable>
          );
        })}
        
        {/* Indicator */}
        <View style={[
          styles.indicator, 
          { 
            left: `${state.index * (100 / state.routes.length)}%`, 
            width: `${100 / state.routes.length}%` 
          } as any
        ]} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <MaterialTopTabs
        screenOptions={{
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#9CA3AF',
        }}
        tabBar={props => <CustomTabBar {...props} />}
      >
        <Screen
          name="track"
          options={{ title: 'Track' }}
          children={() => <React.Fragment />}
        />
        <Screen
          name="remind"
          options={{ title: 'Remind' }}
          children={() => <React.Fragment />}
        />
        <Screen
          name="insights"
          options={{ title: 'Insights' }}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 80,
    position: 'relative',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainerFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabVideo: {
    width: 40,
    height: 40,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#000',
  },
});
