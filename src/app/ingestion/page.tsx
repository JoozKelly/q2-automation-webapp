"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud, FileText, FileSpreadsheet, Image, X,
  Sparkles, Newspaper, CheckCircle2, AlertCircle, Terminal,
  Download, RefreshCw,
} from 'lucide-react';
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
  summary?: string;
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

// ─── News category badge ────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  fdi:            'bg-blue-500/15 text-blue-300',
  infrastructure: 'bg-orange-500/15 text-orange-300',
  policy:         'bg-purple-500/15 text-purple-300',
  sector:         'bg-emerald-500/15 text-emerald-300',
  geopolitics:    'bg-rose-500/15 text-rose-300',
  economy:        'bg-indigo-500/15 text-indigo-300',
};

const RELEVANCE_DOT: Record<string, string> = {
  high:   'bg-emerald-400',
  medium: 'bg-amber-400',
  low:    'bg-slate-500',
};

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DataIngestion() {
  const [activeTab, setActiveTab] = useState<'documents' | 'news'>('documents');

  // Document analysis state
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // News state
  const [fetchingNews, setFetchingNews] = useState(false);
  const [newsStatus, setNewsStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [newsLog, setNewsLog] = useState<string[]>([]);
  const newsLogEndRef = useRef<HTMLDivElement>(null);

  const { data, setData } = useDataStore();
  const { setFullPayload, newsItems, setNewsItems } = useReportStore();

  // Auto-scroll news log
  useEffect(() => {
    newsLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [newsLog]);

  // ── Drag & drop ───────────────────────────────────────────────────────────

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const entries: FileEntry[] = arr.map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      file: f,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...entries]);
    setAnalysisStatus('idle');
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  // ── Apply payload to stores ────────────────────────────────────────────────

  const applyPayload = (payload: IngestPayload) => {
    const economicData: EconomicData = {
      gdpData:        payload.gdpData        ?? [],
      investmentData: payload.investmentData ?? [],
      inflationData:  payload.inflationData  ?? [],
      summary:        payload.summary        ?? '',
    };
    setData(economicData);
    setFullPayload({
      gdpHistorical:   payload.gdpHistorical,
      infraProjects:   payload.infraProjects,
      geoEvents:       payload.geoEvents,
      macroGrid:       payload.macroGrid,
      sectorSummaries: payload.sectorSummaries,
      dashboardStats:  payload.dashboardStats,
    });
  };

  // ── Analyze files ──────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!files.length) return;
    setAnalyzing(true);
    setAnalysisStatus('idle');
    setAnalysisLog(['Reading files…']);

    const form = new FormData();
    for (const entry of files) form.append('files', entry.file);

    try {
      setAnalysisLog((l) => [...l, `Sending ${files.length} file(s) to Claude for analysis…`]);
      const res = await fetch('/api/analyze-files', { method: 'POST', body: form });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? 'Analysis failed');

      setAnalysisLog((l) => [...l, 'Extracting economic data…', 'Populating dashboard…']);
      applyPayload(json);

      setFiles((prev) => prev.map((f) => ({ ...f, status: 'done' as const })));
      setAnalysisStatus('success');
      setAnalysisLog((l) => [...l, '✓ All sections updated.']);
    } catch (err) {
      setAnalysisStatus('error');
      setFiles((prev) => prev.map((f) => ({ ...f, status: 'error' as const })));
      setAnalysisLog((l) => [...l, `Error: ${err instanceof Error ? err.message : String(err)}`]);
    } finally {
      setAnalyzing(false);
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

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Data Ingestion</h2>
        <p className="text-slate-400 mt-1 text-sm">
          Upload economic documents (PDF, Excel, CSV, images) to auto-populate the dashboard, or
          fetch the latest Batam FTZ news.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/50 border border-slate-800 p-1 rounded-xl w-fit">
        {(['documents', 'news'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-indigo-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'documents' ? '📄 Document Analysis' : '📰 News Intelligence'}
          </button>
        ))}
      </div>

      {/* ── Documents Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 transition-colors rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            <UploadCloud
              size={40}
              className="text-slate-600 group-hover:text-indigo-400 mb-3 transition-colors"
            />
            <p className="text-slate-300 font-semibold">
              Drop files here or click to browse
            </p>
            <p className="text-slate-500 text-sm mt-1">
              PDF · Excel (XLSX) · CSV · PNG / JPG — multiple files supported
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => { setFiles([]); setAnalysisStatus('idle'); }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <ul className="divide-y divide-slate-800/60">
                {files.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3 px-4 py-3">
                    {fileIcon(entry.file)}
                    <span className="flex-1 text-sm text-slate-300 truncate">
                      {entry.file.name}
                    </span>
                    <span className="text-xs text-slate-500 shrink-0">
                      {formatBytes(entry.file.size)}
                    </span>
                    {entry.status === 'done' && <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
                    {entry.status === 'error' && <AlertCircle size={15} className="text-rose-400 shrink-0" />}
                    {entry.status === 'pending' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(entry.id); }}
                        className="text-slate-600 hover:text-slate-300 transition-colors shrink-0"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Status + action row */}
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
              {analyzing ? 'Analysing…' : 'Analyse Files & Update Dashboard'}
            </button>

            {analysisStatus === 'success' && data && data.gdpData.length > 0 && (
              <button
                onClick={downloadXLSX}
                className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 px-3 py-2 rounded-lg transition-colors"
              >
                <Download size={15} />
                Export XLSX
              </button>
            )}

            {analysisStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                <CheckCircle2 size={15} /> All sections updated
              </span>
            )}
            {analysisStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-sm text-rose-400">
                <AlertCircle size={15} /> Analysis failed — see log
              </span>
            )}
          </div>

          {/* Analysis log */}
          {analysisLog.length > 0 && (
            <div className="bg-black/70 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1 max-h-40 overflow-y-auto">
              {analysisLog.map((line, i) => (
                <div key={i}>
                  <span className="text-indigo-500 select-none">› </span>
                  {line}
                </div>
              ))}
            </div>
          )}

          {/* Help text */}
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4 text-xs text-slate-500 space-y-1">
            <p className="font-medium text-slate-400">Supported file types</p>
            <p>
              <span className="text-rose-400">PDF</span> — annual reports, BPS publications, government documents, presentations
            </p>
            <p>
              <span className="text-emerald-400">XLSX / CSV</span> — GDP tables, investment data, sector statistics (any sheet structure)
            </p>
            <p>
              <span className="text-amber-400">Images</span> — infographics, chart screenshots, data slides — Claude reads them visually
            </p>
            <p className="pt-1 text-slate-600">
              Claude will read all uploaded files simultaneously and extract every data point it can find. Missing fields are estimated from its knowledge.
            </p>
          </div>
        </div>
      )}

      {/* ── News Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fetch card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Newspaper size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-200">Batam FTZ News Feed</h3>
                  <p className="text-xs text-slate-400">Powered by Genspark + Claude</p>
                </div>
              </div>

              <p className="text-sm text-slate-400">
                Searches news aggregators (Reuters, Jakarta Post, Straits Times, Business Times) for
                the latest Batam FTZ economic, investment, and infrastructure news.
              </p>

              {newsStatus === 'success' && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle2 size={15} />
                  {newsItems.length} news items fetched
                </div>
              )}
              {newsStatus === 'error' && (
                <div className="flex items-center gap-2 text-rose-400 text-sm">
                  <AlertCircle size={15} />
                  Fetch failed — see terminal
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

            {/* Terminal */}
            <div className="bg-black/80 border border-slate-800 rounded-xl p-4 font-mono text-xs h-[220px] flex flex-col">
              <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 pb-2 mb-2">
                <Terminal size={13} />
                <span>Agent Output</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 text-slate-300">
                {newsLog.length === 0 && !fetchingNews && (
                  <span className="text-slate-600 italic">Waiting for request…</span>
                )}
                {newsLog.map((line, i) => (
                  <div key={i}>
                    <span className="text-indigo-500 select-none">› </span>
                    {line}
                  </div>
                ))}
                {fetchingNews && <div className="text-indigo-400 animate-pulse">█</div>}
                <div ref={newsLogEndRef} />
              </div>
            </div>
          </div>

          {/* News items */}
          {newsItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">
                {newsItems.length} News Items
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newsItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] ?? 'bg-slate-700 text-slate-300'}`}
                      >
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`w-2 h-2 rounded-full ${RELEVANCE_DOT[item.relevance] ?? 'bg-slate-500'}`}
                        />
                        <span className="text-xs text-slate-500 capitalize">{item.relevance}</span>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 leading-snug mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-2">
                      {item.summary}
                    </p>
                    <p className="text-xs text-slate-600">
                      {item.source} · {item.date}
                    </p>
                  </div>
                ))}
              </div>
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
