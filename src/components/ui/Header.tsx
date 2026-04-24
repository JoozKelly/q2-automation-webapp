'use client';

import { usePathname } from 'next/navigation';
import { useReportStore } from '@/store/reportStore';
import { useSessionStore } from '@/store/sessionStore';
import { Save, FolderOpen, Clock } from 'lucide-react';
import { useState } from 'react';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/':               { title: 'Dashboard',       subtitle: 'Live economic overview for Batam FTZ' },
  '/ingestion':      { title: 'Data Ingestion',  subtitle: 'Upload documents, scrape BPS data, fetch news' },
  '/ceo-brief':      { title: 'CEO Brief',        subtitle: 'Plan your Q2 narrative arc and storyline' },
  '/report-builder': { title: 'Report Builder',  subtitle: 'Generate section narratives and export PDF' },
};

export default function Header() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? { title: 'Batam Report', subtitle: '' };

  const reportStore = useReportStore();
  const { sessions, saveSession, activeSessionId } = useSessionStore();
  const [saving, setSaving] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const lastUpdated = reportStore.dashboardStats?.lastUpdated;

  const handleSave = () => {
    if (!sessionName.trim()) return;
    saveSession(sessionName.trim(), {
      data:            reportStore.data,
      dashboardStats:  reportStore.dashboardStats,
      macroGrid:       reportStore.macroGrid,
      sectorSummaries: reportStore.sectorSummaries,
      newsItems:       reportStore.newsItems,
      ceoBrief:        reportStore.ceoBrief,
      uploadedFileName: reportStore.uploadedFileName,
    });
    setSessionName('');
    setShowSaveModal(false);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-8 border-b border-[#1a2744] bg-[#060f1e]/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100 leading-tight">{meta.title}</h2>
            <p className="text-xs text-slate-500 leading-tight hidden sm:block">{meta.subtitle}</p>
          </div>

          {activeSession && (
            <div className="hidden md:flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-full">
              <FolderOpen size={11} />
              <span className="font-medium">{activeSession.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600">
              <Clock size={11} />
              <span>Updated {new Date(lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}

          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 px-3 py-1.5 rounded-lg transition-all"
          >
            <Save size={13} />
            Save Session
          </button>
        </div>
      </header>

      {/* Save Session Modal */}
      {showSaveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSaveModal(false)}
        >
          <div
            className="bg-[#0c1425] border border-[#1a2744] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-100 mb-1">Save Session</h3>
            <p className="text-xs text-slate-500 mb-4">
              Save the current dashboard state as a named project you can return to later.
            </p>
            <input
              autoFocus
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder={`e.g. Q2 2026 Draft — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!sessionName.trim()}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  sessionName.trim()
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
