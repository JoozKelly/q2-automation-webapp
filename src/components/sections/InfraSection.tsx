'use client';

import { Zap, Route, Droplets, Wifi, Ship, FileCheck } from 'lucide-react';
import type { InfraProject, InfraType } from '@/types/report';

const ICONS: Record<InfraType, React.ReactNode> = {
  power:        <Zap size={16} />,
  road:         <Route size={16} />,
  water:        <Droplets size={16} />,
  connectivity: <Wifi size={16} />,
  fleet:        <Ship size={16} />,
  policies:     <FileCheck size={16} />,
};

const COLOR: Record<InfraProject['status'], string> = {
  completed:   'bg-emerald-500',
  in_progress: 'bg-blue-500',
  planned:     'bg-slate-600',
};

const BADGE: Record<InfraProject['status'], string> = {
  completed:   'bg-emerald-500/15 text-emerald-400',
  in_progress: 'bg-blue-500/15 text-blue-400',
  planned:     'bg-slate-700 text-slate-400',
};

const LABEL: Record<InfraProject['status'], string> = {
  completed:   'Completed',
  in_progress: 'In Progress',
  planned:     'Planned',
};

const DEFAULT_PROJECTS: InfraProject[] = [
  { id: '1', type: 'power',        name: 'Power Grid Expansion (TPIE)',       progress: 78, status: 'in_progress', notes: 'New transmission line from PLN to industrial zones' },
  { id: '2', type: 'road',         name: 'Arterial Road Network — Phase 2',   progress: 65, status: 'in_progress', notes: 'BP Batam arterial road connecting Kabil–Nongsa corridor' },
  { id: '3', type: 'water',        name: 'Water Supply Upgrade',              progress: 70, status: 'in_progress', notes: 'Duriangkang reservoir capacity expansion' },
  { id: '4', type: 'connectivity', name: 'FO Landing Point — Nongsa',         progress: 88, status: 'in_progress', notes: '9 international submarine cables; Singapore–Batam link' },
  { id: '5', type: 'fleet',        name: 'Port & Ferry Infrastructure',       progress: 55, status: 'in_progress', notes: 'Roro ferry terminal expansion at Telaga Punggur' },
  { id: '6', type: 'policies',     name: 'Tax Holiday & Pioneer Certification', progress: 50, status: 'planned',     notes: 'Pioneer industries (solar mfg, data centers) under review' },
];

function ProgressBar({ value, status }: { value: number; status: InfraProject['status'] }) {
  return (
    <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${COLOR[status]}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function InfraSection({ projects = DEFAULT_PROJECTS }: { projects?: InfraProject[] }) {
  return (
    <div className="space-y-4">
      {projects.map((p) => (
        <div key={p.id} className="group flex gap-4 items-start p-4 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-800 rounded-xl transition-colors">
          {/* Icon */}
          <div className="mt-0.5 p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-slate-200 transition-colors shrink-0">
            {ICONS[p.type]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-slate-200 truncate">{p.name}</span>
              <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${BADGE[p.status]}`}>
                {LABEL[p.status]}
              </span>
            </div>

            <ProgressBar value={p.progress} status={p.status} />

            <div className="flex items-center justify-between mt-2">
              {p.notes && <p className="text-xs text-slate-500 truncate mr-4">{p.notes}</p>}
              <span className="text-xs font-bold text-slate-300 shrink-0">{p.progress}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
