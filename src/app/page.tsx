"use client";

import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useDataStore } from '@/context/store';
import { useReportStore } from '@/store/reportStore';
import { Database, TrendingUp, TrendingDown, Newspaper, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import MacroIndicatorGrid from '@/components/charts/MacroIndicatorGrid';
import GDPHistoricalChart from '@/components/charts/GDPHistoricalChart';
import type { NewsItem } from '@/types/report';

export default function Dashboard() {
  const { data } = useDataStore();
  const { dashboardStats, macroGrid, newsItems } = useReportStore();

  // Derive metric values: prefer ingest stats, fall back to timeseries last value, then null
  const gdpValue = dashboardStats
    ? `${dashboardStats.gdpGrowthPct.toFixed(1)}%`
    : data?.gdpData.at(-1)?.gdp != null
      ? `${data!.gdpData.at(-1)!.gdp}%`
      : null;

  const gdpChange = dashboardStats?.gdpGrowthChange ?? null;

  const fdiValue = dashboardStats
    ? dashboardStats.fdiInflow
    : data?.investmentData.at(-1)?.foreign != null
      ? `$${data!.investmentData.at(-1)!.foreign}M`
      : null;

  const fdiChange = dashboardStats?.fdiChange ?? null;

  const inflationValue = dashboardStats
    ? `${dashboardStats.inflationRate.toFixed(1)}%`
    : data?.inflationData.at(-1)?.rate != null
      ? `${data!.inflationData.at(-1)!.rate}%`
      : null;

  const inflationChange = dashboardStats?.inflationChange ?? null;

  const totalProjects = dashboardStats?.totalProjects ?? null;

  const hasData = data !== null;
  const hasStats = dashboardStats !== null;

  // Determine data source pill label + color
  const sourcePill =
    dashboardStats?.dataSource === 'upload'
      ? { label: 'Uploaded', cls: 'bg-blue-500/15 text-blue-300 border border-blue-500/25' }
      : dashboardStats?.dataSource === 'genspark'
        ? { label: 'AI Search', cls: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25' }
        : null;

  return (
    <div className="space-y-6">

      {/* 1. Key Metric Cards — KPIs at top for quick scanning */}
      <div>
        {/* Title row with optional source pill */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Key Performance Indicators
          </h2>
          {sourcePill && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sourcePill.cls}`}>
              {sourcePill.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            title="GDP Growth"
            value={gdpValue ?? '—'}
            change={gdpChange}
            isPositive={gdpChange ? !gdpChange.startsWith('-') : true}
            empty={!gdpValue}
            accent="border-l-indigo-500"
          />
          <MetricCard
            title="FDI Inflow"
            value={fdiValue ?? '—'}
            change={fdiChange}
            isPositive={fdiChange ? !fdiChange.startsWith('-') : true}
            empty={!fdiValue}
            accent="border-l-blue-500"
          />
          <MetricCard
            title="Inflation Rate"
            value={inflationValue ?? '—'}
            change={inflationChange}
            isPositive={inflationChange ? inflationChange.startsWith('-') : true}
            empty={!inflationValue}
            accent="border-l-emerald-500"
          />
          <MetricCard
            title="Active Projects"
            value={totalProjects != null ? String(totalProjects) : '—'}
            change={null}
            isPositive={true}
            empty={totalProjects === null}
            accent="border-l-violet-500"
          />
        </div>
      </div>

      {/* 2. Macro Indicator Grid */}
      <MacroIndicatorGrid data={macroGrid.length > 0 ? macroGrid : undefined} />

      {/* 3. Historical GDP Chart */}
      <GDPHistoricalChart />

      {/* 4. Quarterly Charts — require data upload / ingest */}
      {!hasData ? (
        <div className="bg-[#0c1425] border border-dashed border-[#1a2744] rounded-xl p-10 flex flex-col items-center justify-center gap-4">
          <Database size={36} className="text-slate-600" />
          <div className="text-center">
            <p className="text-slate-300 font-semibold">No data yet — run the AI search or upload a file</p>
            <p className="text-slate-500 text-sm mt-1">
              All charts will populate after ingestion.
            </p>
          </div>
          <Link
            href="/ingestion"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            Go to Data Ingestion →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GDP Growth vs Target */}
            <div className="bg-[#0c1425] border border-[#1a2744] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-200">GDP Growth vs Target (%)</h3>
                {hasStats && (
                  <span className="text-xs text-slate-500 bg-[#111d35] px-2 py-1 rounded border border-[#1a2744]">
                    Last refreshed {new Date(dashboardStats!.lastUpdated).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.gdpData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" vertical={false} />
                    <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0c1425', borderColor: '#1a2744', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="gdp" name="Actual GDP" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="target" name="Target" stroke="#475569" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Investment Inflows */}
            <div className="bg-[#0c1425] border border-[#1a2744] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Investment Inflows (USD M)</h3>
              <div className="h-[300px]">
                {data.investmentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.investmentData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" vertical={false} />
                      <XAxis dataKey="quarter" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0c1425', borderColor: '#1a2744', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="foreign" name="Foreign (FDI)" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="domestic" name="Domestic (DDI)" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart label="Investment data not in file — run AI search for quarterly breakdown" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inflation */}
            <div className="bg-[#0c1425] border border-[#1a2744] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Monthly Inflation Rate (%)</h3>
              <div className="h-[300px]">
                {data.inflationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.inflationData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: '#111d35' }}
                        contentStyle={{ backgroundColor: '#0c1425', borderColor: '#1a2744', borderRadius: '8px' }}
                      />
                      <Bar dataKey="rate" name="Inflation" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart label="Inflation data not in file — run AI search for monthly CPI" />
                )}
              </div>
            </div>

            {/* AI Synthesis */}
            <div
              className="bg-[#0a1628] border border-indigo-500/25 rounded-xl p-6 relative overflow-hidden"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse at 80% 0%, rgba(99,102,241,0.07) 0%, transparent 60%), ' +
                  'linear-gradient(to bottom right, rgba(99,102,241,0.04) 0%, transparent 100%)',
              }}
            >
              {/* Subtle panel grid overlay */}
              <div
                className="absolute inset-0 pointer-events-none select-none opacity-[0.03]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, #6366f1 0px, transparent 1px, transparent 32px), ' +
                    'repeating-linear-gradient(90deg, #6366f1 0px, transparent 1px, transparent 32px)',
                }}
              />

              {/* Decorative icon */}
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none select-none">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-indigo-300 mb-4 glow-indigo relative z-10">AI Synthesis</h3>
              <div className="space-y-4 text-slate-300 text-sm leading-relaxed relative z-10">
                <p>
                  {data.summary ||
                    'Batam continues to demonstrate robust economic resilience. Run an AI search to get a live synthesis of Q2 2026 conditions.'}
                </p>
              </div>
              <div className="mt-6 relative z-10">
                <Link
                  href="/report-builder"
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  Generate full report in Report Builder →
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* News Feed */}
      <div className="bg-[#0c1425] border border-[#1a2744] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2744]">
          <div className="flex items-center gap-2">
            <Newspaper size={16} className="text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-200">Batam FTZ News</h3>
            {newsItems.length > 0 && (
              <span className="text-xs bg-[#111d35] text-slate-400 px-2 py-0.5 rounded-full border border-[#1a2744]">
                {newsItems.length}
              </span>
            )}
          </div>
          <Link
            href="/ingestion?tab=news"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            Fetch news <ChevronRight size={13} />
          </Link>
        </div>

        {newsItems.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            <Newspaper size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No news loaded yet.</p>
            <Link
              href="/ingestion"
              className="text-xs text-indigo-400 hover:underline mt-1 inline-block"
            >
              Go to Data Ingestion → News tab
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-[#1a2744]/40">
            {newsItems.slice(0, 6).map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  fdi:            'bg-blue-500/15 text-blue-300',
  infrastructure: 'bg-orange-500/15 text-orange-300',
  policy:         'bg-purple-500/15 text-purple-300',
  sector:         'bg-emerald-500/15 text-emerald-300',
  geopolitics:    'bg-rose-500/15 text-rose-300',
  economy:        'bg-indigo-500/15 text-indigo-300',
};

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <div className="bg-[#0c1425] p-4 hover:bg-[#111d35] transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] ?? 'bg-slate-700 text-slate-300'}`}>
          {item.category}
        </span>
        <span className="text-xs text-slate-600">{item.date}</span>
      </div>
      <h4 className="text-sm font-semibold text-slate-100 leading-snug mb-1.5">
        {item.title}
      </h4>
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
        {item.summary}
      </p>
      <p className="text-xs text-slate-600 mt-2">{item.source}</p>
    </div>
  );
}

// Accent border colors per metric — border-l-4 + the accent colour class
const ACCENT_LEFT: Record<string, string> = {
  'border-l-indigo-500':  'border-l-indigo-500',
  'border-l-blue-500':    'border-l-blue-500',
  'border-l-emerald-500': 'border-l-emerald-500',
  'border-l-violet-500':  'border-l-violet-500',
};

function MetricCard({
  title,
  value,
  change,
  isPositive,
  empty,
  accent,
}: {
  title: string;
  value: string;
  change: string | null;
  isPositive: boolean;
  empty?: boolean;
  accent: string;
}) {
  return (
    <div
      className={[
        'bg-[#0c1425] border border-[#1a2744] rounded-xl p-5',
        'border-l-4',
        ACCENT_LEFT[accent] ?? accent,
        'card-hover',
        'flex flex-col justify-between',
      ].join(' ')}
    >
      <h4 className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
        {title}
      </h4>

      <div className="flex items-end gap-2">
        <span
          className={[
            'stat-number text-3xl font-black',
            empty ? 'text-slate-600' : 'text-slate-100',
          ].join(' ')}
        >
          {empty ? '—' : value}
        </span>
        {!empty && change && (
          <span
            className={[
              'text-sm font-medium mb-0.5 flex items-center gap-0.5',
              isPositive ? 'text-emerald-400' : 'text-rose-400',
            ].join(' ')}
          >
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {change}
          </span>
        )}
      </div>

      {empty && (
        <p className="text-xs text-slate-600 mt-3">
          <Link href="/ingestion" className="hover:text-slate-400 transition-colors underline underline-offset-2">
            Ingest data to populate
          </Link>
        </p>
      )}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-xs text-slate-600 italic text-center max-w-xs">{label}</p>
    </div>
  );
}
