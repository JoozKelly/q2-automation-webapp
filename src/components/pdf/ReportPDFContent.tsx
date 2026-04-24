'use client';

import React from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import type {
  DashboardStats, InfraProject, GeoEvent,
  SectorSummary, MacroGridGroup, NewsItem,
} from '@/types/report';

interface GDPPoint       { year: string; gdp: number; target: number; }
interface InvestPoint    { quarter: string; foreign: number; domestic: number; }
interface InflationPoint { month: string; rate: number; }

interface Props {
  narratives: Record<string, string>;
  period?: string;
  stats?: DashboardStats | null;
  gdpData?: GDPPoint[];
  investmentData?: InvestPoint[];
  inflationData?: InflationPoint[];
  infraProjects?: InfraProject[];
  geoEvents?: GeoEvent[];
  sectorSummaries?: SectorSummary[];
  macroGrid?: MacroGridGroup[];
  newsItems?: NewsItem[];
}

const NAVY  = '#0a1628';
const BLUE  = '#1d4ed8';
const LIGHT = '#f0f4ff';
const W     = 698; // content width (794 - 2×48 padding)

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 10, letterSpacing: 2, color: '#64748b', textTransform: 'uppercase' as const }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 800, color }}>{value}</span>
    </div>
  );
}

function SectionBlock({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '24px 48px', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'white', background: BLUE, borderRadius: 4, padding: '3px 8px' }}>
          {num}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: NAVY, textTransform: 'uppercase' as const, letterSpacing: 1 }}>
          {title}
        </span>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      </div>
      {children}
    </div>
  );
}

function NarrativeText({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div style={{ fontSize: 12, lineHeight: 1.8, color: '#374151', marginTop: 12 }}>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        if (line.startsWith('### ')) return (
          <p key={i} style={{ fontWeight: 700, fontSize: 13, color: NAVY, margin: '12px 0 4px' }}>
            {line.replace('### ', '')}
          </p>
        );
        if (line.startsWith('- ')) return (
          <p key={i} style={{ margin: '2px 0 2px 16px' }}>• {line.slice(2)}</p>
        );
        return <p key={i} style={{ margin: '4px 0' }}>{line}</p>;
      })}
    </div>
  );
}

function PlaceholderText({ label }: { label: string }) {
  return (
    <p style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 8 }}>
      {label} — generate AI narrative in the Report Builder to populate this section.
    </p>
  );
}

function ChartTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: 0.5, margin: '0 0 8px' }}>
      {children}
    </p>
  );
}

// Progress bar for infra projects
function ProgressBar({ project }: { project: InfraProject }) {
  const TYPE_COLOR: Record<string, string> = {
    power: '#f59e0b', road: '#3b82f6', water: '#06b6d4',
    connectivity: '#8b5cf6', fleet: '#10b981', policies: '#6366f1',
  };
  const color = TYPE_COLOR[project.type] ?? BLUE;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>{project.name}</span>
        <span style={{ fontSize: 11, color: color, fontWeight: 700 }}>{project.progress}%</span>
      </div>
      <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 3 }}>
        <div style={{ width: `${project.progress}%`, height: 6, background: color, borderRadius: 3 }} />
      </div>
      {project.notes && (
        <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{project.notes}</p>
      )}
    </div>
  );
}

// Signal cell for macro grid
const SIGNAL_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  improving: { bg: '#dcfce7', color: '#16a34a', label: '▲' },
  stable:    { bg: '#f1f5f9', color: '#64748b', label: '●' },
  declining: { bg: '#fee2e2', color: '#dc2626', label: '▼' },
};

