import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Switch, Platform, TouchableOpacity, Alert, ScrollView, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import useHydrationStore from '@/stores/hydrationStore';
import { Stack } from 'expo-router';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Swipeable } from 'react-native-gesture-handler';

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
  isCustom?: boolean;
}

const initialReminders: Reminder[] = [
  { id: '8am', timeLabel: '08:00 AM', hour: 8, minute: 0, enabled: false, isCustom: false },
  { id: '11am', timeLabel: '11:00 AM', hour: 11, minute: 0, enabled: false, isCustom: false },
  { id: '2pm', timeLabel: '02:00 PM', hour: 14, minute: 0, enabled: false, isCustom: false },
  { id: '5pm', timeLabel: '05:00 PM', hour: 17, minute: 0, enabled: false, isCustom: false },
  { id: '8pm', timeLabel: '08:00 PM', hour: 20, minute: 0, enabled: false, isCustom: false },
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

// Helper function to format time
const formatTime = (hour: number, minute: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedMinute = minute < 10 ? `0${minute}` : minute;
  return `${formattedHour}:${formattedMinute} ${period}`;
};

export default function RemindScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const { addIntake } = useHydrationStore();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Process initialReminders to check their stored 'enabled' state
        const processedInitialReminders = await Promise.all(
          initialReminders.map(async (reminder) => {
            const storedValue = await AsyncStorage.getItem(`reminder_${reminder.id}`);
            // If storedValue is null (e.g., after deletion), it will be disabled
            return { ...reminder, enabled: storedValue === 'true' }; 
          })
        );

        // Load custom reminders
        const customRemindersJson = await AsyncStorage.getItem('custom_reminders');
        let loadedCustomReminders: Reminder[] = [];
        if (customRemindersJson) {
          loadedCustomReminders = JSON.parse(customRemindersJson).map((r: Reminder) => ({...r, isCustom: true}));
        }
        
        // Combine and set reminders, ensuring custom reminders override defaults if IDs clash (though unlikely)
        const combinedReminders = [...processedInitialReminders];
        loadedCustomReminders.forEach(customReminder => {
          const index = combinedReminders.findIndex(r => r.id === customReminder.id);
          if (index !== -1) {
            combinedReminders[index] = customReminder; // Replace if ID exists (e.g. custom was somehow saved with default ID)
          } else {
            combinedReminders.push(customReminder);
          }
        });

        setReminders(combinedReminders);

      } catch (e) {
        console.error('Failed to load preferences.', e);
        setReminders(initialReminders); // Fallback to initialReminders if loading fails
      }
    };
    
    loadPreferences();
    requestPermissions();
    setupNotificationCategories();
    
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      if (response.actionIdentifier === 'done') {
        addIntake(250);
        Alert.alert('Great job!', '250ml of water added to your daily intake.');
      } else if (response.actionIdentifier === 'remind_later') {
        scheduleReminderNotification(30);
      }
    });
    
    return () => {
      responseListener.remove();
    };
  }, [addIntake]);

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
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Stay Hydrated!",
          body: "Drink 1 glass of water",
          data: { id }, // Pass reminder ID for potential interactions
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
      
      if (reminderToUpdate?.isCustom) {
        const customReminders = updatedReminders.filter(r => r.isCustom);
        await AsyncStorage.setItem('custom_reminders', JSON.stringify(customReminders));
      }
    } catch (e) {
      console.error('Failed to save preference or schedule notification.', e);
    }
  };
  
  const handleConfirmDateTime = async (date: Date) => {
    setDatePickerVisibility(false);
    try {
      const hour = date.getHours();
      const minute = date.getMinutes();
      const timeLabel = formatTime(hour, minute);
      const id = `custom_${Date.now()}`;
      
      const newReminder: Reminder = {
        id,
        timeLabel,
        hour,
        minute,
        enabled: true,
        isCustom: true
      };
      
      // Add to current reminders state
      const newRemindersList = [...reminders, newReminder];
      setReminders(newRemindersList);
      
      // Save its enabled state
      await AsyncStorage.setItem(`reminder_${id}`, 'true');
      // Update the full list of custom reminders
      const customReminders = newRemindersList.filter(r => r.isCustom);
      await AsyncStorage.setItem('custom_reminders', JSON.stringify(customReminders));
      
      await scheduleNotification(hour, minute, true, id);
      
      setTimeout(() => Alert.alert('Success', `Reminder set for ${timeLabel}`), 0);

    } catch (e) {
      console.error('Failed to add custom reminder:', e);
      setTimeout(() => Alert.alert('Error', 'Could not add custom reminder. Please try again.'),0);
    }
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const showDatePicker = () => {
    setSelectedTime(new Date()); 
    setDatePickerVisibility(true);
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(`reminder_${reminderId}`);
      await AsyncStorage.removeItem(`reminder_${reminderId}`); // For both default and custom specific state
      
      const updatedReminders = reminders.filter(r => r.id !== reminderId);
      setReminders(updatedReminders);
      
      // If it was a custom reminder, also update the list of custom reminders in storage
      if (reminderId.startsWith('custom_')) {
        const customReminders = updatedReminders.filter(r => r.isCustom);
        await AsyncStorage.setItem('custom_reminders', JSON.stringify(customReminders));
      }
      
      Alert.alert('Success', 'Reminder deleted');
    } catch (e) {
      console.error('Failed to delete reminder:', e);
      Alert.alert('Error', 'Could not delete reminder. Please try again.');
    }
  };

  // renderRightActions no longer needs isCustom, delete is available for all
  const renderRightActions = (reminderId: string) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={() => deleteReminder(reminderId)}
      >
        <Ionicons name="trash-outline" size={24} color="#ffffff" />
        <ThemedText style={styles.deleteActionText}>Delete</ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <ThemedText style={styles.title}>Hydration Reminders</ThemedText>
        <ThemedText style={styles.subtitle}>Stay on track with timely alerts</ThemedText>

        <View style={styles.card}>
          {reminders.map((reminder) => (
            <Swipeable
              key={reminder.id}
              renderRightActions={() => renderRightActions(reminder.id)} // Pass only ID
              friction={2}
              rightThreshold={40}
            >
              <View style={styles.reminderRow}>
                <Ionicons 
                  name={reminder.enabled ? "notifications" : "notifications-outline"} 
                  size={26} 
                  color={reminder.enabled ? "#3b82f6" : "#9ca3af"}
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
            </Swipeable>
          ))}
        </View>
        
        <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={styles.customButton}
            onPress={showDatePicker}
          >
            <Ionicons name="add-circle" size={24} color="#ffffff" style={styles.buttonIcon} />
            <ThemedText style={styles.customButtonText}>
              Add Custom Reminder
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirmDateTime}
        onCancel={hideDatePicker}
        date={selectedTime}
        is24Hour={false}
      />

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 15,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
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
    backgroundColor: '#ffffff',
  },
  reminderIcon: {
    marginRight: 15,
  },
  reminderText: {
    fontSize: 18,
    color: '#374151',
    flex: 1,
  },
  addButtonContainer: { 
    width: '100%',
    marginTop: 10,
  },
  customButton: {
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
  customButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  deleteAction: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    flexDirection: 'row',
  },
  deleteActionText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 5,
  },
}); 