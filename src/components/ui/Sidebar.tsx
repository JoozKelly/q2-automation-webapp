'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileSpreadsheet, FileText, BrainCircuit,
  Settings, FolderOpen, Trash2, Plus, Clock,
} from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';
import { useReportStore } from '@/store/reportStore';

const NAV = [
  { href: '/',               icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/ingestion',      icon: FileSpreadsheet,  label: 'Data Ingestion' },
  { href: '/ceo-brief',      icon: BrainCircuit,     label: 'CEO Brief' },
  { href: '/report-builder', icon: FileText,         label: 'Report Builder' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sessions, activeSessionId, loadSession, deleteSession, setActive } = useSessionStore();
  const reportStore = useReportStore();

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
    if (snapshot.ceoBrief) reportStore.setCeoBrief(snapshot.ceoBrief);
    reportStore.setUploadedFileName(snapshot.uploadedFileName);
  };

  const handleNew = () => {
    setActive(null);
  };

  return (
    <aside className="w-64 border-r border-[#1a2744] bg-[#060f1e] flex flex-col fixed h-full z-20">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-[#1a2744] shrink-0">
        <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          ReportAuto Q2
        </h1>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-5 space-y-0.5 shrink-0">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                active
                  ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/25'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sessions panel */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pb-4">
        <div className="border-t border-[#1a2744] pt-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sessions</span>
            <button
              onClick={handleNew}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="New session"
            >
              <Plus size={14} />
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="text-xs text-slate-600 px-1">No saved sessions yet.</p>
          ) : (
            <ul className="space-y-0.5 overflow-y-auto flex-1 min-h-0">
              {sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => handleLoad(s.id)}
                      className={`w-full text-left flex items-start gap-2 px-2.5 py-2 rounded-lg transition-all group ${
                        isActive
                          ? 'bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/20'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <FolderOpen size={13} className={`mt-0.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate leading-tight ${isActive ? 'text-indigo-300' : 'text-slate-300'}`}>
                          {s.name}
                        </p>
                        <p className="text-[10px] text-slate-600 flex items-center gap-1 mt-0.5">
                          <Clock size={9} />
                          {new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all shrink-0"
                        title="Delete session"
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
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-[#1a2744] shrink-0">
        <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition-all text-sm font-medium">
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
