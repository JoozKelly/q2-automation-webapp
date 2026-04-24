'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ReportData, DashboardStats, MacroGridGroup,
  SectorSummary, NewsItem,
} from '@/types/report';

export interface SessionSnapshot {
  data: ReportData;
  dashboardStats: DashboardStats | null;
  macroGrid: MacroGridGroup[];
  sectorSummaries: SectorSummary[];
  newsItems: NewsItem[];
  ceoBrief: string;
  uploadedFileName: string | null;
}

export interface Session {
  id: string;
  name: string;
  period: string;
  createdAt: string;
  snapshot: SessionSnapshot;
}

interface SessionStore {
  sessions: Session[];
  activeSessionId: string | null;

  saveSession: (name: string, snapshot: SessionSnapshot) => Session;
  loadSession: (id: string) => SessionSnapshot | null;
  deleteSession: (id: string) => void;
  setActive: (id: string | null) => void;
  renameSession: (id: string, name: string) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      saveSession: (name, snapshot) => {
        const session: Session = {
          id: `session-${Date.now()}`,
          name,
          period: snapshot.data.period,
          createdAt: new Date().toISOString(),
          snapshot,
        };
        set((s) => ({
          sessions: [session, ...s.sessions].slice(0, 20), // max 20 sessions
          activeSessionId: session.id,
        }));
        return session;
      },

      loadSession: (id) => {
        const session = get().sessions.find((s) => s.id === id);
        if (!session) return null;
        set({ activeSessionId: id });
        return session.snapshot;
      },

      deleteSession: (id) =>
        set((s) => ({
          sessions: s.sessions.filter((x) => x.id !== id),
          activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
        })),

      setActive: (id) => set({ activeSessionId: id }),

      renameSession: (id, name) =>
        set((s) => ({
          sessions: s.sessions.map((x) => (x.id === id ? { ...x, name } : x)),
        })),
    }),
    { name: 'batam-sessions' }
  )
);
