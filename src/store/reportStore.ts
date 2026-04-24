'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReportData, ReportNarratives, GDPDataPoint } from '@/types/report';

const DEFAULT_REPORT: ReportData = {
  period: 'Q2 2026',
  macroIndicators: [],
  gdpHistorical: [],
  infraProjects: [],
  geoEvents: [],
  sectorProjects: [],
  narratives: {},
};

interface ReportStore {
  data: ReportData;
  uploadedFileName: string | null;
  isLoading: boolean;

  setGDPHistorical: (points: GDPDataPoint[]) => void;
  setRawWorkbook: (wb: Record<string, unknown[]>, fileName: string) => void;
  updateNarrative: (section: keyof ReportNarratives, text: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set) => ({
      data: DEFAULT_REPORT,
      uploadedFileName: null,
      isLoading: false,

      setGDPHistorical: (points) =>
        set((state) => ({ data: { ...state.data, gdpHistorical: points } })),

      setRawWorkbook: (_wb, fileName) =>
        set({ uploadedFileName: fileName }),

      updateNarrative: (section, text) =>
        set((state) => ({
          data: {
            ...state.data,
            narratives: { ...state.data.narratives, [section]: text },
          },
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      reset: () => set({ data: DEFAULT_REPORT, uploadedFileName: null }),
    }),
    {
      name: 'batam-report-store',
      // Only persist what we need; skip large rawWorkbook
      partialize: (state) => ({
        data: { ...state.data },
        uploadedFileName: state.uploadedFileName,
      }),
    }
  )
);
