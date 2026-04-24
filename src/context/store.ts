import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EconomicData {
  gdpData: { year: string; gdp: number; target: number }[];
  investmentData: { quarter: string; foreign: number; domestic: number }[];
  inflationData: { month: string; rate: number }[];
  summary: string;
}

interface DataStore {
  data: EconomicData | null;
  setData: (data: EconomicData) => void;
  clearData: () => void;
}

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      data: null,
      setData: (data) => set({ data }),
      clearData: () => set({ data: null }),
    }),
    { name: 'batam-economic-data' }
  )
);
