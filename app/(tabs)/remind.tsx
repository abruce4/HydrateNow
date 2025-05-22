import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Switch, Platform, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import useHydrationStore from '@/stores/hydrationStore';

// Configure notification handler with custom appearance
Notifications.setNotificationHandler({
  handleNotification: async () => {
    const { dailyGoal, currentIntake } = useHydrationStore.getState();
    const percentage = Math.min(Math.round((currentIntake / dailyGoal) * 100), 100);
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
      // New iOS options will be used in the presentation
    };
  },
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
  { id: '8am', timeLabel: '08:00 AM', hour: 8, minute: 0, enabled: false },
  { id: '11am', timeLabel: '11:00 AM', hour: 11, minute: 0, enabled: false },
  { id: '2pm', timeLabel: '02:00 PM', hour: 14, minute: 0, enabled: false },
  { id: '5pm', timeLabel: '05:00 PM', hour: 17, minute: 0, enabled: false },
  { id: '8pm', timeLabel: '08:00 PM', hour: 20, minute: 0, enabled: false },
];

// Create a notification category for interactive notifications
async function setupNotificationCategories() {
  await Notifications.setNotificationCategoryAsync('hydration_reminder', [
    {
      identifier: 'done',
      buttonTitle: 'Done',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'remind_later',
      buttonTitle: 'Remind me later',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
        opensAppToForeground: false,
      },
    },
  ]);
}

export default function RemindScreen() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const { dailyGoal, currentIntake, addIntake } = useHydrationStore();
  const [isSending, setIsSending] = useState(false);

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
    setupNotificationCategories();
    
    // Set up notification response listener
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      if (response.actionIdentifier === 'done') {
        // User marked as done, add a glass of water (250ml)
        addIntake(250);
        Alert.alert('Great job!', '250ml of water added to your daily intake.');
      } else if (response.actionIdentifier === 'remind_later') {
        // Schedule a reminder for 30 minutes later
        scheduleReminderNotification(30);
      }
    });
    
    return () => {
      responseListener.remove();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('hydration_reminders', {
        name: 'Hydration Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
        sound: 'default',
      });
    }
    
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please enable notifications to receive hydration reminders.');
      return false;
    }
    return true;
  };

  const sendTestNotification = async () => {
    setIsSending(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsSending(false);
        return;
      }
      
      const { dailyGoal, currentIntake } = useHydrationStore.getState();
      const percentage = Math.min(Math.round((currentIntake / dailyGoal) * 100), 100);
      
      // Using scheduleNotificationAsync with null trigger to show immediately
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Stay Hydrated!",
          body: "Drink 1 glass of water",
          data: { percentage },
          categoryIdentifier: 'hydration_reminder',
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
      
      Alert.alert('Success', 'Test notification sent. You should see it shortly.');
    } catch (error) {
      console.error('Failed to send notification:', error);
      Alert.alert('Error', 'Could not send test notification. Please check permissions.');
    } finally {
      setIsSending(false);
    }
  };

  const scheduleReminderNotification = async (minutesLater: number) => {
    const { dailyGoal, currentIntake } = useHydrationStore.getState();
    const percentage = Math.min(Math.round((currentIntake / dailyGoal) * 100), 100);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Stay Hydrated!",
        body: "Drink 1 glass of water",
        data: { percentage },
        categoryIdentifier: 'hydration_reminder',
        sound: 'default',
      },
      trigger: {
        seconds: minutesLater * 60,
        channelId: 'hydration_reminders',
      },
    });
  };

  const scheduleNotification = async (hour: number, minute: number, enabled: boolean, id: string) => {
    const notificationId = `reminder_${id}`;
    
    if (enabled) {
      const { dailyGoal, currentIntake } = useHydrationStore.getState();
      const percentage = Math.min(Math.round((currentIntake / dailyGoal) * 100), 100);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Stay Hydrated!",
          body: "Drink 1 glass of water",
          data: { percentage },
          categoryIdentifier: 'hydration_reminder',
          sound: 'default',
        },
        trigger: {
          hour: hour,
          minute: minute,
          repeats: true,
          channelId: 'hydration_reminders',
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
      
      <View style={styles.testButtonContainer}>
        <TouchableOpacity 
          style={styles.testButton}
          onPress={sendTestNotification}
          disabled={isSending}
        >
          <Ionicons name="notifications" size={24} color="#ffffff" style={styles.buttonIcon} />
          <ThemedText style={styles.testButtonText}>
            {isSending ? "Sending..." : "Send Test Notification"}
          </ThemedText>
        </TouchableOpacity>
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
    fontSize: 24,
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
  testButtonContainer: {
    width: '100%',
    paddingHorizontal: 15,
    marginTop: 10,
  },
  testButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    ...CARD_SHADOW,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
}); 