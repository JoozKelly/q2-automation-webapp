"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud, FileText, FileSpreadsheet, Image, X,
  Sparkles, Newspaper, CheckCircle2, AlertCircle, Terminal,
  Download, RefreshCw, Database, ChevronRight, Eye,
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useDataStore, EconomicData } from '@/context/store';
import { useReportStore } from '@/store/reportStore';
import type {
  DashboardStats, GDPDataPoint, InfraProject, GeoEvent,
  SectorSummary, MacroGridGroup, NewsItem,
} from '@/types/report';
import * as XLSX from 'xlsx';

// ─── Types ─────────────────────────────────────────────────────────────────

interface FileEntry {
  id: string;
  file: File;
  status: 'pending' | 'done' | 'error';
}

interface IngestPayload {
  dashboardStats?: DashboardStats;
  gdpData?: { year: string; gdp: number; target: number }[];
  investmentData?: { quarter: string; foreign: number; domestic: number }[];
  inflationData?: { month: string; rate: number }[];
  gdpHistorical?: GDPDataPoint[];
  macroGrid?: MacroGridGroup[];
  infraProjects?: InfraProject[];
  geoEvents?: GeoEvent[];
  sectorSummaries?: SectorSummary[];
  newsItems?: NewsItem[];
  summary?: string;
}

type SectionKey = 'dashboardStats' | 'chartData' | 'macroGrid' | 'sectorSummaries' | 'infraProjects' | 'geoEvents';

const SECTION_LABELS: Record<SectionKey, { label: string; description: string }> = {
  dashboardStats:  { label: 'Dashboard Stats',        description: 'GDP growth, FDI inflow, inflation rate, active projects' },
  chartData:       { label: 'Chart Data',             description: 'GDP historical, investment, and inflation time-series' },
  macroGrid:       { label: 'Macro Indicator Grid',   description: 'Multi-period signal grid for macro and financial indicators' },
  sectorSummaries: { label: 'Sector Summaries',       description: 'EMS, Solar, Data Centers, BESS, Medical, E-Cig project counts' },
  infraProjects:   { label: 'Infrastructure Projects', description: 'Active government and infrastructure project tracker' },
  geoEvents:       { label: 'Geopolitical Events',    description: 'Key events and their FDI / GDP / tenant-risk impact' },
};

function sectionPresent(payload: IngestPayload, key: SectionKey): boolean {
  switch (key) {
    case 'dashboardStats':  return !!payload.dashboardStats;
    case 'chartData':       return !!(payload.gdpData?.length || payload.investmentData?.length || payload.inflationData?.length || payload.gdpHistorical?.length);
    case 'macroGrid':       return !!payload.macroGrid?.length;
    case 'sectorSummaries': return !!payload.sectorSummaries?.length;
    case 'infraProjects':   return !!payload.infraProjects?.length;
    case 'geoEvents':       return !!payload.geoEvents?.length;
  }
}

// ─── File type helpers ─────────────────────────────────────────────────────

