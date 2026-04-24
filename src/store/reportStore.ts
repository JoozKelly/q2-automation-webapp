'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ReportData,
  ReportNarratives,
  GDPDataPoint,
  InfraProject,
  GeoEvent,
  SectorSummary,
  MacroGridGroup,
  DashboardStats,
  NewsItem,
} from '@/types/report';

const DEFAULT_REPORT: ReportData = {
  period: 'Q2 2026',
  macroIndicators: [],
  gdpHistorical: [],
  infraProjects: [],
  geoEvents: [],
  sectorProjects: [],
  narratives: {},
};

interface FullPayload {
  gdpHistorical?: GDPDataPoint[];
  infraProjects?: InfraProject[];
  geoEvents?: GeoEvent[];
  macroGrid?: MacroGridGroup[];
  sectorSummaries?: SectorSummary[];
  newsItems?: NewsItem[];
  dashboardStats?: DashboardStats;
  summary?: string;
}

interface ReportStore {
  data: ReportData;
  uploadedFileName: string | null;
  isLoading: boolean;
  dashboardStats: DashboardStats | null;
  macroGrid: MacroGridGroup[];
  sectorSummaries: SectorSummary[];
  newsItems: NewsItem[];
  ceoBrief: string;

  setGDPHistorical: (points: GDPDataPoint[]) => void;
  setRawWorkbook: (wb: Record<string, unknown[]>, fileName: string) => void;
  updateNarrative: (section: keyof ReportNarratives, text: string) => void;
  setLoading: (loading: boolean) => void;
  setInfraProjects: (projects: InfraProject[]) => void;
  setGeoEvents: (events: GeoEvent[]) => void;
  setDashboardStats: (stats: DashboardStats) => void;
  setMacroGrid: (grid: MacroGridGroup[]) => void;
  setSectorSummaries: (summaries: SectorSummary[]) => void;
  setNewsItems: (items: NewsItem[]) => void;
  setCeoBrief: (brief: string) => void;
  setUploadedFileName: (name: string | null) => void;
  setFullPayload: (payload: FullPayload) => void;
  reset: () => void;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set) => ({
      data: DEFAULT_REPORT,
      uploadedFileName: null,
      isLoading: false,
      dashboardStats: null,
      macroGrid: [],
      sectorSummaries: [],
      newsItems: [],
      ceoBrief: '',

      setGDPHistorical: (points) =>
        set((s) => ({ data: { ...s.data, gdpHistorical: points } })),

      setRawWorkbook: (_wb, fileName) =>
        set({ uploadedFileName: fileName }),

      updateNarrative: (section, text) =>
        set((s) => ({
          data: { ...s.data, narratives: { ...s.data.narratives, [section]: text } },
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setInfraProjects: (projects) =>
        set((s) => ({ data: { ...s.data, infraProjects: projects } })),

      setGeoEvents: (events) =>
        set((s) => ({ data: { ...s.data, geoEvents: events } })),

      setDashboardStats: (stats) => set({ dashboardStats: stats }),

      setMacroGrid: (grid) => set({ macroGrid: grid }),

      setSectorSummaries: (summaries) => set({ sectorSummaries: summaries }),

      setNewsItems: (items) => set({ newsItems: items }),

      setCeoBrief: (brief) => set({ ceoBrief: brief }),

      setUploadedFileName: (name) => set({ uploadedFileName: name }),

      setFullPayload: (payload) =>
        set((s) => ({
          ...(payload.macroGrid !== undefined ? { macroGrid: payload.macroGrid } : {}),
          ...(payload.sectorSummaries !== undefined ? { sectorSummaries: payload.sectorSummaries } : {}),
          ...(payload.newsItems !== undefined ? { newsItems: payload.newsItems } : {}),
          ...(payload.dashboardStats !== undefined ? { dashboardStats: payload.dashboardStats } : {}),
          data: {
            ...s.data,
            ...(payload.gdpHistorical !== undefined ? { gdpHistorical: payload.gdpHistorical } : {}),
            ...(payload.infraProjects !== undefined ? { infraProjects: payload.infraProjects } : {}),
            ...(payload.geoEvents !== undefined ? { geoEvents: payload.geoEvents } : {}),
          },
        })),

      reset: () =>
        set({
          data: DEFAULT_REPORT,
          uploadedFileName: null,
          dashboardStats: null,
          macroGrid: [],
          sectorSummaries: [],
          newsItems: [],
          ceoBrief: '',
        }),
    }),
    {
      name: 'batam-report-store',
      partialize: (s) => ({
        data: { ...s.data },
        uploadedFileName: s.uploadedFileName,
        dashboardStats: s.dashboardStats,
        macroGrid: s.macroGrid,
        sectorSummaries: s.sectorSummaries,
        newsItems: s.newsItems,
        ceoBrief: s.ceoBrief,
      }),
    }
  )
);
