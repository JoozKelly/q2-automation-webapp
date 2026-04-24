'use client';

import { usePathname } from 'next/navigation';
import { useReportStore } from '@/store/reportStore';
import { useSessionStore } from '@/store/sessionStore';
import { Save, FolderOpen, Clock } from 'lucide-react';
import { useState } from 'react';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/':               { title: 'Dashboard',          subtitle: 'Live economic overview · Batam FTZ' },
  '/ingestion':      { title: 'Data Ingestion',      subtitle: 'Upload documents · BPS search · News intelligence' },
  '/ceo-brief':      { title: 'Storyline Planner',   subtitle: 'Plan your Q3 narrative arc and chapter structure' },
  '/report-builder': { title: 'Report Builder',      subtitle: 'Generate section narratives and export PDF' },
  '/export':         { title: 'Export Data',         subtitle: 'Download all visualizations and tables as Excel' },
};

export default function Header() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? { title: 'VANTAGE', subtitle: 'Batam FTZ Intelligence' };

  const reportStore = useReportStore();
  const { sessions, saveSession, activeSessionId } = useSessionStore();
  const [sessionName, setSessionName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const lastUpdated = reportStore.dashboardStats?.lastUpdated;
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleSave = () => {
    if (!sessionName.trim()) return;
    saveSession(sessionName.trim(), {
      data:             reportStore.data,
      dashboardStats:   reportStore.dashboardStats,
      macroGrid:        reportStore.macroGrid,
      sectorSummaries:  reportStore.sectorSummaries,
      newsItems:        reportStore.newsItems,
      ceoBrief:         reportStore.ceoBrief,
      uploadedFileName: reportStore.uploadedFileName,
    });
    setSessionName('');
    setShowModal(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <header
        className="h-16 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0"
        style={{
          background: 'rgba(4, 17, 31, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(14, 165, 233, 0.12)',
        }}
      >
        {/* Left: page title */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-100 leading-tight truncate">{meta.title}</h2>
            <p className="text-[11px] text-[#3a5268] leading-tight hidden sm:block truncate">{meta.subtitle}</p>
          </div>

          {activeSession && (
            <div
              className="hidden md:flex items-center gap-1.5 text-sky-300 text-[11px] px-2.5 py-1 rounded-full shrink-0"
              style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}
            >
              <FolderOpen size={11} />
              <span className="font-medium truncate max-w-[120px]">{activeSession.name}</span>
            </div>
          )}
        </div>

        {/* Right: metadata + save */}
        <div className="flex items-center gap-3 shrink-0">
          {lastUpdated && (
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#3a5268]">
              <Clock size={11} />
              <span>
                {new Date(lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-xs font-medium transition-all px-3 py-1.5 rounded-lg"
            style={{
              color: saved ? '#86efac' : '#8892a4',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(30,58,95,0.5)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = saved ? '#86efac' : '#8892a4'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <Save size={13} />
            {saved ? 'Saved!' : 'Save Session'}
          </button>
        </div>
      </header>

      {/* Save modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(2,9,23,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-2xl slide-up"
            style={{ background: '#0b1829', border: '1px solid rgba(30,58,95,0.7)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-100 mb-1">Save Session</h3>
            <p className="text-xs text-[#3a5268] mb-5">
              Name this session to save all dashboard data and narratives for later.
            </p>
            <input
              autoFocus
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder={`e.g. Q2 2026 Draft — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
              className="w-full text-sm text-slate-200 placeholder-[#2a3a52] px-4 py-2.5 rounded-xl mb-4 focus:outline-none focus:ring-1 focus:ring-sky-500"
              style={{ background: '#04111f', border: '1px solid rgba(14,165,233,0.15)' }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!sessionName.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: sessionName.trim() ? '#0ea5e9' : 'rgba(14,165,233,0.1)',
                  color: sessionName.trim() ? '#fff' : '#3a5268',
                  boxShadow: sessionName.trim() ? '0 0 24px rgba(14,165,233,0.4)' : 'none',
                }}
              >
                Save
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#8892a4] hover:text-slate-200 transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(30,58,95,0.5)' }}
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
