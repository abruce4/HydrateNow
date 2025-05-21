import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Picker } from '@react-native-picker/picker';
import useHydrationStore from '@/stores/hydrationStore';
import { useRouter } from 'expo-router';

const CARD_SHADOW = {
  elevation: 4,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
};

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

const activityLevelMultipliers: Record<ActivityLevel, number> = {
  sedentary: 0, // No extra water
  light: 12, // 12 oz for 30 mins of light exercise (e.g., 1-3 times a week)
  moderate: 24, // 24 oz for 60 mins of moderate exercise (e.g., 3-5 times a week)
  active: 36, // 36 oz for 90 mins of active exercise (e.g., 6-7 times a week)
  veryActive: 48, // 48 oz for 120 mins of very active exercise/physically demanding job
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { setDailyGoal, setOnboardingCompleted } = useHydrationStore();

  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('sedentary');

  const calculateWaterIntake = () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weight.');
      return;
    }

    let weightInLbs = weightNum;
    if (weightUnit === 'kg') {
      weightInLbs = weightNum * 2.20462;
    }

    // Base calculation: weight in lbs * 2/3 in ounces
    let dailyIntakeOunces = weightInLbs * (2 / 3);

    // Add water for activity level
    dailyIntakeOunces += activityLevelMultipliers[activityLevel];

    // Convert ounces to ml (1 oz = 29.5735 ml)
    const dailyIntakeMl = Math.round(dailyIntakeOunces * 29.5735);

    setDailyGoal(dailyIntakeMl);
    setOnboardingCompleted(true);
    router.replace('/(tabs)/track'); // Navigate to the main app
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>Welcome to HydrateNow!</ThemedText>
        <ThemedText style={styles.subtitle}>Let's personalize your hydration goal.</ThemedText>

        <View style={styles.card}>
          <ThemedText style={styles.label}>Gender</ThemedText>
          <Picker
            selectedValue={gender}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            onValueChange={(itemValue: 'male' | 'female' | 'other') => setGender(itemValue)}
          >
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.label}>Weight</ThemedText>
          <View style={styles.weightInputContainer}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter weight"
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.unitToggleContainer}>
              <TouchableOpacity
                style={[styles.unitButton, weightUnit === 'kg' && styles.activeUnitButton]}
                onPress={() => setWeightUnit('kg')}
              >
                <Text style={[styles.unitButtonText, weightUnit === 'kg' && styles.activeUnitButtonText]}>kg</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitButton, weightUnit === 'lbs' && styles.activeUnitButton]}
                onPress={() => setWeightUnit('lbs')}
              >
                <Text style={[styles.unitButtonText, weightUnit === 'lbs' && styles.activeUnitButtonText]}>lbs</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.label}>Activity Level</ThemedText>
          <Picker
            selectedValue={activityLevel}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            onValueChange={(itemValue: ActivityLevel) => setActivityLevel(itemValue)}
          >
            <Picker.Item label="Sedentary (little or no exercise)" value="sedentary" />
            <Picker.Item label="Light (exercise 1-3 times/week)" value="light" />
            <Picker.Item label="Moderate (exercise 3-5 times/week)" value="moderate" />
            <Picker.Item label="Active (exercise 6-7 times/week)" value="active" />
            <Picker.Item label="Very Active (heavy exercise/physical job)" value="veryActive" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.calculateButton} onPress={calculateWaterIntake}>
          <ThemedText style={styles.calculateButtonText}>Calculate & Start</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 50, // Ensure button is not cut off
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 40, // Space from top
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    ...CARD_SHADOW,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  picker: {
    width: '100%',
    height: 120, // Adjust height for better touch targets on iOS
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  pickerItem: {
    // Note: Styling individual Picker.Item is limited, especially on Android.
    // For more control, a custom dropdown component would be needed.
    height: 120, // Ensure items are not cramped
    fontSize: 16,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
    color: '#1f2937',
    paddingHorizontal: 15,
  },
  unitToggleContainer: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderColor: '#d1d5db',
  },
  unitButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  activeUnitButton: {
    backgroundColor: '#e0e7ff',
  },
  unitButtonText: {
    fontSize: 16,
    color: '#4b5563',
  },
  activeUnitButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  calculateButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    ...CARD_SHADOW,
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 