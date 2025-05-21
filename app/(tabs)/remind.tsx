import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Switch, Platform, TouchableOpacity, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CARD_SHADOW = {
  elevation: 4,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
};

export default function RemindScreen() {
  const [is9amEnabled, setIs9amEnabled] = useState(false);
  const [is1pmEnabled, setIs1pmEnabled] = useState(false);
  const [is5pmEnabled, setIs5pmEnabled] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const loadPreferences = async () => {
      try {
        const nineAm = await AsyncStorage.getItem('9amReminder');
        setIs9amEnabled(nineAm === 'true');
        const onePm = await AsyncStorage.getItem('1pmReminder');
        setIs1pmEnabled(onePm === 'true');
        const fivePm = await AsyncStorage.getItem('5pmReminder');
        setIs5pmEnabled(fivePm === 'true');
      } catch (e) {
        console.error('Failed to load preferences.', e);
      }
    };
    loadPreferences();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await Notifications.getPermissionsAsync(); // Ensure channel is created on Android
    }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
  };

  const scheduleNotification = async (hour: number, minute: number, enabled: boolean, id: string) => {
    if (enabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💧 Time to Hydrate! 💧",
          body: 'Don\'t forget to drink some water.',
        },
        trigger: {
          hour: hour,
          minute: minute,
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
        },
        identifier: id,
      });
      console.log(`Notification ${id} scheduled for ${hour}:${minute}`);
    } else {
      await Notifications.cancelScheduledNotificationAsync(id);
      console.log(`Notification ${id} cancelled`);
    }
  };

  const toggleSwitch = async (time: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(`${time}Reminder`, value.toString());
      let hour = 0;
      const minute = 0;
      const id = `${time}Reminder`;

      if (time === '9am') {
        setIs9amEnabled(value);
        hour = 9;
      } else if (time === '1pm') {
        setIs1pmEnabled(value);
        hour = 13;
      } else if (time === '5pm') {
        setIs5pmEnabled(value);
        hour = 17;
      }
      await scheduleNotification(hour, minute, value, id);
    } catch (e) {
      console.error('Failed to save preference or schedule notification.', e);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.screenTitle}>Reminder Settings</ThemedText>

      <View style={styles.card}>
        <ThemedText style={styles.cardTitle}>Preset Daily Reminders</ThemedText>
        <View style={styles.reminderRow}>
          <MaterialCommunityIcons name="clock-time-nine-outline" size={26} color="#555" style={styles.reminderIcon} />
          <ThemedText style={styles.reminderText}>9:00 AM</ThemedText>
          <Switch
            trackColor={{ false: '#d1d5db', true: '#60a5fa' }}
            thumbColor={is9amEnabled ? '#3b82f6' : '#f4f3f4'}
            ios_backgroundColor="#e5e7eb"
            onValueChange={(value) => toggleSwitch('9am', value)}
            value={is9amEnabled}
          />
        </View>

        <View style={styles.reminderRow}>
          <MaterialCommunityIcons name="clock-time-one-outline" size={26} color="#555" style={styles.reminderIcon} />
          <ThemedText style={styles.reminderText}>1:00 PM</ThemedText>
          <Switch
            trackColor={{ false: '#d1d5db', true: '#60a5fa' }}
            thumbColor={is1pmEnabled ? '#3b82f6' : '#f4f3f4'}
            ios_backgroundColor="#e5e7eb"
            onValueChange={(value) => toggleSwitch('1pm', value)}
            value={is1pmEnabled}
          />
        </View>

        <View style={styles.reminderRow}>
          <MaterialCommunityIcons name="clock-time-five-outline" size={26} color="#555" style={styles.reminderIcon} />
          <ThemedText style={styles.reminderText}>5:00 PM</ThemedText>
          <Switch
            trackColor={{ false: '#d1d5db', true: '#60a5fa' }}
            thumbColor={is5pmEnabled ? '#3b82f6' : '#f4f3f4'}
            ios_backgroundColor="#e5e7eb"
            onValueChange={(value) => toggleSwitch('5pm', value)}
            value={is5pmEnabled}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => alert('Custom Reminders are a premium feature!')}
      >
        <Ionicons name="add-circle-outline" size={28} color="#fff" />
        <Text style={styles.actionButtonText}>Custom Reminders (Premium)</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'flex-start', // Align items to the start
    paddingHorizontal: 15,
    paddingTop: 60, // Match track.tsx
    backgroundColor: '#f3f4f6', // Match track.tsx
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#1f2937',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 25,
    ...CARD_SHADOW,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reminderIcon: {
    marginRight: 15,
  },
  reminderText: {
    fontSize: 18,
    color: '#374151',
    flex: 1, // Allow text to take available space
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6', // Main action color from track.tsx
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    width: '100%', // Make button full width similar to track.tsx
    ...CARD_SHADOW,
    marginTop: 10, // Add some margin on top
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  // Separator is no longer used with card layout
  // separator: {
  //   marginVertical: 30,
  //   height: 1,
  //   width: '80%',
  //   backgroundColor: '#e5e7eb',
  // },
}); 