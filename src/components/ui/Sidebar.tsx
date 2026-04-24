'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileSpreadsheet, FileText, BrainCircuit,
  FolderOpen, Trash2, Plus, Clock, Download, AlertTriangle, X,
} from 'lucide-react';
import { useState } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useReportStore } from '@/store/reportStore';
import { useDataStore } from '@/context/store';

// ── Brand mark ────────────────────────────────────────────────────────────────

function VantageMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
      <path
        d="M3 23 L15 7 L27 23"
        stroke="url(#vm-outer)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 23 L15 14 L21 23"
        stroke="url(#vm-inner)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <defs>
        <linearGradient id="vm-outer" x1="3" y1="23" x2="27" y2="7" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="vm-inner" x1="9" y1="23" x2="21" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Navigation ─────────────────────────────────────────────────────────────────

const NAV = [
  { href: '/',               icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/ingestion',      icon: FileSpreadsheet,  label: 'Data Ingestion' },
  { href: '/ceo-brief',      icon: BrainCircuit,     label: 'Storyline Planner' },
  { href: '/report-builder', icon: FileText,         label: 'Report Builder' },
  { href: '/export',         icon: Download,         label: 'Export Data' },
];

// ── Sidebar ────────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const { sessions, activeSessionId, loadSession, deleteSession, setActive } = useSessionStore();
  const reportStore = useReportStore();
  const dataStore = useDataStore();

  const [showConfirm, setShowConfirm] = useState(false);

  const handleLoad = (id: string) => {
    const snapshot = loadSession(id);
    if (!snapshot) return;
    reportStore.setFullPayload({
      dashboardStats:  snapshot.dashboardStats ?? undefined,
      macroGrid:       snapshot.macroGrid,
      sectorSummaries: snapshot.sectorSummaries,
      newsItems:       snapshot.newsItems,
      infraProjects:   snapshot.data.infraProjects,
      geoEvents:       snapshot.data.geoEvents,
    });
    if (snapshot.ceoBrief)        reportStore.setCeoBrief(snapshot.ceoBrief);
    reportStore.setUploadedFileName(snapshot.uploadedFileName);
  };

  const handleNewSession = () => {
    const hasData = reportStore.dashboardStats || dataStore.data;
    if (hasData) {
      setShowConfirm(true);
    } else {
      setActive(null);
    }
  };

  const confirmNewSession = () => {
    reportStore.reset();
    dataStore.clearData();
    setActive(null);
    setShowConfirm(false);
  };

  return (
    <>
      <aside
        className="w-64 flex flex-col fixed h-full z-20"
        style={{
          background: 'linear-gradient(180deg, #050f1e 0%, #04111f 100%)',
          borderRight: '1px solid rgba(14,165,233,0.15)'
        }}
      >
        {/* Brand */}
        <div
          className="h-16 flex items-center gap-3 px-5 shrink-0"
        >
          <VantageMark />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-100 tracking-tight leading-none">VANTAGE</p>
            <p className="text-[10px] text-[#3a5268] tracking-widest uppercase leading-none mt-1">
              Batam FTZ · Intelligence
            </p>
          </div>
        </div>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(14,165,233,0.4) 0%, rgba(14,165,233,0.1) 60%, transparent 100%)' }} />

        {/* Nav section label */}
        <div className="px-5 pt-5 pb-2 shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#3a5268]">Navigation</p>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-0.5 shrink-0">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'text-[#8892a4] hover:bg-white/[0.04] hover:text-slate-200'
                }`}
                style={active ? { boxShadow: 'inset 0 0 0 1px rgba(14,165,233,0.25)' } : {}}
              >
                <Icon size={17} className={active ? 'text-sky-400' : ''} />
                <span>{label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-5 mt-5 mb-0" style={{ height: '1px', background: 'rgba(14,165,233,0.12)' }} />

        {/* Sessions */}
        <div className="flex-1 flex flex-col min-h-0 px-3 pt-4 pb-3">
          <div className="flex items-center justify-between px-2 mb-2 shrink-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#3a5268]">Sessions</p>
            <button
              onClick={handleNewSession}
              title="New session — clears current data"
              className="flex items-center gap-1 text-[10px] text-[#3a5268] hover:text-sky-300 hover:bg-sky-500/10 px-2 py-1 rounded-md transition-all"
            >
              <Plus size={11} />
              New
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="text-[11px] text-[#3a5268] px-2 italic">No saved sessions yet.</p>
          ) : (
            <ul className="space-y-0.5 overflow-y-auto flex-1 min-h-0">
              {sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => handleLoad(s.id)}
                      className={`w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-sky-500/10 text-sky-300'
                          : 'text-[#8892a4] hover:bg-white/[0.04] hover:text-slate-200'
                      }`}
                      style={isActive ? { boxShadow: 'inset 0 0 0 1px rgba(14,165,233,0.2)' } : {}}
                    >
                      <FolderOpen
                        size={13}
                        className={`mt-0.5 shrink-0 ${isActive ? 'text-sky-400' : 'text-[#3a5268] group-hover:text-slate-400'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate leading-tight">{s.name}</p>
                        <p className="text-[10px] text-[#3a5268] flex items-center gap-1 mt-0.5">
                          <Clock size={9} />
                          {new Date(s.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                        className="opacity-0 group-hover:opacity-100 text-[#3a5268] hover:text-rose-400 transition-all shrink-0 mt-0.5"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 shrink-0"
          style={{ borderTop: '1px solid rgba(14,165,233,0.12)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
            <p className="text-[11px] text-[#3a5268]">System operational</p>
          </div>
          <p className="text-[10px] text-[#2a4060] mt-1">VANTAGE v1.0 · Q2 2026</p>
        </div>
      </aside>

      {/* New Session confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(2,9,23,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-2xl slide-up"
            style={{ background: '#0b1829', border: '1px solid rgba(30,58,95,0.7)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Start New Session?</h3>
                <p className="text-xs text-[#3a5268] mt-0.5">This will clear all current data.</p>
              </div>
              <button onClick={() => setShowConfirm(false)} className="ml-auto text-slate-500 hover:text-slate-300">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              All dashboard data, charts, narratives, and news items will be removed from the workspace.
              Saved sessions in the panel above are not affected — you can reload them at any time.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmNewSession}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: '#0ea5e9', boxShadow: '0 0 20px rgba(14,165,233,0.35)' }}
              >
                Clear & Start Over
              </button>
              <button
                onClick={() => setShowConfirm(false)}
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
