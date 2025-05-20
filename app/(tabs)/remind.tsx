import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function RemindScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Remind</ThemedText>
      <View style={styles.separator} />
      <ThemedText style={styles.text}>
        Set reminders to drink water throughout the day
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
    marginBottom: 20,
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