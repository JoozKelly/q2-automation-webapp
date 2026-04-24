"use client";

import { useState, useRef, useEffect } from 'react';
import { RefreshCw, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Terminal, Download } from 'lucide-react';
import { useDataStore, EconomicData } from '@/context/store';
import { useReportStore } from '@/store/reportStore';
import type { DashboardStats, GDPDataPoint, InfraProject, GeoEvent, SectorSummary, MacroGridGroup } from '@/types/report';
import * as XLSX from 'xlsx';
import { parseWorkbook, parseGDPSheet, detectGDPSheet } from '@/lib/parsers/xlsx';

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

export default function DataIngestion() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, setData } = useDataStore();
  const { setGDPHistorical, setRawWorkbook, setFullPayload } = useReportStore();

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const applyPayload = (payload: IngestPayload) => {
    // Update the chart store (simple timeseries for dashboard charts)
    const economicData: EconomicData = {
      gdpData:        payload.gdpData        ?? [],
      investmentData: payload.investmentData ?? [],
      inflationData:  payload.inflationData  ?? [],
      summary:        payload.summary        ?? '',
    };
    setData(economicData);

    // Update the report store (rich structured data for all sections)
    setFullPayload({
      gdpHistorical:   payload.gdpHistorical,
      infraProjects:   payload.infraProjects,
      geoEvents:       payload.geoEvents,
      macroGrid:       payload.macroGrid,
      sectorSummaries: payload.sectorSummaries,
      dashboardStats:  payload.dashboardStats,
    });
  };

  const handleGensparkSearch = async () => {
    setIsSearching(true);
    setSearchStatus('idle');
    setLogs([]);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Batam FTZ Q2 2026 GDP growth investment inflation infrastructure sector projects geopolitics',
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullOutput = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullOutput += chunk;

        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('[LOG]')) {
            setLogs((prev) => [...prev, line.replace('[LOG]', '').trim()]);
          }
          if (line.startsWith('[ERROR]')) {
            setLogs((prev) => [...prev, `⚠ ${line.replace('[ERROR]', '').trim()}`]);
          }
        }
      }

      // Extract [PAYLOAD] line — could be large, so search by prefix
      const payloadLine = fullOutput
        .split('\n')
        .find((l) => l.startsWith('[PAYLOAD]'));

      if (payloadLine) {
        const payload: IngestPayload = JSON.parse(payloadLine.slice('[PAYLOAD] '.length));
        applyPayload(payload);
        setSearchStatus('success');
      } else {
        throw new Error('No structured payload returned');
      }
    } catch (err) {
      console.error(err);
      setSearchStatus('error');
      setLogs((prev) => [...prev, `Error: ${err instanceof Error ? err.message : String(err)}`]);
    } finally {
      setIsSearching(false);
    }
  };

  // Try to detect and parse an investment sheet (quarterly foreign/domestic)
  const tryParseInvestmentSheet = (wb: Record<string, Record<string, unknown>[]>) => {
    const keywords = ['invest', 'fdi', 'capital', 'modal', 'realisasi'];
    for (const [name, rows] of Object.entries(wb)) {
      if (!keywords.some((kw) => name.toLowerCase().includes(kw))) continue;
      if (rows.length === 0) continue;
      const keys = Object.keys(rows[0]);
      const quarterKey = keys.find((k) =>
        ['quarter', 'quartal', 'period', 'periode', 'q'].some((kw) => k.toLowerCase().includes(kw))
      );
      const foreignKey = keys.find((k) =>
        ['foreign', 'fdi', 'pma', 'asing'].some((kw) => k.toLowerCase().includes(kw))
      );
      const domesticKey = keys.find((k) =>
        ['domestic', 'pmdn', 'dalam negeri'].some((kw) => k.toLowerCase().includes(kw))
      );
      if (quarterKey && foreignKey) {
        return rows.map((r) => ({
          quarter: String(r[quarterKey] ?? ''),
          foreign: Number(r[foreignKey] ?? 0),
          domestic: domesticKey ? Number(r[domesticKey] ?? 0) : 0,
        }));
      }
    }
    return null;
  };

  // Try to detect and parse an inflation sheet (monthly rate)
  const tryParseInflationSheet = (wb: Record<string, Record<string, unknown>[]>) => {
    const keywords = ['inflat', 'cpi', 'ipc', 'harga', 'price', 'ihk'];
    for (const [name, rows] of Object.entries(wb)) {
      if (!keywords.some((kw) => name.toLowerCase().includes(kw))) continue;
      if (rows.length === 0) continue;
      const keys = Object.keys(rows[0]);
      const monthKey = keys.find((k) =>
        ['month', 'bulan', 'period', 'mon'].some((kw) => k.toLowerCase().includes(kw))
      );
      const rateKey = keys.find((k) =>
        ['rate', 'inflat', 'pct', '%', 'laju'].some((kw) => k.toLowerCase().includes(kw))
      );
      if (monthKey && rateKey) {
        return rows.map((r) => ({
          month: String(r[monthKey] ?? ''),
          rate: Number(r[rateKey] ?? 0),
        }));
      }
    }
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setUploadStatus('uploading');

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const buffer = ev.target?.result as ArrayBuffer;
        const wb = parseWorkbook(buffer);

        // ── GDP ──────────────────────────────────────────────────────────────
        const gdpSheetKey = detectGDPSheet(wb);
        const gdpRows = gdpSheetKey ? parseGDPSheet(wb[gdpSheetKey]) : [];
        setGDPHistorical(gdpRows);
        setRawWorkbook(wb, file.name);

        const gdpData = gdpRows
          .filter((d) => d.year >= 2018)
          .map((d) => ({
            year: String(d.year),
            gdp: d.gdpGrowthPct ?? 0,
            target: Math.max(0, (d.gdpGrowthPct ?? 0) - 0.4),
          }));

        const gdpHistorical: GDPDataPoint[] = gdpRows.map((d) => ({
          year: d.year,
          gdpGrowthPct: d.gdpGrowthPct,
          gdpTrillionIDR: d.gdpTrillionIDR,
        }));

        // ── Investment (optional sheet) ────────────────────────────────────
        const investmentData = tryParseInvestmentSheet(wb) ?? [];

        // ── Inflation (optional sheet) ─────────────────────────────────────
        const inflationData = tryParseInflationSheet(wb) ?? [];

        // ── Dashboard stats derived from parsed GDP ────────────────────────
        const lastGDP = gdpRows.at(-1);
        const prevGDP = gdpRows.at(-2);
        const lastFDI = investmentData.at(-1);
        const prevFDI = investmentData.at(-2);
        const lastInflation = inflationData.at(-1);
        const prevInflation = inflationData.at(-2);

        const dashboardStats: DashboardStats = {
          gdpGrowthPct: lastGDP?.gdpGrowthPct ?? 0,
          gdpGrowthChange:
            lastGDP && prevGDP && prevGDP.gdpGrowthPct != null && lastGDP.gdpGrowthPct != null
              ? `${lastGDP.gdpGrowthPct - prevGDP.gdpGrowthPct >= 0 ? '+' : ''}${(lastGDP.gdpGrowthPct - prevGDP.gdpGrowthPct).toFixed(1)}%`
              : '—',
          fdiInflow: lastFDI ? `$${lastFDI.foreign}M` : '—',
          fdiChange:
            lastFDI && prevFDI
              ? `${lastFDI.foreign >= prevFDI.foreign ? '+' : ''}${(((lastFDI.foreign - prevFDI.foreign) / Math.abs(prevFDI.foreign)) * 100).toFixed(1)}%`
              : '—',
          inflationRate: lastInflation?.rate ?? 0,
          inflationChange:
            lastInflation && prevInflation
              ? `${lastInflation.rate >= prevInflation.rate ? '+' : ''}${(lastInflation.rate - prevInflation.rate).toFixed(1)}%`
              : '—',
          totalProjects: 0,
          period: 'Q2 2026',
          lastUpdated: new Date().toISOString(),
          dataSource: 'upload',
        };

        const economicData: EconomicData = {
          gdpData: gdpData.length > 0 ? gdpData : [],
          investmentData,
          inflationData,
          summary: `Uploaded ${file.name}. Parsed ${gdpRows.length} GDP rows from "${gdpSheetKey}".${investmentData.length ? ` ${investmentData.length} investment quarters.` : ''}${inflationData.length ? ` ${inflationData.length} inflation months.` : ''}`,
        };

        setData(economicData);
        setFullPayload({ gdpHistorical, dashboardStats });
        setUploadStatus('success');
      } catch (err) {
        console.error('Failed to parse file:', err);
        setUploadStatus('error');
      }
    };
    reader.onerror = () => setUploadStatus('error');
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const downloadXLSX = () => {
    if (!data) return;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.gdpData), 'GDP Data');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.investmentData), 'Investment');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.inflationData), 'Inflation');
    XLSX.writeFile(workbook, 'Batam_Economic_Data_Ingested.xlsx');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Data Ingestion</h2>
        <p className="text-slate-400 mt-2">
          Run an AI-powered web search to pull live Batam FTZ economic data, or upload your own
          XLSX / CSV file. Both paths update every section of the dashboard and report.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genspark + Claude Superagent Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <RefreshCw size={22} className={isSearching ? 'animate-spin' : ''} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200">AI Superagent Search</h3>
                <p className="text-sm text-slate-400">Genspark + Claude — live Batam data</p>
              </div>
            </div>
            {searchStatus === 'success' && data && data.gdpData.length > 0 && (
              <button
                onClick={downloadXLSX}
                className="flex items-center space-x-2 text-sm text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Download size={16} />
                <span>Export XLSX</span>
              </button>
            )}
          </div>

          <p className="text-sm text-slate-400 flex-1">
            Searches the web via{' '}
            <code className="bg-slate-800 text-indigo-300 px-1 py-0.5 rounded">@genspark/cli</code>
            , then uses Claude to extract and structure a complete economic intelligence payload —
            GDP, investment, inflation, infrastructure, geopolitical events, sector activity, and
            macro trend grid.
          </p>

          {searchStatus === 'error' && (
            <div className="flex items-center space-x-2 text-rose-400 bg-rose-400/10 p-3 rounded-lg text-sm border border-rose-400/20">
              <AlertCircle size={16} />
              <span>Search failed. Check the terminal for details.</span>
            </div>
          )}

          {searchStatus === 'success' && (
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-400/10 p-3 rounded-lg text-sm border border-emerald-400/20">
              <CheckCircle2 size={16} />
              <span>All sections updated with live data.</span>
            </div>
          )}

          <button
            onClick={handleGensparkSearch}
            disabled={isSearching}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
              isSearching
                ? 'bg-indigo-500/40 text-indigo-200 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
            }`}
          >
            {isSearching ? 'Collecting data…' : 'Run AI Search & Refresh Dashboard'}
          </button>
        </div>

        {/* Live terminal */}
        <div className="bg-black/80 border border-slate-800 rounded-xl p-4 backdrop-blur-sm flex flex-col font-mono text-xs overflow-hidden h-[300px]">
          <div className="flex items-center space-x-2 text-slate-500 border-b border-slate-800 pb-2 mb-2">
            <Terminal size={14} />
            <span>Agent Output</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-slate-300">
            {logs.length === 0 && !isSearching && (
              <div className="text-slate-600 italic">Waiting for search…</div>
            )}
            {logs.map((log, i) => (
              <div key={i} className="break-all leading-relaxed">
                <span className="text-indigo-500 select-none">› </span>
                {log}
              </div>
            ))}
            {isSearching && <div className="text-indigo-400 animate-pulse">█</div>}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      {/* Manual Upload Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm max-w-lg">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Manual Excel / CSV Upload</h3>
            <p className="text-sm text-slate-400">
              Auto-detects GDP, investment &amp; inflation sheets
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 transition-colors rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          {uploadStatus === 'uploading' ? (
            <>
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-blue-300">Parsing {uploadedFileName}…</p>
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-emerald-300">{uploadedFileName}</p>
              <p className="text-xs text-slate-400 mt-1">Data loaded — click to replace</p>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <AlertCircle size={32} className="text-rose-400 mb-2" />
              <p className="text-sm font-medium text-rose-300">Parse failed. Try another file.</p>
            </>
          ) : (
            <>
              <UploadCloud
                size={32}
                className="text-slate-500 group-hover:text-blue-400 mb-2 transition-colors"
              />
              <p className="text-sm font-medium text-slate-300">Click to upload or drag & drop</p>
              <p className="text-xs text-slate-500 mt-1">
                XLSX / CSV · GDP, Investment &amp; Inflation sheets auto-detected
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
