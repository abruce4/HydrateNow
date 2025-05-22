import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Interface for daily hydration record
interface DailyRecord {
  date: string; // ISO date string (YYYY-MM-DD)
  intake: number;
}

interface HydrationState {
  dailyGoal: number;
  currentIntake: number;
  onboardingCompleted: boolean;
  lastResetDate?: string;
  // Add daily records for history
  dailyRecords: DailyRecord[];
  addIntake: (amount: number) => void;
  setDailyGoal: (goal: number) => void;
  resetIntake: () => void;
  setOnboardingCompleted: (completed: boolean) => void;
  // Add function to get weekly data
  getWeeklyData: () => { value: number; label: string; date: string }[];
}

// Helper to get date in YYYY-MM-DD format
const getFormattedDate = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

// Helper to get day of week abbreviation
const getDayOfWeekAbbr = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

const useHydrationStore = create<HydrationState>()(
  persist(
    (set, get) => ({
      dailyGoal: 2000, // Default daily goal in ml
      currentIntake: 0,
      onboardingCompleted: false,
      lastResetDate: getFormattedDate(),
      dailyRecords: [], // Initialize empty records array
      
      addIntake: (amount) =>
        set((state) => {
          const today = getFormattedDate();
          const newIntake = state.currentIntake + amount;
          const updatedIntake = newIntake > 0 ? newIntake : 0;
          
          // Check if it's a new day
          if (state.lastResetDate !== today) {
            // If previous day had data, save it to records
            if (state.currentIntake > 0 && state.lastResetDate) {
              const existingRecordIndex = state.dailyRecords.findIndex(
                record => record.date === state.lastResetDate
              );
              
              let updatedRecords = [...state.dailyRecords];
              
              if (existingRecordIndex >= 0) {
                // Update existing record
                updatedRecords[existingRecordIndex] = {
                  ...updatedRecords[existingRecordIndex],
                  intake: state.currentIntake
                };
              } else {
                // Add new record
                updatedRecords.push({
                  date: state.lastResetDate,
                  intake: state.currentIntake
                });
              }
              
              // Keep only the last 30 days
              if (updatedRecords.length > 30) {
                updatedRecords = updatedRecords.sort((a, b) => 
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                ).slice(0, 30);
              }
              
              return {
                currentIntake: amount > 0 ? amount : 0,
                lastResetDate: today,
                dailyRecords: updatedRecords
              };
            }
            
            return {
              currentIntake: amount > 0 ? amount : 0,
              lastResetDate: today
            };
          }
          
          return { currentIntake: updatedIntake };
        }),
        
      setDailyGoal: (goal) => set({ dailyGoal: goal > 0 ? goal : 2000 }),
      
      resetIntake: () =>
        set((state) => {
          const today = getFormattedDate();
          
          // Add current record before resetting
          const updatedRecords = [...state.dailyRecords];
          const existingRecordIndex = updatedRecords.findIndex(
            record => record.date === today
          );
          
          if (existingRecordIndex >= 0) {
            // Update today's record
            updatedRecords[existingRecordIndex] = {
              ...updatedRecords[existingRecordIndex],
              intake: state.currentIntake
            };
          } else {
            // Add new record for today
            updatedRecords.push({
              date: today,
              intake: state.currentIntake
            });
          }
          
          return { 
            currentIntake: 0, 
            lastResetDate: today,
            dailyRecords: updatedRecords
          };
        }),
        
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
      
      // Function to get weekly data for insights
      getWeeklyData: () => {
        const state = get();
        const today = new Date();
        const result = [];
        
        // Get data for the past 7 days (including today)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateString = getFormattedDate(date);
          
          // Find record for this date
          const record = state.dailyRecords.find(r => r.date === dateString);
          
          // Add data point (use 0 if no record exists)
          result.push({
            date: dateString,
            label: getDayOfWeekAbbr(dateString),
            value: record?.intake || 0
          });
        }
        
        return result;
      }
    }),
    {
      name: 'hydration-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const today = getFormattedDate();
        
        // If it's a new day, save yesterday's data to records
        if (state.lastResetDate !== today && state.currentIntake > 0) {
          let updatedRecords = [...state.dailyRecords];
          const existingRecordIndex = updatedRecords.findIndex(
            record => record.date === state.lastResetDate
          );
          
          if (existingRecordIndex >= 0) {
            updatedRecords[existingRecordIndex] = {
              ...updatedRecords[existingRecordIndex],
              intake: state.currentIntake
            };
          } else if (state.lastResetDate) {
            updatedRecords.push({
              date: state.lastResetDate,
              intake: state.currentIntake
            });
          }
          
          return {
            ...state,
            currentIntake: 0,
            lastResetDate: today,
            dailyRecords: updatedRecords
          };
        }
        
        return state;
      },
    }
  )
);

export default useHydrationStore;