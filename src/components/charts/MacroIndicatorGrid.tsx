'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Wifi } from 'lucide-react';
import type { TrendSignal } from '@/types/report';

const PERIODS = [
  '2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4',
  '2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4',
  '2026 Q1', '2026 Q2',
];

const CURRENT_PERIOD = '2026 Q2';

interface IndicatorRow {
  name: string;
  signals: TrendSignal[];
}

interface IndicatorGroup {
  category: string;
  indicators: IndicatorRow[];
}

const DEFAULT_DATA: IndicatorGroup[] = [
  {
    category: 'Macro Economic',
    indicators: [
      {
        name: 'GDP',
        signals: ['improving', 'improving', 'stable', 'improving', 'improving', 'improving', 'improving', 'improving', 'improving', 'improving'],
      },
      {
        name: 'Trade',
        signals: ['stable', 'declining', 'stable', 'stable', 'stable', 'stable', 'improving', 'stable', 'stable', 'stable'],
      },
      {
        name: 'Industrial Activity',
        signals: ['improving', 'improving', 'improving', 'improving', 'improving', 'improving', 'improving', 'improving', 'improving', 'improving'],
      },
      {
        name: 'Labor',
        signals: ['stable', 'stable', 'stable', 'improving', 'improving', 'improving', 'improving', 'improving', 'improving', 'stable'],
      },
      {
        name: 'Prices / Inflation',
        signals: ['stable', 'stable', 'stable', 'stable', 'stable', 'stable', 'stable', 'stable', 'stable', 'stable'],
      },
    ],
  },
  {
    category: 'Financial',
    indicators: [
      {
        name: 'Currency (vs USD)',
        signals: ['declining', 'declining', 'stable', 'declining', 'declining', 'stable', 'stable', 'stable', 'declining', 'declining'],
      },
      {
        name: 'Interest Rates',
        signals: ['stable', 'stable', 'declining', 'declining', 'declining', 'declining', 'declining', 'stable', 'stable', 'stable'],
      },
      {
        name: 'Capital Flow (FDI)',
        signals: ['improving', 'improving', 'improving', 'improving', 'improving', 'improving', 'improving', 'improving', 'improving', 'improving'],
      },
    ],
  },
];

function SignalCell({ signal, isCurrent }: { signal: TrendSignal; isCurrent: boolean }) {
  const ring = isCurrent ? 'ring-1' : '';

  if (signal === 'improving') {
    return (
      <div
        className={`flex items-center justify-center h-9 rounded text-emerald-400 bg-emerald-500/15 ${ring} ring-emerald-400/40`}
        title="Improving"
      >
        <TrendingUp size={14} strokeWidth={2.5} />
      </div>
    );
  }
  if (signal === 'declining') {
    return (
      <div
        className={`flex items-center justify-center h-9 rounded text-red-400 bg-red-500/15 ${ring} ring-red-400/40`}
        title="Declining"
      >
        <TrendingDown size={14} strokeWidth={2.5} />
      </div>
    );
  }
  return (
    <div
      className={`flex items-center justify-center h-9 rounded text-slate-500 bg-slate-800/40 ${ring} ring-slate-500/40`}
      title="Stable / No significant change"
    >
      <Minus size={14} strokeWidth={2.5} />
    </div>
  );
}

export default function MacroIndicatorGrid({
  data = DEFAULT_DATA,
  isEstimated,
}: {
  data?: IndicatorGroup[];
  isEstimated?: boolean;
}) {
  const usingDefaults = data === DEFAULT_DATA;
  const showWarning = usingDefaults || isEstimated;

  return (
    <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1e3a5f]/50 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">
            Quarterly Macroeconomic Outlook
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Indicator trend vs. prior quarter · 2024 Q1 — 2026 Q2
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {!showWarning && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <Wifi size={11} />
              Live data
            </span>
          )}
          {showWarning && (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              <AlertTriangle size={11} />
              AI estimated
            </span>
          )}
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-emerald-400" />
              Improving
            </span>
            <span className="flex items-center gap-1.5">
              <Minus size={12} className="text-slate-500" />
              Stable
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingDown size={12} className="text-red-400" />
              Declining
            </span>
          </div>
        </div>
      </div>

      {/* Confidence warning */}
      {showWarning && (
        <div className="px-6 py-3 bg-amber-500/5 border-b border-amber-500/15 flex items-start gap-2.5">
          <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/80 leading-relaxed">
            {usingDefaults
              ? 'Showing AI-estimated baseline signals — no economic data has been ingested. Run a BPS Search or upload a report in Data Ingestion for verified trend data.'
              : 'These signals were synthesised by AI from web search results. Verify critical indicators against official BPS or BP Batam publications.'}
          </p>
        </div>
      )}


      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#1e3a5f]/50">
              <th className="text-left px-5 py-3 text-slate-400 font-medium min-w-[180px] sticky left-0 bg-[#0b1829] backdrop-blur-sm z-10">
                Indicator
              </th>
              {PERIODS.map((p) => (
                <th
                  key={p}
                  className="px-2 py-3 min-w-[76px] text-center"
                >
                  {p === CURRENT_PERIOD ? (
                    <span className="inline-block bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {p}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">{p}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((group) => (
              <React.Fragment key={group.category}>
                {/* Category row */}
                <tr className="border-b border-[#1e3a5f]/30">
                  <td
                    colSpan={PERIODS.length + 1}
                    className="px-5 py-2 text-xs font-semibold text-slate-500 uppercase tracking-widest bg-[#0f2040]/60"
                  >
                    {group.category}
                  </td>
                </tr>

                {/* Indicator rows */}
                {group.indicators.map((row, rowIdx) => (
                  <tr
                    key={row.name}
                    className={`border-b border-[#1e3a5f]/30 hover:bg-[#0f2040]/40 transition-colors ${
                      rowIdx === group.indicators.length - 1 ? 'border-b border-[#1e3a5f]/50' : ''
                    }`}
                  >
                    <td className="px-5 py-2 text-slate-300 font-medium sticky left-0 bg-[#0b1829] backdrop-blur-sm z-10">
                      {row.name}
                    </td>
                    {PERIODS.map((p, i) => (
                      <td key={p} className="px-2 py-2">
                        <SignalCell
                          signal={row.signals[i] ?? 'stable'}
                          isCurrent={p === CURRENT_PERIOD}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