function SignalCell({ signal }: { signal: string }) {
  const s = SIGNAL_STYLE[signal] ?? SIGNAL_STYLE.stable;
  return (
    <span style={{
      display: 'inline-block', width: 18, height: 18,
      background: s.bg, color: s.color,
      borderRadius: 3, fontSize: 9, fontWeight: 700,
      textAlign: 'center', lineHeight: '18px',
    }}>
      {s.label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ReportPDFContent({
  narratives, period = 'Q2 2026', stats,
  gdpData = [], investmentData = [], inflationData = [],
  infraProjects = [], geoEvents = [], sectorSummaries = [],
  macroGrid = [], newsItems = [],
}: Props) {
  const generated = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const gdpDisplay  = stats ? `${stats.gdpGrowthPct.toFixed(1)}%` : '—';
  const fdiDisplay  = stats ? stats.fdiInflow : '—';
  const inflDisplay = stats ? `${stats.inflationRate.toFixed(1)}%` : '—';
  const projDisplay = stats ? String(stats.totalProjects) : '—';
  const sourceLabel = stats
    ? `Data: ${stats.dataSource === 'genspark' ? 'AI Web Search' : stats.dataSource === 'upload' ? 'Uploaded File' : 'Manual'}`
    : 'Data: not yet ingested';

  const hasGdpChart    = gdpData.length > 0;
  const hasInvestChart = investmentData.length > 0;
  const hasInflChart   = inflationData.length > 0;

  return (
    <div style={{ width: 794, background: 'white', fontFamily: 'Arial, Helvetica, sans-serif', color: '#0f172a' }}>

      {/* ── Cover / Header ─────────────────────────────────────────── */}
      <div style={{ background: NAVY, color: 'white', padding: '40px 48px 32px' }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase' as const }}>
          BP Batam — Tenant Intelligence Brief
        </p>
        <div style={{ borderBottom: `3px solid ${BLUE}`, paddingBottom: 20, marginBottom: 24 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, margin: '0 0 4px', lineHeight: 1.1 }}>BATAM ECONOMIC OUTLOOK</h1>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#93c5fd', margin: 0 }}>{period}</h2>
        </div>
        <div style={{ display: 'flex', gap: 48 }}>
          <StatBox label="GDP Growth"      value={gdpDisplay}  color="#34d399" />
          <StatBox label="FDI Inflow"      value={fdiDisplay}  color="#60a5fa" />
          <StatBox label="Inflation"       value={inflDisplay} color="#a78bfa" />
          <StatBox label="Active Projects" value={projDisplay} color="#fb923c" />
        </div>
      </div>

      {/* ── Report Scope ────────────────────────────────────────────── */}
      <div style={{ background: LIGHT, padding: '14px 48px', borderBottom: '1px solid #dbeafe' }}>
        <p style={{ fontSize: 11, color: '#1e3a5f', margin: 0, lineHeight: 1.6 }}>
          <strong>Report Scope:</strong> This brief covers {period} macroeconomic indicators,
          infrastructure progress, key geopolitical events, sector pipeline updates, and the
          forward-looking outlook for Batam Free Trade Zone tenants.{' '}
          <span style={{ color: '#94a3b8' }}>{sourceLabel}</span>
        </p>
      </div>

      {/* ── Section 01: Charts ──────────────────────────────────────── */}
      {(hasGdpChart || hasInvestChart || hasInflChart) && (
        <SectionBlock num="01" title="Key Economic Indicators">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* GDP Growth vs Target */}
            {hasGdpChart && (
              <div>
                <ChartTitle>GDP Growth Rate vs Target (%)</ChartTitle>
                <LineChart width={W} height={180} data={gdpData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="gdp"    name="Actual GDP" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="target" name="Target"     stroke="#94a3b8"  strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </div>
            )}

            {/* Investment Inflows */}
            {hasInvestChart && (
              <div>
                <ChartTitle>Investment Inflows by Quarter (USD M)</ChartTitle>
                <AreaChart width={W} height={180} data={investmentData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="quarter" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="foreign"  name="Foreign (FDI)" stackId="1" stroke="#1d4ed8" fill="#bfdbfe" />
                  <Area type="monotone" dataKey="domestic" name="Domestic (DDI)" stackId="1" stroke="#7c3aed" fill="#ddd6fe" />
                </AreaChart>
              </div>
            )}

            {/* Monthly Inflation */}
            {hasInflChart && (
              <div>
                <ChartTitle>Monthly Inflation Rate (%)</ChartTitle>
                <BarChart width={W} height={180} data={inflationData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="rate" name="Inflation %" fill="#059669" radius={[3, 3, 0, 0]} />
                </BarChart>
              </div>
            )}

          </div>
        </SectionBlock>
      )}

      {/* ── Section 01b: Macro Indicator Grid ───────────────────────── */}
      {macroGrid.length > 0 && (
        <SectionBlock num="01b" title="Macro Indicator Signal Grid">
          <div style={{ overflowX: 'auto' }}>
            {macroGrid.map((group, gi) => (
              <div key={gi} style={{ marginBottom: gi < macroGrid.length - 1 ? 16 : 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: 1, textTransform: 'uppercase' as const, margin: '0 0 8px' }}>
                  {group.category}
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '3px 8px', background: '#f8fafc', color: '#64748b', fontWeight: 600, border: '1px solid #e2e8f0', width: 160 }}>
                        Indicator
                      </th>
                      {(group.indicators[0]?.signals ?? []).map((_, si) => (
                        <th key={si} style={{ padding: '3px 4px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          Q{(si % 4) + 1}{Math.floor(si / 4) === 0 ? '\'24' : Math.floor(si / 4) === 1 ? '\'25' : '\'26'}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.indicators.map((row, ri) => (
                      <tr key={ri} style={{ background: ri % 2 === 0 ? 'white' : '#f8fafc' }}>
                        <td style={{ padding: '4px 8px', border: '1px solid #e2e8f0', fontWeight: 500, color: '#374151' }}>
                          {row.name}
                        </td>
                        {row.signals.map((sig, si) => (
                          <td key={si} style={{ padding: '4px 2px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <SignalCell signal={sig} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {/* ── Section 02: Infrastructure ──────────────────────────────── */}
      <SectionBlock num="02" title="Infrastructure & Government Plans">
        {infraProjects.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {infraProjects.map((p) => <ProgressBar key={p.id} project={p} />)}
          </div>
        )}
        {narratives.infra
          ? <NarrativeText text={narratives.infra} />
          : <PlaceholderText label="Infrastructure narrative" />}
      </SectionBlock>

      {/* ── Section 03: Geopolitical Events ─────────────────────────── */}
      <SectionBlock num="03" title="Geopolitical Events">
        {geoEvents.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {geoEvents.map((ev, i) => (
              <div key={ev.id} style={{
                marginBottom: 10,
                padding: '10px 12px',
                background: '#f8fafc',
                borderLeft: `3px solid ${BLUE}`,
                borderRadius: '0 6px 6px 0',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>{ev.title}</p>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                    {(['fdi', 'gdp', 'tenantRisk'] as const).map((k) => {
                      const val = ev.impact[k];
                      const col = val === 'improving' ? '#16a34a' : val === 'declining' || val === 'risk' || val === 'red' ? '#dc2626' : '#64748b';
                      return (
                        <span key={k} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: col + '20', color: col, fontWeight: 600 }}>
                          {k.toUpperCase()}: {val}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <p style={{ fontSize: 11, color: '#374151', margin: '0 0 3px', lineHeight: 1.5 }}>{ev.description}</p>
                {ev.source && <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{ev.source}</p>}
              </div>
            ))}
          </div>
        )}
        {narratives.geo
          ? <NarrativeText text={narratives.geo} />
          : <PlaceholderText label="Geopolitical events narrative" />}
      </SectionBlock>

      {/* ── Section 04: Sector Update ───────────────────────────────── */}
      <SectionBlock num="04" title="Sector Update">
        {sectorSummaries.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 12 }}>
            <thead>
              <tr style={{ background: NAVY, color: 'white' }}>
                <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 600 }}>Sector</th>
                <th style={{ textAlign: 'center', padding: '6px 10px', fontWeight: 600 }}>Projects</th>
                <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: 600 }}>Highlights</th>
              </tr>
            </thead>
            <tbody>
              {sectorSummaries.map((s, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px 10px', color: NAVY, fontWeight: 600 }}>{s.sector}</td>
                  <td style={{ padding: '6px 10px', textAlign: 'center', color: BLUE, fontWeight: 700 }}>{s.projectCount}</td>
                  <td style={{ padding: '6px 10px', color: '#374151' }}>{s.highlight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {narratives.sector
          ? <NarrativeText text={narratives.sector} />
          : <PlaceholderText label="Sector update narrative" />}
      </SectionBlock>

      {/* ── Section 05: Outlook ─────────────────────────────────────── */}
      <SectionBlock num="05" title="Forward Looking Outlook">
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {[
              { label: 'GDP Growth', value: `${stats.gdpGrowthPct.toFixed(1)}% (${stats.gdpGrowthChange})` },
              { label: 'FDI Inflow', value: `${stats.fdiInflow} (${stats.fdiChange})` },
              { label: 'Inflation', value: `${stats.inflationRate.toFixed(1)}% (${stats.inflationChange})` },
              { label: 'Active Projects', value: String(stats.totalProjects) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: LIGHT, padding: '8px 12px', borderRadius: 6, border: '1px solid #dbeafe' }}>
                <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 2px', textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>{label}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        )}
        {narratives.outlook
          ? <NarrativeText text={narratives.outlook} />
          : <PlaceholderText label="Forward-looking outlook narrative" />}
      </SectionBlock>

      {/* ── News Digest ──────────────────────────────────────────────── */}
      {newsItems.length > 0 && (
        <SectionBlock num="06" title="News Digest">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {newsItems.slice(0, 6).map((item) => {
              const catColor: Record<string, string> = {
                fdi: '#1d4ed8', infrastructure: '#ea580c', policy: '#7c3aed',
                sector: '#059669', geopolitics: '#dc2626', economy: '#6366f1',
              };
              const col = catColor[item.category] ?? '#6366f1';
              return (
                <div key={item.id} style={{
                  padding: '8px 10px',
                  borderLeft: `3px solid ${col}`,
                  background: '#f8fafc',
                  borderRadius: '0 6px 6px 0',
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: col, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
                    {item.category}
                  </span>
                  <p style={{ fontSize: 11, fontWeight: 700, color: NAVY, margin: '3px 0 4px', lineHeight: 1.4 }}>{item.title}</p>
                  <p style={{ fontSize: 10, color: '#374151', margin: '0 0 3px', lineHeight: 1.5 }}>{item.summary}</p>
                  <p style={{ fontSize: 9, color: '#94a3b8', margin: 0 }}>{item.source} · {item.date}</p>
                </div>
              );
            })}
          </div>
        </SectionBlock>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '12px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 9, color: '#94a3b8' }}>
          CONFIDENTIAL — BP BATAM TENANT INTELLIGENCE BRIEF {period.toUpperCase()}
        </span>
        <span style={{ fontSize: 9, color: '#94a3b8' }}>Generated {generated}</span>
      </div>
    </div>
  );
}
