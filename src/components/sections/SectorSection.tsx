'use client';

import SectorRadarChart, { type SectorPoint } from '@/components/charts/SectorRadarChart';

interface SectorCard {
  sector: string;
  projectCount: number;
  highlight: string;
  color: string;
  bg: string;
}

const SECTOR_CARDS: SectorCard[] = [
  {
    sector: 'Electronics Mfg (EMS)',
    projectCount: 9,
    highlight: 'Infineon, Pegatron, Simatelex, Honor, Luxshare expansions',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    sector: 'Solar / Renewable',
    projectCount: 6,
    highlight: 'Nusa Solar, Haitai Solar — 3GW+ capacity underway',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    sector: 'Data Centers',
    projectCount: 4,
    highlight: 'Oracle (2 DCs), Neutra DC; Nongsa FO landing hub',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    sector: 'BESS',
    projectCount: 3,
    highlight: 'Horizon IP, OSE Electronics; Batam–SGP Green Corridor',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    sector: 'Medical Devices',
    projectCount: 2,
    highlight: 'Emerging cluster; regulatory approvals pending',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
  {
    sector: 'E-Cigarettes',
    projectCount: 4,
    highlight: 'Warlbor, Geek Vape, ALD Shenzhen manufacturing',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
];

const RADAR_DATA: SectorPoint[] = SECTOR_CARDS.map((c) => ({
  sector: c.sector.split(' ')[0] === 'Electronics' ? 'EMS'
        : c.sector.split(' ')[0] === 'Solar' ? 'Solar'
        : c.sector.split(' ')[0] === 'Data' ? 'Data Ctr'
        : c.sector.split(' ')[0] === 'BESS' ? 'BESS'
        : c.sector.split(' ')[0] === 'Medical' ? 'Medical'
        : 'E-Cig',
  projects: c.projectCount,
}));

export default function SectorSection() {
  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-1">Active Projects by Sector</h4>
          <p className="text-xs text-slate-500 mb-4">Q2 2026 · Batam FTZ</p>
          <SectorRadarChart data={RADAR_DATA} />
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          {SECTOR_CARDS.map((s) => (
            <div
              key={s.sector}
              className={`border rounded-xl p-3 ${s.bg} flex flex-col gap-1`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 leading-tight">{s.sector}</span>
                <span className={`text-lg font-bold ${s.color}`}>{s.projectCount}</span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">{s.highlight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
