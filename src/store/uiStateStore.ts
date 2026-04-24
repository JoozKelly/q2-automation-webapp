'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type IngestionTab = 'bps' | 'upload' | 'news';

interface UIStateStore {
  ingestionTab: IngestionTab;
  ingestionQuery: string;
  ingestionPeriod: string;
  prevReportText: string;
  setIngestionTab: (tab: IngestionTab) => void;
  setIngestionQuery: (q: string) => void;
  setIngestionPeriod: (p: string) => void;
  setPrevReportText: (t: string) => void;
}

export const useUIStateStore = create<UIStateStore>()(
  persist(
    (set) => ({
      ingestionTab: 'bps',
      ingestionQuery: '',
      ingestionPeriod: '2024-2026',
      prevReportText: '',
      setIngestionTab: (tab) => set({ ingestionTab: tab }),
      setIngestionQuery: (q) => set({ ingestionQuery: q }),
      setIngestionPeriod: (p) => set({ ingestionPeriod: p }),
      setPrevReportText: (t) => set({ prevReportText: t }),
    }),
    { name: 'vantage-ui-state' }
  )
);
