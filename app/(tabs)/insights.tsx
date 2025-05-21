import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BarChart, Grid } from 'react-native-svg-charts';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useHydrationStore from '@/stores/hydrationStore';

const CARD_SHADOW = {
  elevation: 4,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
};

export default function InsightsScreen() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const dailyGoal = 2500;

  const weeklyData = [
    { value: 2200, label: 'Mon' },
    { value: 2400, label: 'Tue' },
    { value: 1800, label: 'Wed' },
    { value: 2500, label: 'Thu' },
    { value: 2000, label: 'Fri' },
    { value: 2600, label: 'Sat' },
    { value: 2300, label: 'Sun' },
  ];

  const chartData = weeklyData.map(item => item.value);
  const averageIntake = chartData.reduce((sum, val) => sum + val, 0) / chartData.length;
  const daysGoalReached = weeklyData.filter(day => day.value >= dailyGoal).length;

  const improvingTrendPercentage = 12;
  const bestDay = { day: 'Wednesday', intake: 2400 };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
        <ThemedText style={styles.title}>Hydration Insights</ThemedText>
        <ThemedText style={styles.subtitle}>Track your progress over time</ThemedText>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'weekly' && styles.activeTabButton]}
            onPress={() => setActiveTab('weekly')}
          >
            <ThemedText style={[styles.tabButtonText, activeTab === 'weekly' && styles.activeTabButtonText]}>
              Weekly
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'monthly' && styles.activeTabButton]}
            onPress={() => setActiveTab('monthly')}
          >
            <ThemedText style={[styles.tabButtonText, activeTab === 'monthly' && styles.activeTabButtonText]}>
              Monthly
            </ThemedText>
          </TouchableOpacity>
        </View>

        {activeTab === 'weekly' && (
          <>
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <ThemedText style={styles.chartTitle}>This Week</ThemedText>
                <ThemedText style={styles.chartGoalText}>Goal: {dailyGoal}ml/day</ThemedText>
              </View>
              <View style={{ height: 200, paddingHorizontal: 10, flexDirection: 'row' }}>
                <BarChart
                  style={{ flex: 1 }}
                  data={chartData}
                  svg={{ fill: '#3b82f6' }}
                  contentInset={{ top: 20, bottom: 20 }}
                  spacingInner={0.3}
                  spacingOuter={0.2}
                >
                  <Grid />
                </BarChart>
              </View>
              <View style={styles.chartXAxis}>
                {weeklyData.map((item, index) => (
                  <ThemedText key={index} style={styles.xAxisLabel}>{item.label}</ThemedText>
                ))}
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <ThemedText style={styles.statLabel}>Daily Average</ThemedText>
                <ThemedText style={styles.statValue}>{Math.round(averageIntake)}ml</ThemedText>
              </View>
              <View style={styles.statCard}>
                <ThemedText style={styles.statLabel}>Goal Reached</ThemedText>
                <ThemedText style={styles.statValue}>{daysGoalReached}/{weeklyData.length} days</ThemedText>
              </View>
            </View>

            <View style={styles.insightsSectionCard}>
              <ThemedText style={styles.insightsTitle}>Insights</ThemedText>
              <View style={styles.insightItem}>
                <MaterialCommunityIcons name="trending-up" size={24} color="#16a34a" style={styles.insightIcon} />
                <View style={styles.insightTextContainer}>
                  <ThemedText style={styles.insightMainText}>Improving Trend</ThemedText>
                  <ThemedText style={styles.insightSubText}>
                    Your hydration has improved by {improvingTrendPercentage}% compared to last week.
                  </ThemedText>
                </View>
              </View>
              <View style={styles.insightItem}>
                <Ionicons name="calendar-outline" size={24} color="#3b82f6" style={styles.insightIcon} />
                <View style={styles.insightTextContainer}>
                  <ThemedText style={styles.insightMainText}>Best Day</ThemedText>
                  <ThemedText style={styles.insightSubText}>
                    {bestDay.day} was your best hydration day with {bestDay.intake}ml.
                  </ThemedText>
                </View>
              </View>
            </View>
          </>
        )}

        {activeTab === 'monthly' && (
          <View style={styles.placeholderCard}>
            <Ionicons name="construct-outline" size={48} color="#6b7280" />
            <ThemedText style={styles.placeholderText}>Monthly view coming soon!</ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContentContainer: {
    alignItems: 'center',
    padding: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#ffffff',
    ...CARD_SHADOW,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  activeTabButtonText: {
    color: '#3b82f6',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    ...CARD_SHADOW,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  chartGoalText: {
    fontSize: 14,
    color: '#6b7280',
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    ...CARD_SHADOW,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  insightsSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    ...CARD_SHADOW,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  insightIcon: {
    marginRight: 15,
  },
  insightTextContainer: {
    flex: 1,
  },
  insightMainText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  insightSubText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  placeholderCard: {
    flex: 1,
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    ...CARD_SHADOW,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
    textAlign: 'center',
  },
}); 