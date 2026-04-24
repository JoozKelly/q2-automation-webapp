"use client";

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Table2, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { useDataStore, EconomicData } from '@/context/store';
import { useReportStore } from '@/store/reportStore';
import type {
  DashboardStats, InfraProject, GeoEvent,
  SectorSummary, MacroGridGroup, NewsItem, ReportData,
} from '@/types/report';

interface ReportSnapshot {
  dashboardStats: DashboardStats | null;
  data: ReportData;
  sectorSummaries: SectorSummary[];
  macroGrid: MacroGridGroup[];
  newsItems: NewsItem[];
}

// ── Excel helpers ─────────────────────────────────────────────────────────────

function buildWorkbook(
  chartData: EconomicData | null,
  report: ReportSnapshot,
) {
  const wb = XLSX.utils.book_new();

  // 1. Dashboard Stats
  if (report.dashboardStats) {
    const { dashboardStats: s } = report;
    const rows = [
      { Metric: 'Period',            Value: s.period },
      { Metric: 'GDP Growth (%)',    Value: s.gdpGrowthPct },
      { Metric: 'GDP Growth Change', Value: s.gdpGrowthChange },
      { Metric: 'FDI Inflow',        Value: s.fdiInflow },
      { Metric: 'FDI Change',        Value: s.fdiChange },
      { Metric: 'Inflation Rate (%)', Value: s.inflationRate },
      { Metric: 'Inflation Change',  Value: s.inflationChange },
      { Metric: 'Active Projects',   Value: s.totalProjects },
      { Metric: 'Data Source',       Value: s.dataSource },
      { Metric: 'Last Updated',      Value: s.lastUpdated },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Dashboard Stats');
  }

  // 2. GDP Growth vs Target
  if (chartData?.gdpData?.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(chartData.gdpData), 'GDP Growth');
  }

  // 3. Investment Inflows
  if (chartData?.investmentData?.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(chartData.investmentData), 'Investment Inflows');
  }

  // 4. Inflation
  if (chartData?.inflationData?.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(chartData.inflationData), 'Inflation');
  }

  // 5. GDP Historical
  if (report.data.gdpHistorical?.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(report.data.gdpHistorical), 'GDP Historical');
  }

  // 6. Sector Summaries
  if (report.sectorSummaries?.length) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(report.sectorSummaries), 'Sectors');
  }

  // 7. Infrastructure Projects
  if (report.data.infraProjects?.length) {
    const rows = report.data.infraProjects.map((p) => ({
      ID: p.id, Type: p.type, Name: p.name,
      'Progress (%)': p.progress, Status: p.status, Notes: p.notes ?? '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Infrastructure');
  }

  // 8. Geopolitical Events
  if (report.data.geoEvents?.length) {
    const rows = report.data.geoEvents.map((ev) => ({
      ID: ev.id, Title: ev.title, Description: ev.description,
      Source: ev.source ?? '',
      'FDI Impact': ev.impact.fdi,
      'GDP Impact': ev.impact.gdp,
      'Tenant Risk': ev.impact.tenantRisk,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Geo Events');
  }

  // 9. Macro Indicator Grid
  if (report.macroGrid?.length) {
    const rows: Record<string, string>[] = [];
    for (const group of report.macroGrid) {
      for (const ind of group.indicators) {
        const row: Record<string, string> = { Category: group.category, Indicator: ind.name };
        ind.signals.forEach((sig, i) => { row[`Period ${i + 1}`] = sig; });
        rows.push(row);
      }
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Macro Grid');
  }

  // 10. News Items
  if (report.newsItems?.length) {
    const rows = report.newsItems.map((n) => ({
      ID: n.id, Title: n.title, Summary: n.summary,
      Source: n.source, Date: n.date, Category: n.category, Relevance: n.relevance,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'News');
  }

  return wb;
}

// ── Table preview ─────────────────────────────────────────────────────────────

function DataTable<T extends Record<string, unknown>>({
  title, rows, badge, onDownload,
}: { title: string; rows: T[]; badge?: number; onDownload: () => void }) {
  if (!rows.length) return null;
  const cols = Object.keys(rows[0]);

  return (
    <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#1e3a5f]/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table2 size={14} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          {badge != null && (
            <span className="text-[10px] bg-[#0f2040] text-slate-400 px-2 py-0.5 rounded-full border border-[#1e3a5f]/50">
              {badge} rows
            </span>
          )}
        </div>
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-all"
        >
          <Download size={12} />
          Download
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1e3a5f]/50">
              {cols.map((c) => (
                <th key={c} className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-[#060e1e]">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e3a5f]/30">
            {rows.slice(0, 10).map((row, i) => (
              <tr key={i} className="hover:bg-[#0f2040]/40 transition-colors">
                {cols.map((c) => (
                  <td key={c} className="px-4 py-2.5 text-slate-300 max-w-[200px] truncate">
                    {String(row[c] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length > 10 && (
              <tr>
                <td colSpan={cols.length} className="px-4 py-2.5 text-slate-600 italic text-center text-[11px]">
                  +{rows.length - 10} more rows in the downloaded file
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Download one sheet ────────────────────────────────────────────────────────

function dlSheet<T>(rows: T[], filename: string) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Data');
  XLSX.writeFile(wb, filename);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExportPage() {
  const { data: chartData } = useDataStore();
  const report = useReportStore();
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadAll = () => {
    const wb = buildWorkbook(chartData, report);
    if (wb.SheetNames.length === 0) return;
    XLSX.writeFile(wb, 'VANTAGE_Batam_FTZ_Data.xlsx');
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const hasAnyData = chartData || report.dashboardStats || report.data.infraProjects.length > 0;

  // Build stat rows
  const statsRows = report.dashboardStats ? [
    { Metric: 'Period',            Value: report.dashboardStats.period },
    { Metric: 'GDP Growth (%)',    Value: report.dashboardStats.gdpGrowthPct },
    { Metric: 'FDI Inflow',        Value: report.dashboardStats.fdiInflow },
    { Metric: 'Inflation Rate (%)', Value: report.dashboardStats.inflationRate },
    { Metric: 'Active Projects',   Value: report.dashboardStats.totalProjects },
  ] : [];

  const infraRows = report.data.infraProjects.map((p) => ({
    ID: p.id, Type: p.type, Name: p.name,
    'Progress (%)': p.progress, Status: p.status, Notes: p.notes ?? '',
  }));

  const geoRows = report.data.geoEvents.map((ev) => ({
    ID: ev.id, Title: ev.title, Source: ev.source ?? '',
    'FDI Impact': ev.impact.fdi, 'GDP Impact': ev.impact.gdp, 'Tenant Risk': ev.impact.tenantRisk,
  }));

  const macroRows: Record<string, string>[] = [];
  for (const group of report.macroGrid) {
    for (const ind of group.indicators) {
      const row: Record<string, string> = { Category: group.category, Indicator: ind.name };
      ind.signals.forEach((sig, i) => { row[`Period ${i + 1}`] = sig; });
      macroRows.push(row);
    }
  }

  const newsRows = report.newsItems.map((n) => ({
    ID: n.id, Title: n.title, Source: n.source,
    Date: n.date, Category: n.category, Relevance: n.relevance, Summary: n.summary,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Data Export</h2>
          <p className="text-slate-400 mt-1 text-sm">
            Download all visualizations and data tables as an Excel workbook (.xlsx).
          </p>
        </div>

        {hasAnyData && (
          <button
            onClick={handleDownloadAll}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              downloaded
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]'
            }`}
          >
            {downloaded ? <CheckCircle2 size={16} /> : <FileSpreadsheet size={16} />}
            {downloaded ? 'Downloaded!' : 'Download All Sheets'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {!hasAnyData && (
        <div className="bg-[#0b1829] border border-dashed border-[#1e3a5f]/50 rounded-2xl p-16 flex flex-col items-center gap-4 text-center">
          <FileSpreadsheet size={40} className="text-slate-600 opacity-40" />
          <div>
            <p className="text-slate-200 font-semibold">No data to export yet</p>
            <p className="text-slate-500 text-sm mt-1">
              Run a BPS search or upload documents in Data Ingestion to populate data tables.
            </p>
          </div>
        </div>
      )}

      {/* Tables */}
      {hasAnyData && (
        <div className="space-y-5">
          {statsRows.length > 0 && (
            <DataTable
              title="Dashboard Statistics"
              rows={statsRows as unknown as Record<string, unknown>[]}
              badge={statsRows.length}
              onDownload={() => dlSheet(statsRows, 'Dashboard_Stats.xlsx')}
            />
          )}

          {chartData?.gdpData?.length ? (
            <DataTable
              title="GDP Growth vs Target"
              rows={chartData.gdpData as unknown as Record<string, unknown>[]}
              badge={chartData.gdpData.length}
              onDownload={() => dlSheet(chartData.gdpData, 'GDP_Growth.xlsx')}
            />
          ) : null}

          {chartData?.investmentData?.length ? (
            <DataTable
              title="Investment Inflows (USD M)"
              rows={chartData.investmentData as unknown as Record<string, unknown>[]}
              badge={chartData.investmentData.length}
              onDownload={() => dlSheet(chartData.investmentData, 'Investment_Inflows.xlsx')}
            />
          ) : null}

          {chartData?.inflationData?.length ? (
            <DataTable
              title="Monthly Inflation Rate (%)"
              rows={chartData.inflationData as unknown as Record<string, unknown>[]}
              badge={chartData.inflationData.length}
              onDownload={() => dlSheet(chartData.inflationData, 'Inflation.xlsx')}
            />
          ) : null}

          {report.data.gdpHistorical?.length ? (
            <DataTable
              title="GDP Historical"
              rows={report.data.gdpHistorical as unknown as Record<string, unknown>[]}
              badge={report.data.gdpHistorical.length}
              onDownload={() => dlSheet(report.data.gdpHistorical, 'GDP_Historical.xlsx')}
            />
          ) : null}

          {report.sectorSummaries?.length ? (
            <DataTable
              title="Sector Summaries"
              rows={report.sectorSummaries as unknown as Record<string, unknown>[]}
              badge={report.sectorSummaries.length}
              onDownload={() => dlSheet(report.sectorSummaries, 'Sectors.xlsx')}
            />
          ) : null}

          {infraRows.length > 0 && (
            <DataTable
              title="Infrastructure Projects"
              rows={infraRows as unknown as Record<string, unknown>[]}
              badge={infraRows.length}
              onDownload={() => dlSheet(infraRows, 'Infrastructure.xlsx')}
            />
          )}

          {geoRows.length > 0 && (
            <DataTable
              title="Geopolitical Events"
              rows={geoRows as unknown as Record<string, unknown>[]}
              badge={geoRows.length}
              onDownload={() => dlSheet(geoRows, 'Geo_Events.xlsx')}
            />
          )}

          {macroRows.length > 0 && (
            <DataTable
              title="Macro Indicator Grid"
              rows={macroRows as unknown as Record<string, unknown>[]}
              badge={macroRows.length}
              onDownload={() => dlSheet(macroRows, 'Macro_Grid.xlsx')}
            />
          )}

          {newsRows.length > 0 && (
            <DataTable
              title="News Items"
              rows={newsRows as unknown as Record<string, unknown>[]}
              badge={newsRows.length}
              onDownload={() => dlSheet(newsRows, 'News.xlsx')}
            />
          )}
        </div>
      )}
    </div>
  );
}
