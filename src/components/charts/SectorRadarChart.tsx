'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface SectorPoint {
  sector: string;
  projects: number;
}

const DEFAULT_DATA: SectorPoint[] = [
  { sector: 'EMS',         projects: 9 },
  { sector: 'Solar',       projects: 6 },
  { sector: 'Data Center', projects: 4 },
  { sector: 'BESS',        projects: 3 },
  { sector: 'Medical',     projects: 2 },
  { sector: 'E-Cig',       projects: 4 },
];

export default function SectorRadarChart({ data = DEFAULT_DATA }: { data?: SectorPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis
          dataKey="sector"
          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 12]}
          tick={{ fill: '#475569', fontSize: 10 }}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: 12 }}
          itemStyle={{ color: '#e2e8f0' }}
          formatter={(v) => [v ?? 0, 'Active Projects']}
        />
        <Radar
          name="Projects"
          dataKey="projects"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.35}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
