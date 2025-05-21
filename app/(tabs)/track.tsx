import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import useHydrationStore from '@/stores/hydrationStore';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const CARD_SHADOW = {
  elevation: 4,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
};

export default function TrackScreen() {
  const { currentIntake, dailyGoal, addIntake, setDailyGoal } = useHydrationStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const percentage = dailyGoal > 0 ? (currentIntake / dailyGoal) * 100 : 0;
  const isGoalReached = currentIntake >= dailyGoal && dailyGoal > 0;

  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const radius = 80;
    const strokeWidth = 18;
    const circumference = 2 * Math.PI * radius;
    const clampedPercentage = Math.min(percentage, 100);
    const strokeDashoffset = circumference - (circumference * clampedPercentage) / 100;
    const ringColor = isGoalReached ? '#4ade80' : '#3b82f6';
    const textColor = isGoalReached ? '#16a34a' : '#2563eb';

    return (
      <View style={styles.progressRingContainer}>
        <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
          <Circle
            stroke="#e5e7eb"
            fill="none"
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={ringColor}
            fill="none"
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`}
          />
        </Svg>
        <View style={styles.progressTextContainer}>
          <ThemedText style={[styles.progressText, { color: textColor }]}>{`${Math.round(clampedPercentage)}%`}</ThemedText>
        </View>
      </View>
    );
  };

  const handleAddIntake = (amount: number) => {
    addIntake(amount);
  };

  const handleCustomIntake = () => {
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      addIntake(amount);
    }
    setCustomAmount('');
    setModalVisible(false);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <CircularProgress percentage={percentage} />
      </View>

      <View style={[styles.card, styles.intakeCard]}>
        <MaterialCommunityIcons name="water-outline" size={32} color="#3b82f6" style={styles.intakeIcon} />
        <ThemedText style={styles.intakeText}>
          {currentIntake}ml / {dailyGoal}ml
        </ThemedText>
      </View>

      {isGoalReached && (
        <View style={styles.goalReachedMessageContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
          <ThemedText style={styles.goalReachedText}>Daily goal achieved! Keep it up!</ThemedText>
        </View>
      )}

      <View style={[styles.card, styles.actionsCard]}>
        <View style={styles.buttonsVerticalContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleAddIntake(250)}>
            <Ionicons name="add-circle-outline" size={28} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Add 250ml</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleAddIntake(500)}>
            <Ionicons name="add-circle-sharp" size={28} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Add 500ml</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.customEntryButton]} onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="cup-water" size={28} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Custom Entry</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Enter Custom Amount</ThemedText>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="water-plus-outline" size={24} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder="Amount in ml (e.g., 300)"
                placeholderTextColor="#9ca3af"
                clearButtonMode="while-editing"
              />
            </View>
            <View style={styles.modalActionsContainer}>
              <TouchableOpacity style={[styles.modalActionButton, styles.modalCancelButton]} onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle-outline" size={22} color="#4b5563" />
                  <Text style={[styles.modalActionButtonText, styles.modalCancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalActionButton, styles.modalConfirmButton]} onPress={handleCustomIntake}>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#ffffff" />
                  <Text style={[styles.modalActionButtonText, styles.modalConfirmButtonText]}>Add Intake</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* <View style={styles.separator} />
      <ThemedText style={styles.text}>
        Track your water intake here
      </ThemedText> */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    paddingTop: 60,
    backgroundColor: '#f3f4f6',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    ...CARD_SHADOW,
    alignItems: 'center',
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  intakeCard: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  intakeIcon: {
    marginRight: 10,
  },
  intakeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
  },
  goalReachedMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  goalReachedText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#15803d',
    fontWeight: '500',
  },
  actionsCard: {
    paddingBottom: 10,
  },
  buttonsVerticalContainer: {
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 15,
    width: '95%',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  customEntryButton: {
    backgroundColor: '#60a5fa',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
    color: '#1f2937',
  },
  modalActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
  },
  modalCancelButton: {
    backgroundColor: '#e5e7eb',
    marginRight: 10,
  },
  modalCancelButtonText: {
    color: '#4b5563',
  },
  modalConfirmButton: {
    backgroundColor: '#3b82f6',
    marginLeft: 10,
  },
  modalConfirmButtonText: {
    color: 'white',
  },
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    backgroundColor: '#e5e7eb',
  },
}); 