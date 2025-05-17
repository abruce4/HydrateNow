import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function InsightsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Insights</ThemedText>
      <View style={styles.separator} />
      <ThemedText style={styles.text}>
        View your hydration trends and streaks over time.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    backgroundColor: '#e5e7eb',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 