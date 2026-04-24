'use client';

import SectorRadarChart, { type SectorPoint } from '@/components/charts/SectorRadarChart';
import type { SectorSummary } from '@/types/report';

const PALETTE = [
  { color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20' },
  { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  { color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20' },
  { color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
];

const DEFAULT_SUMMARIES: SectorSummary[] = [
  { sector: 'Electronics Mfg (EMS)', radarLabel: 'EMS',      projectCount: 9, highlight: 'Infineon, Pegatron, Simatelex, Honor, Luxshare expansions' },
  { sector: 'Solar / Renewable',     radarLabel: 'Solar',    projectCount: 6, highlight: 'Nusa Solar, Haitai Solar — 3 GW+ capacity underway' },
  { sector: 'Data Centers',          radarLabel: 'Data Ctr', projectCount: 4, highlight: 'Oracle (2 DCs), Neutra DC; Nongsa FO landing hub' },
  { sector: 'BESS',                  radarLabel: 'BESS',     projectCount: 3, highlight: 'Horizon IP, OSE Electronics; Batam–SGP Green Corridor' },
  { sector: 'Medical Devices',       radarLabel: 'Medical',  projectCount: 2, highlight: 'Emerging cluster; regulatory approvals pending' },
  { sector: 'E-Cigarettes',          radarLabel: 'E-Cig',    projectCount: 4, highlight: 'Warlbor, Geek Vape, ALD Shenzhen manufacturing' },
];

export default function SectorSection({
  summaries = DEFAULT_SUMMARIES,
}: {
  summaries?: SectorSummary[];
}) {
  const radarData: SectorPoint[] = summaries.map((s) => ({
    sector: s.radarLabel,
    projects: s.projectCount,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-1">Active Projects by Sector</h4>
          <p className="text-xs text-slate-500 mb-4">Q2 2026 · Batam FTZ</p>
          <SectorRadarChart data={radarData} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {summaries.map((s, i) => {
            const style = PALETTE[i % PALETTE.length];
            return (
              <div
                key={s.sector}
                className={`border rounded-xl p-3 ${style.bg} flex flex-col gap-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 leading-tight">{s.sector}</span>
                  <span className={`text-lg font-bold ${style.color}`}>{s.projectCount}</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">{s.highlight}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
