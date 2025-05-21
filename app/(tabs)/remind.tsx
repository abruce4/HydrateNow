import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Switch, Platform, TouchableOpacity, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

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

interface Reminder {
  id: string;
  timeLabel: string;
  hour: number;
  minute: number;
  enabled: boolean;
}

const initialReminders: Reminder[] = [
  { id: '8am', timeLabel: '08:00', hour: 8, minute: 0, enabled: false },
  { id: '11am', timeLabel: '11:00', hour: 11, minute: 0, enabled: false },
  { id: '2pm', timeLabel: '14:00', hour: 14, minute: 0, enabled: false },
  { id: '5pm', timeLabel: '17:00', hour: 17, minute: 0, enabled: false },
  { id: '8pm', timeLabel: '20:00', hour: 20, minute: 0, enabled: false },
];

export default function RemindScreen() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const updatedReminders = await Promise.all(
          initialReminders.map(async (reminder) => {
            const storedValue = await AsyncStorage.getItem(`reminder_${reminder.id}`);
            return { ...reminder, enabled: storedValue === 'true' };
          })
        );
        setReminders(updatedReminders);
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
    const notificationId = `reminder_${id}`;
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
        identifier: notificationId,
      });
      console.log(`Notification ${notificationId} scheduled for ${hour}:${minute}`);
    } else {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Notification ${notificationId} cancelled`);
    }
  };

  const toggleSwitch = async (reminderId: string, value: boolean) => {
    try {
      const updatedReminders = reminders.map((r) =>
        r.id === reminderId ? { ...r, enabled: value } : r
      );
      setReminders(updatedReminders);
      await AsyncStorage.setItem(`reminder_${reminderId}`, value.toString());

      const reminderToUpdate = updatedReminders.find(r => r.id === reminderId);
      if (reminderToUpdate) {
        await scheduleNotification(reminderToUpdate.hour, reminderToUpdate.minute, value, reminderToUpdate.id);
      }
    } catch (e) {
      console.error('Failed to save preference or schedule notification.', e);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.screenTitle}>Hydration Reminders</ThemedText>
      <ThemedText style={styles.subtitle}>Stay on track with timely alerts</ThemedText>

      <View style={styles.card}>
        {reminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderRow}>
            <Ionicons 
              name={reminder.enabled ? "notifications" : "notifications-outline"} 
              size={26} 
              color={reminder.enabled ? "#3b82f6" : "#9ca3af"} // Blue if enabled, gray if not
              style={styles.reminderIcon} 
            />
            <ThemedText style={styles.reminderText}>{reminder.timeLabel}</ThemedText>
            <Switch
              trackColor={{ false: '#d1d5db', true: '#60a5fa' }}
              thumbColor={reminder.enabled ? '#3b82f6' : '#f4f3f4'}
              ios_backgroundColor="#e5e7eb"
              onValueChange={(newValue) => toggleSwitch(reminder.id, newValue)}
              value={reminder.enabled}
            />
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 60,
    backgroundColor: '#f3f4f6',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
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
    flex: 1,
  },
}); 