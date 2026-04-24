'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useReportStore } from '@/store/reportStore';
import { UploadCloud } from 'lucide-react';
import Link from 'next/link';

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-semibold">
          {entry.name}: {entry.value !== undefined ? `${Number(entry.value).toFixed(1)}%` : '—'}
        </p>
      ))}
    </div>
  );
}

export default function GDPHistoricalChart() {
  const { data, uploadedFileName } = useReportStore();
  const gdpPoints = data.gdpHistorical;

  if (gdpPoints.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center gap-3 min-h-[220px]">
        <UploadCloud size={32} className="text-slate-600" />
        <div className="text-center">
          <p className="text-slate-400 font-medium text-sm">Historical GDP data not loaded</p>
          <p className="text-slate-500 text-xs mt-1">
            Upload the GDP Excel file in{' '}
            <Link href="/ingestion" className="text-indigo-400 hover:underline">
              Data Ingestion
            </Link>{' '}
            to see the 1990–2024 trend.
          </p>
        </div>
      </div>
    );
  }

  const chartData = gdpPoints
    .filter((d) => d.gdpGrowthPct !== undefined)
    .map((d) => ({
      year: d.year,
      'GDP Growth (%)': d.gdpGrowthPct,
    }));

  const minY = Math.min(0, ...chartData.map((d) => d['GDP Growth (%)'] ?? 0)) - 1;
  const maxY = Math.max(...chartData.map((d) => d['GDP Growth (%)'] ?? 0)) + 1;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">
            Batam GRDP — Historical Growth Rate
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Annual GDP growth (%) · Source: BPS Kota Batam
            {uploadedFileName && (
              <span className="ml-2 text-indigo-400">· {uploadedFileName}</span>
            )}
          </p>
        </div>
        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">
          {gdpPoints[0]?.year}–{gdpPoints[gdpPoints.length - 1]?.year}
        </span>
      </div>

      <div className="h-[280px] mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[Math.floor(minY), Math.ceil(maxY)]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="GDP Growth (%)"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#818cf8', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
