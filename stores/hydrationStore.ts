import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface HydrationState {
  dailyGoal: number;
  currentIntake: number;
  addIntake: (amount: number) => void;
  setDailyGoal: (goal: number) => void;
  resetIntake: () => void;
}

const useHydrationStore = create<HydrationState>()(
  persist(
    (set) => ({
      dailyGoal: 2000, // Default daily goal in ml
      currentIntake: 0,
      addIntake: (amount) =>
        set((state) => {
          const newIntake = state.currentIntake + amount;
          return { currentIntake: newIntake > 0 ? newIntake : 0 };
        }),
      setDailyGoal: (goal) => set({ dailyGoal: goal > 0 ? goal : 2000 }),
      resetIntake: () => set({ currentIntake: 0 }),
    }),
    {
      name: 'hydration-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useHydrationStore;