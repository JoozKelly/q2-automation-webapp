'use client';

import { create } from 'zustand';
import type { ReportData, ReportNarratives, ParsedWorkbook, GDPDataPoint } from '@/types/report';

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
  rawWorkbook: ParsedWorkbook;
  isLoading: boolean;
  uploadedFileName: string | null;

  setGDPHistorical: (points: GDPDataPoint[]) => void;
  setRawWorkbook: (wb: ParsedWorkbook, fileName: string) => void;
  updateNarrative: (section: keyof ReportNarratives, text: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useReportStore = create<ReportStore>((set) => ({
  data: DEFAULT_REPORT,
  rawWorkbook: {},
  isLoading: false,
  uploadedFileName: null,

  setGDPHistorical: (points) =>
    set((state) => ({ data: { ...state.data, gdpHistorical: points } })),

  setRawWorkbook: (wb, fileName) =>
    set({ rawWorkbook: wb, uploadedFileName: fileName }),

  updateNarrative: (section, text) =>
    set((state) => ({
      data: {
        ...state.data,
        narratives: { ...state.data.narratives, [section]: text },
      },
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  reset: () =>
    set({ data: DEFAULT_REPORT, rawWorkbook: {}, uploadedFileName: null }),
}));
