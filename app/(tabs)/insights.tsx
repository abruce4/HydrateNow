import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BarChart, Grid } from 'react-native-svg-charts';
import { Ionicons } from '@expo/vector-icons';

export default function InsightsScreen() {
  const [isPremium, setIsPremium] = useState(false);
  const [streak, setStreak] = useState(4);
  const [last7DaysData, setLast7DaysData] = useState([
    { value: 50, label: 'Mon' },
    { value: 75, label: 'Tue' },
    { value: 100, label: 'Wed' },
    { value: 60, label: 'Thu' },
    { value: 80, label: 'Fri' },
    { value: 90, label: 'Sat' },
    { value: 70, label: 'Sun' },
  ]);

  const fill = 'rgb(134, 65, 244)';
  const chartData = last7DaysData.map(item => item.value);

  const handleUpgradePress = () => {
    console.log('Upgrade button pressed');
    setIsPremium(true);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Insights</ThemedText>
      <View style={styles.separator} />

      {isPremium ? (
        <View style={styles.insightsContent}>
          <ThemedText style={styles.streakText}>
            🔥 {streak}-Day Hydration Streak!
          </ThemedText>
          <ThemedText style={styles.chartTitle}>
            Last 7 Days Hydration (%)
          </ThemedText>
          <View style={{ height: 200, paddingHorizontal: 10, flexDirection: 'row' }}>
            <BarChart
              style={{ flex: 1 }}
              data={chartData}
              svg={{ fill }}
              contentInset={{ top: 30, bottom: 30 }}
              spacingInner={0.2}
              spacingOuter={0.1}
            >
              <Grid />
            </BarChart>
          </View>
        </View>
      ) : (
        <View style={styles.lockOverlayContainer}>
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={64} color="#fff" />
            <ThemedText style={styles.lockText}>
              Upgrade to unlock insights
            </ThemedText>
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePress}>
              <ThemedText style={styles.upgradeButtonText}>Upgrade Now</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  separator: {
    marginVertical: 15,
    height: 1,
    width: '80%',
    backgroundColor: '#e5e7eb',
  },
  insightsContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF9800',
    marginVertical: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 15,
  },
  lockOverlayContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    maxWidth: 400,
  },
  lockText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  upgradeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 