function fileIcon(file: File) {
  const name = file.name.toLowerCase();
  if (file.type === 'application/pdf' || name.endsWith('.pdf'))
    return <FileText size={16} className="text-rose-400" />;
  if (file.type.startsWith('image/') || /\.(png|jpg|jpeg|webp)$/.test(name))
    return <Image size={16} className="text-amber-400" />;
  return <FileSpreadsheet size={16} className="text-emerald-400" />;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const CATEGORY_COLORS: Record<string, string> = {
  fdi:            'bg-blue-500/15 text-blue-300',
  infrastructure: 'bg-orange-500/15 text-orange-300',
  policy:         'bg-purple-500/15 text-purple-300',
  sector:         'bg-emerald-500/15 text-emerald-300',
  geopolitics:    'bg-rose-500/15 text-rose-300',
  economy:        'bg-indigo-500/15 text-indigo-300',
};

const CATEGORY_BORDER: Record<string, string> = {
  fdi:            'border-blue-500',
  infrastructure: 'border-orange-500',
  policy:         'border-purple-500',
  sector:         'border-emerald-500',
  geopolitics:    'border-rose-500',
  economy:        'border-indigo-500',
};

const RELEVANCE_DOT: Record<string, string> = {
  high:   'bg-emerald-400',
  medium: 'bg-amber-400',
  low:    'bg-slate-500',
};

// ─── Data Preview ──────────────────────────────────────────────────────────

function DataPreview({ payload }: { payload: IngestPayload }) {
  const stats = payload.dashboardStats;
  const chips = stats
    ? [
        { label: 'GDP Growth',      value: `${stats.gdpGrowthPct.toFixed(1)}%` },
        { label: 'FDI Inflow',      value: stats.fdiInflow },
        { label: 'Inflation Rate',  value: `${stats.inflationRate.toFixed(1)}%` },
        { label: 'Active Projects', value: String(stats.totalProjects) },
      ]
    : [];

  return (
    <div className="bg-[#080f20] border border-indigo-500/20 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Eye size={14} className="text-indigo-400" />
        <span className="text-sm font-semibold text-slate-200">Data Preview</span>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <div key={chip.label} className="bg-[#0f2040] border border-[#1e3a5f]/60 rounded-lg px-3 py-2 text-center min-w-[100px]">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">{chip.label}</p>
              <p className="text-sm font-bold text-indigo-300 mt-0.5">{chip.value}</p>
            </div>
          ))}
        </div>
      )}

      {payload.gdpData && payload.gdpData.length > 0 && (
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">GDP Trend</p>
          <div style={{ height: 60 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payload.gdpData}>
                <Line type="monotone" dataKey="gdp" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {payload.newsItems && payload.newsItems.length > 0 && (
        <p className="text-xs text-slate-500">
          Also contains <span className="text-slate-300 font-medium">{payload.newsItems.length}</span> news items
        </p>
      )}
    </div>
  );
}

// ─── Selection Panel ────────────────────────────────────────────────────────

function SelectionPanel({
  payload,
  selected,
  onToggle,
  onApply,
  onDiscard,
}: {
  payload: IngestPayload;
  selected: Set<SectionKey>;
  onToggle: (k: SectionKey) => void;
  onApply: () => void;
  onDiscard: () => void;
}) {
  const allKeys = Object.keys(SECTION_LABELS) as SectionKey[];
  const available = allKeys.filter((k) => sectionPresent(payload, k));

  return (
    <div className="bg-[#080f20] border border-indigo-500/30 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e3a5f]/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Choose Sections to Apply</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select which data sections to push to the dashboard and Report Builder.
          </p>
        </div>
        <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
          {selected.size} of {available.length} selected
        </span>
      </div>

      <div className="p-4 space-y-2">
        {allKeys.map((key) => {
          const present = sectionPresent(payload, key);
          const checked = selected.has(key);
          return (
            <button
              key={key}
              onClick={() => present && onToggle(key)}
              disabled={!present}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all border ${
                !present
                  ? 'opacity-30 cursor-not-allowed border-transparent'
                  : checked
                  ? 'bg-indigo-500/10 border-indigo-500/30'
                  : 'border-[#1e3a5f]/50 hover:border-[#1e3a5f] hover:bg-[#0f2040]/40'
              }`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                checked ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
              }`}>
                {checked && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${checked ? 'text-slate-100' : 'text-slate-300'}`}>
                  {SECTION_LABELS[key].label}
                  {!present && <span className="ml-2 text-xs text-slate-600">(not detected)</span>}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{SECTION_LABELS[key].description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-5 py-4 border-t border-[#1e3a5f]/50 flex items-center gap-3">
        <button
          onClick={onApply}
          disabled={selected.size === 0}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            selected.size > 0
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
              : 'bg-[#0f2040]/60 text-slate-600 cursor-not-allowed'
          }`}
        >
          <ChevronRight size={15} />
          Apply {selected.size} Section{selected.size !== 1 ? 's' : ''} to Dashboard
        </button>
        <button
          onClick={onDiscard}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          Discard
        </button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DataIngestion() {
  const [activeTab, setActiveTab] = useState<'documents' | 'news' | 'bps'>('documents');

  // Document analysis state
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // BPS search state
  const [bpsSearching, setBpsSearching] = useState(false);
  const [bpsLog, setBpsLog] = useState<string[]>([]);
  const bpsLogEndRef = useRef<HTMLDivElement>(null);

  // News state
  const [fetchingNews, setFetchingNews] = useState(false);
  const [newsStatus, setNewsStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [newsLog, setNewsLog] = useState<string[]>([]);
  const newsLogEndRef = useRef<HTMLDivElement>(null);

  // Pending payload (selection before apply)
  const [pendingPayload, setPendingPayload] = useState<IngestPayload | null>(null);
  const [selectedSections, setSelectedSections] = useState<Set<SectionKey>>(new Set());
  const [applyStatus, setApplyStatus] = useState<'idle' | 'applied'>('idle');

  const { data, setData } = useDataStore();
  const reportStore = useReportStore();
  const { newsItems, setNewsItems } = reportStore;

  useEffect(() => { newsLogEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [newsLog]);
  useEffect(() => { bpsLogEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [bpsLog]);

  // ── Drag & drop ───────────────────────────────────────────────────────────

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const entries: FileEntry[] = arr.map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      file: f,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...entries]);
    setPendingPayload(null);
    setApplyStatus('idle');
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  // ── Receive payload → show selection panel ─────────────────────────────

  const receivePendingPayload = (payload: IngestPayload) => {
    setPendingPayload(payload);
    setApplyStatus('idle');
    // Pre-select all detected sections
    const allKeys = Object.keys(SECTION_LABELS) as SectionKey[];
    const present = new Set(allKeys.filter((k) => sectionPresent(payload, k)));
    setSelectedSections(present);
  };

  // ── Apply selected sections to stores ──────────────────────────────────

  const applySelectedSections = () => {
    if (!pendingPayload) return;
    const p = pendingPayload;

    if (selectedSections.has('chartData')) {
      const economicData: EconomicData = {
        gdpData:        p.gdpData        ?? [],
        investmentData: p.investmentData ?? [],
        inflationData:  p.inflationData  ?? [],
        summary:        p.summary        ?? '',
      };
      setData(economicData);
    }

    reportStore.setFullPayload({
      ...(selectedSections.has('dashboardStats')  ? { dashboardStats:  p.dashboardStats }  : {}),
      ...(selectedSections.has('chartData')       ? { gdpHistorical:   p.gdpHistorical }   : {}),
      ...(selectedSections.has('macroGrid')       ? { macroGrid:       p.macroGrid }       : {}),
      ...(selectedSections.has('sectorSummaries') ? { sectorSummaries: p.sectorSummaries } : {}),
      ...(selectedSections.has('infraProjects')   ? { infraProjects:   p.infraProjects }   : {}),
      ...(selectedSections.has('geoEvents')       ? { geoEvents:       p.geoEvents }       : {}),
      ...(selectedSections.has('geoEvents') && p.newsItems ? { newsItems: p.newsItems } : {}),
    });

    setApplyStatus('applied');
    setPendingPayload(null);
  };

  // ── Analyze files ──────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!files.length) return;
    setAnalyzing(true);
    setPendingPayload(null);
    setApplyStatus('idle');
    setAnalysisLog(['Reading files…']);

    const form = new FormData();
    for (const entry of files) form.append('files', entry.file);

    try {
      setAnalysisLog((l) => [...l, `Sending ${files.length} file(s) to Claude for analysis…`]);
      const res = await fetch('/api/analyze-files', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Analysis failed');

      setAnalysisLog((l) => [...l, 'Extracting economic data…', 'Analysis complete — choose sections to apply below.']);
      setFiles((prev) => prev.map((f) => ({ ...f, status: 'done' as const })));
      receivePendingPayload(json as IngestPayload);
    } catch (err) {
      setFiles((prev) => prev.map((f) => ({ ...f, status: 'error' as const })));
      setAnalysisLog((l) => [...l, `Error: ${err instanceof Error ? err.message : String(err)}`]);
    } finally {
      setAnalyzing(false);
    }
  };

  // ── BPS Search ─────────────────────────────────────────────────────────────

  const handleBPSSearch = async () => {
    setBpsSearching(true);
    setPendingPayload(null);
    setApplyStatus('idle');
    setBpsLog([]);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bps: true }),
      });
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        for (const line of chunk.split('\n')) {
          if (line.startsWith('[LOG]'))
            setBpsLog((prev) => [...prev, line.replace('[LOG]', '').trim()]);
          if (line.startsWith('[ERROR]'))
            setBpsLog((prev) => [...prev, `⚠ ${line.replace('[ERROR]', '').trim()}`]);
        }
      }

      const payloadLine = full.split('\n').find((l) => l.startsWith('[PAYLOAD]'));
      if (!payloadLine) throw new Error('No payload returned');

      const payload: IngestPayload = JSON.parse(payloadLine.slice('[PAYLOAD] '.length));
      setBpsLog((prev) => [...prev, '✓ Data extracted — choose sections to apply below.']);
      receivePendingPayload(payload);
    } catch (err) {
      setBpsLog((prev) => [...prev, `Error: ${err instanceof Error ? err.message : String(err)}`]);
    } finally {
      setBpsSearching(false);
    }
  };

  // ── Fetch news ─────────────────────────────────────────────────────────────

  const handleFetchNews = async () => {
    setFetchingNews(true);
    setNewsStatus('idle');
    setNewsLog([]);

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        for (const line of chunk.split('\n')) {
          if (line.startsWith('[LOG]'))
            setNewsLog((prev) => [...prev, line.replace('[LOG]', '').trim()]);
          if (line.startsWith('[ERROR]'))
            setNewsLog((prev) => [...prev, `⚠ ${line.replace('[ERROR]', '').trim()}`]);
        }
      }

      const payloadLine = full.split('\n').find((l) => l.startsWith('[PAYLOAD]'));
      if (!payloadLine) throw new Error('No payload returned');

      const items: NewsItem[] = JSON.parse(payloadLine.slice('[PAYLOAD] '.length));
      setNewsItems(items);
      setNewsStatus('success');
    } catch (err) {
      setNewsStatus('error');
      setNewsLog((prev) => [...prev, `Error: ${err instanceof Error ? err.message : String(err)}`]);
    } finally {
      setFetchingNews(false);
    }
  };

  // ── Export XLSX ────────────────────────────────────────────────────────────

  const downloadXLSX = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.gdpData), 'GDP');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.investmentData), 'Investment');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.inflationData), 'Inflation');
    XLSX.writeFile(wb, 'Batam_Economic_Data.xlsx');
  };

  const TABS = [
    { id: 'documents' as const, label: 'Document Analysis', icon: '📄' },
    { id: 'bps'       as const, label: 'BPS Search',        icon: '🔍' },
    { id: 'news'      as const, label: 'News Intelligence', icon: '📰' },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Data Ingestion</h2>
        <p className="text-slate-400 mt-1 text-sm">
          Upload documents, search BPS Batam statistics, or fetch the latest news — then choose
          exactly which sections to apply to the dashboard.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0b1829] border border-[#1e3a5f]/50 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#0f2040] text-indigo-300 ring-1 ring-inset ring-indigo-500/30'
                : 'text-[#8892a4] hover:text-slate-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Documents Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#1e3a5f]/50 hover:border-indigo-500/50 transition-colors rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            <UploadCloud size={40} className="text-slate-600 group-hover:text-indigo-400 mb-3 transition-colors" />
            <p className="text-slate-300 font-semibold">Drop files here or click to browse</p>
            <p className="text-slate-500 text-sm mt-1">PDF · Excel (XLSX) · CSV · PNG / JPG</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1e3a5f]/50 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => { setFiles([]); setPendingPayload(null); setApplyStatus('idle'); }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <ul className="divide-y divide-[#1e3a5f]/40">
                {files.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3 px-4 py-3">
                    {fileIcon(entry.file)}
                    <span className="flex-1 text-sm text-slate-300 truncate">{entry.file.name}</span>
                    <span className="text-xs text-slate-500 shrink-0">{formatBytes(entry.file.size)}</span>
                    {entry.status === 'done' && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                    {entry.status === 'error' && <AlertCircle size={15} className="text-rose-400 shrink-0" />}
                    {entry.status === 'pending' && (
                      <button onClick={(e) => { e.stopPropagation(); removeFile(entry.id); }} className="text-slate-600 hover:text-slate-300 shrink-0">
                        <X size={15} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!files.length || analyzing}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                !files.length || analyzing
                  ? 'bg-indigo-500/30 text-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]'
              }`}
            >
              <Sparkles size={15} className={analyzing ? 'animate-pulse' : ''} />
              {analyzing ? 'Analysing…' : 'Analyse Files with Claude'}
            </button>

            {applyStatus === 'applied' && data && data.gdpData.length > 0 && (
              <button
                onClick={downloadXLSX}
                className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 px-3 py-2 rounded-lg transition-colors"
              >
                <Download size={15} />
                Export XLSX
              </button>
            )}

            {applyStatus === 'applied' && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                <CheckCircle2 size={15} /> Dashboard updated
              </span>
            )}
          </div>

          {analysisLog.length > 0 && (
            <div className="bg-[#020917]/95 border border-[#1e3a5f]/40 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1 max-h-40 overflow-y-auto">
              {analysisLog.map((line, i) => (
                <div key={i}><span className="text-indigo-500 select-none">› </span>{line}</div>
              ))}
            </div>
          )}

          {pendingPayload && (
            <DataPreview payload={pendingPayload} />
          )}

          {pendingPayload && (
            <SelectionPanel
              payload={pendingPayload}
              selected={selectedSections}
              onToggle={(k) => setSelectedSections((prev) => {
                const next = new Set(prev);
                next.has(k) ? next.delete(k) : next.add(k);
                return next;
              })}
              onApply={applySelectedSections}
              onDiscard={() => { setPendingPayload(null); setApplyStatus('idle'); }}
            />
          )}

          <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-xl p-4 text-xs text-slate-500 space-y-1">
            <p className="font-medium text-slate-400">Supported file types</p>
            <p><span className="text-rose-400">PDF</span> — BPS publications, annual reports, government documents</p>
            <p><span className="text-emerald-400">XLSX / CSV</span> — GDP tables, investment data, sector statistics</p>
            <p><span className="text-amber-400">Images</span> — infographics, chart screenshots, data slides</p>
          </div>
        </div>
      )}

      {/* ── BPS Search Tab ────────────────────────────────────────────────── */}
      {activeTab === 'bps' && (
        <div className="space-y-6">
          <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
                <Database size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-200">BPS Batam Statistics Search</h3>
                <p className="text-xs text-slate-500">Searches BPS Batam via Genspark · Claude synthesis</p>
              </div>
            </div>

            <p className="text-sm text-slate-400">
              Runs targeted searches for BPS Batam (Badan Pusat Statistik) data using Genspark,
              which can access BPS statistics via search-indexed snippets. Claude then synthesises
              the results into structured economic indicators for Batam FTZ.
            </p>

            <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium text-slate-400">Queries being run:</p>
              {[
                '"BPS Batam" OR "batamkota.bps.go.id" PDRB pertumbuhan ekonomi 2024 2025',
                'site:bps.go.id Batam Kepri GRDP growth manufacturing 2024 2025',
              ].map((q, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
                  <span className="text-indigo-500 shrink-0 mt-0.5">›</span>
                  <span className="font-mono">{q}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleBPSSearch}
              disabled={bpsSearching}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                bpsSearching
                  ? 'bg-blue-500/30 text-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
              }`}
            >
              <RefreshCw size={15} className={bpsSearching ? 'animate-spin' : ''} />
              {bpsSearching ? 'Searching BPS…' : 'Search BPS Batam'}
            </button>
          </div>

          {bpsLog.length > 0 && (
            <div className="bg-[#020917]/95 border border-[#1e3a5f]/40 rounded-xl p-4 font-mono text-xs h-[200px] flex flex-col">
              <div className="flex items-center gap-2 text-slate-500 border-b border-[#1e3a5f]/50 pb-2 mb-2">
                <Terminal size={13} />
                <span>Search Agent Output</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 text-slate-300">
                {bpsLog.map((line, i) => (
                  <div key={i}><span className="text-blue-500 select-none">› </span>{line}</div>
                ))}
                {bpsSearching && <div className="text-blue-400 animate-pulse">█</div>}
                <div ref={bpsLogEndRef} />
              </div>
            </div>
          )}

          {pendingPayload && activeTab === 'bps' && (
            <DataPreview payload={pendingPayload} />
          )}

          {pendingPayload && activeTab === 'bps' && (
            <SelectionPanel
              payload={pendingPayload}
              selected={selectedSections}
              onToggle={(k) => setSelectedSections((prev) => {
                const next = new Set(prev);
                next.has(k) ? next.delete(k) : next.add(k);
                return next;
              })}
              onApply={applySelectedSections}
              onDiscard={() => { setPendingPayload(null); setApplyStatus('idle'); }}
            />
          )}

          {applyStatus === 'applied' && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 rounded-xl px-4 py-3">
              <CheckCircle2 size={16} />
              Selected sections have been applied to the dashboard.
            </div>
          )}
        </div>
      )}

      {/* ── News Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Newspaper size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-200">Batam FTZ News Feed</h3>
                  <p className="text-xs text-slate-400">Genspark + Claude</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Searches news aggregators (Reuters, Jakarta Post, Straits Times, Business Times) for
                the latest Batam FTZ economic, investment, and infrastructure news.
              </p>
              {newsStatus === 'success' && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle2 size={15} /> {newsItems.length} news items fetched
                </div>
              )}
              {newsStatus === 'error' && (
                <div className="flex items-center gap-2 text-rose-400 text-sm">
                  <AlertCircle size={15} /> Fetch failed — see terminal
                </div>
              )}
              <button
                onClick={handleFetchNews}
                disabled={fetchingNews}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  fetchingNews
                    ? 'bg-indigo-500/30 text-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                }`}
              >
                <RefreshCw size={15} className={fetchingNews ? 'animate-spin' : ''} />
                {fetchingNews ? 'Fetching…' : 'Fetch Latest News'}
              </button>
            </div>

            <div className="bg-[#020917]/95 border border-[#1e3a5f]/40 rounded-xl p-4 font-mono text-xs h-[220px] flex flex-col">
              <div className="flex items-center gap-2 text-slate-500 border-b border-[#1e3a5f]/50 pb-2 mb-2">
                <Terminal size={13} />
                <span>Agent Output</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 text-slate-300">
                {newsLog.length === 0 && !fetchingNews && (
                  <span className="text-slate-600 italic">Waiting for request…</span>
                )}
                {newsLog.map((line, i) => (
                  <div key={i}><span className="text-indigo-500 select-none">› </span>{line}</div>
                ))}
                {fetchingNews && <div className="text-indigo-400 animate-pulse">█</div>}
                <div ref={newsLogEndRef} />
              </div>
            </div>
          </div>

          {newsItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">{newsItems.length} News Items</h3>

              {/* Featured article */}
              <div className={`bg-[#0b1829] border border-[#1e3a5f]/50 rounded-xl overflow-hidden border-l-4 ${CATEGORY_BORDER[newsItems[0].category] ?? 'border-slate-500'}`}>
                {newsItems[0].imageUrl && (
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={newsItems[0].imageUrl}
                      alt=""
                      className="w-full h-full object-cover opacity-70"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1829] to-transparent" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[newsItems[0].category] ?? 'bg-slate-700 text-slate-300'}`}>
                      {newsItems[0].category}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded ${
                      newsItems[0].relevance === 'high'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : newsItems[0].relevance === 'medium'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-slate-500/15 text-slate-400'
                    }`}>
                      {newsItems[0].relevance}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-100 leading-snug mb-3">{newsItems[0].title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{newsItems[0].summary}</p>
                  <p className="text-xs text-slate-600">{newsItems[0].source} · {newsItems[0].date}</p>
                </div>
              </div>

              {/* Secondary grid */}
              {newsItems.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newsItems.slice(1).map((item) => (
                    <div
                      key={item.id}
                      className={`bg-[#0b1829] border border-[#1e3a5f]/50 rounded-xl overflow-hidden border-l-[3px] ${CATEGORY_BORDER[item.category] ?? 'border-slate-500'} hover:bg-[#0f2040]/60 transition-colors`}
                    >
                      {item.imageUrl && (
                        <div className="h-24 overflow-hidden relative">
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-full h-full object-cover opacity-60"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1829] to-transparent" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] ?? 'bg-slate-700 text-slate-300'}`}>
                            {item.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100 leading-snug mb-1">{item.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2 line-clamp-2">{item.summary}</p>
                        <p className="text-xs text-slate-600">{item.source} · {item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {newsItems.length === 0 && newsStatus !== 'error' && (
            <div className="text-center py-12 text-slate-600">
              <Newspaper size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Click "Fetch Latest News" to load the news feed.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
