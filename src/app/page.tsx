"use client";

import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useDataStore } from '@/context/store';
import { useReportStore } from '@/store/reportStore';
import { Database, TrendingUp, TrendingDown, Newspaper, ChevronRight, Sparkles } from 'lucide-react';
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

  return (
    <div className="space-y-6">

      {/* 1. KPI Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4a5e78]">Key Performance Indicators</p>
          {dashboardStats && (
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
              dashboardStats.dataSource === 'genspark'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              {dashboardStats.dataSource === 'genspark' ? '⚡ AI Search' : '📄 Uploaded'}
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
            accentColor="bg-gradient-to-r from-indigo-500 to-violet-500"
          />
          <MetricCard
            title="FDI Inflow"
            value={fdiValue ?? '—'}
            change={fdiChange}
            isPositive={fdiChange ? !fdiChange.startsWith('-') : true}
            empty={!fdiValue}
            accentColor="bg-gradient-to-r from-blue-500 to-cyan-500"
          />
          <MetricCard
            title="Inflation Rate"
            value={inflationValue ?? '—'}
            change={inflationChange}
            isPositive={inflationChange ? inflationChange.startsWith('-') : true}
            empty={!inflationValue}
            accentColor="bg-gradient-to-r from-emerald-500 to-teal-500"
          />
          <MetricCard
            title="Active Projects"
            value={totalProjects != null ? String(totalProjects) : '—'}
            change={null}
            isPositive={true}
            empty={totalProjects === null}
            accentColor="bg-gradient-to-r from-violet-500 to-purple-500"
          />
        </div>
      </div>

      {/* 2. Macro Indicator Grid */}
      <MacroIndicatorGrid data={macroGrid.length > 0 ? macroGrid : undefined} />

      {/* 3. Historical GDP Chart */}
      <GDPHistoricalChart />

      {/* 4. Quarterly Charts — require data upload / ingest */}
      {!hasData ? (
        <div className="bg-[#0b1829] border border-dashed border-[#1e3a5f]/50 rounded-2xl p-16 flex flex-col items-center gap-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0f2040] border border-[#1e3a5f]/50 flex items-center justify-center">
            <Database size={24} className="text-[#4a5e78]" />
          </div>
          <div>
            <p className="text-slate-200 font-semibold text-base">No data ingested yet</p>
            <p className="text-[#4a5e78] text-sm mt-1">Upload documents or run an AI search to populate all charts.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/ingestion"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.35)]"
            >
              Upload Documents
            </Link>
            <Link
              href="/ingestion"
              className="bg-[#0f2040] hover:bg-[#152445] border border-[#1e3a5f]/50 text-slate-300 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
            >
              BPS Search
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GDP Growth vs Target */}
            <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-200">GDP Growth vs Target (%)</h3>
                {hasStats && (
                  <span className="text-xs text-slate-500 bg-[#0f2040] px-2 py-1 rounded border border-[#1e3a5f]/50">
                    Last refreshed {new Date(dashboardStats!.lastUpdated).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.gdpData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f40" vertical={false} />
                    <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0b1829', borderColor: '#1e3a5f', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
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
            <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Investment Inflows (USD M)</h3>
              <div className="h-[300px]">
                {data.investmentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.investmentData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f40" vertical={false} />
                      <XAxis dataKey="quarter" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0b1829', borderColor: '#1e3a5f', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
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
            <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-6">Monthly Inflation Rate (%)</h3>
              <div className="h-[300px]">
                {data.inflationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.inflationData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f40" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: '#0f2040' }}
                        contentStyle={{ backgroundColor: '#0b1829', borderColor: '#1e3a5f', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
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
            <div className="bg-[#0b1829] border border-indigo-500/25 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />
              <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles size={14} /> AI Synthesis
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed relative z-10">
                {data.summary || 'Run an AI search or upload economic data to generate a live Q2 2026 synthesis.'}
              </p>
              <Link
                href="/report-builder"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Build full report <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </>
      )}

      {/* 5. News Feed */}
      <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f]/50">
          <div className="flex items-center gap-2">
            <Newspaper size={16} className="text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-200">Batam FTZ News</h3>
            {newsItems.length > 0 && (
              <span className="text-xs bg-[#0f2040] text-slate-400 px-2 py-0.5 rounded-full border border-[#1e3a5f]/50">
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
          <div className="divide-y divide-[#1e3a5f]/30">
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
    <div className="p-5 hover:bg-[#0f2040]/60 transition-colors">
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

function MetricCard({ title, value, change, isPositive, empty, accentColor }: {
  title: string;
  value: string;
  change: string | null;
  isPositive: boolean;
  empty?: boolean;
  accentColor: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 flex flex-col gap-3 transition-all duration-200 ${
      empty
        ? 'bg-[#0b1829] border-[#1e3a5f]/30'
        : 'bg-[#0b1829] border-[#1e3a5f]/50 hover:border-[#1e3a5f] hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
    }`}>
      {/* top accent line */}
      {!empty && <div className={`absolute top-0 left-0 right-0 h-[2px] ${accentColor}`} />}
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">{title}</p>
      <div className="flex items-end gap-3">
        <span className={`text-4xl font-black tracking-tight stat-number leading-none ${empty ? 'text-[#1e3a5f]' : 'text-slate-100'}`}>
          {value}
        </span>
        {change && !empty && (
          <span className={`text-sm font-semibold mb-1 flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {change}
          </span>
        )}
      </div>
      {empty && (
        <Link href="/ingestion" className="text-xs text-[#4a5e78] hover:text-indigo-400 transition-colors mt-auto">
          Ingest data to populate →
        </Link>
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
