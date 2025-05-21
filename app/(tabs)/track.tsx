import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import useHydrationStore from '@/stores/hydrationStore';
import Svg, { Circle } from 'react-native-svg';

export default function TrackScreen() {
  const { currentIntake, dailyGoal, addIntake } = useHydrationStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const percentage = dailyGoal > 0 ? (currentIntake / dailyGoal) * 100 : 0;

  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const radius = 70;
    const strokeWidth = 15;
    const circumference = 2 * Math.PI * radius;
    const clampedPercentage = Math.min(percentage, 100);
    const strokeDashoffset = circumference - (circumference * clampedPercentage) / 100;

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
            stroke="#3b82f6"
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
          <ThemedText style={styles.progressText}>{`${Math.round(clampedPercentage)}%`}</ThemedText>
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
      <CircularProgress percentage={percentage} />
      <ThemedText style={styles.intakeText}>
        {currentIntake}ml / {dailyGoal}ml
      </ThemedText>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleAddIntake(250)}>
          <ThemedText style={styles.buttonText}>250ml</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleAddIntake(500)}>
          <ThemedText style={styles.buttonText}>500ml</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.customButton]} onPress={() => setModalVisible(true)}>
          <ThemedText style={[styles.buttonText, styles.customButtonText]}>Custom</ThemedText>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <ThemedText style={styles.modalTitle}>Enter Custom Amount (ml)</ThemedText>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder="e.g., 300"
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonClose]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonSubmit]} onPress={handleCustomIntake}>
                  <Text style={styles.modalButtonText}>Add</Text>
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
    padding: 20,
    paddingTop: 50,
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  intakeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#374151',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customButton: {
    backgroundColor: '#6b7280',
  },
  customButtonText: {
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1f2937'
  },
  input: {
    height: 50,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#1f2937',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonClose: {
    backgroundColor: '#6b7280',
    marginRight: 10,
  },
  modalButtonSubmit: {
    backgroundColor: '#3b82f6',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    backgroundColor: '#e5e7eb',
  },
}); 