'use client';

import React from 'react';
import type { DashboardStats } from '@/types/report';

interface Props {
  narratives: Record<string, string>;
  period?: string;
  stats?: DashboardStats | null;
}

const NAVY  = '#0a1628';
const BLUE  = '#1d4ed8';
const LIGHT = '#f0f4ff';

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
    <div style={{ padding: '28px 48px', borderBottom: '1px solid #e2e8f0' }}>
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
  return (
    <div style={{ fontSize: 12, lineHeight: 1.8, color: '#374151' }}>
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        if (line.startsWith('### ')) return (
          <p key={i} style={{ fontWeight: 700, fontSize: 13, color: NAVY, margin: '12px 0 4px' }}>
            {line.replace('### ', '')}
          </p>
        );
        if (line.startsWith('**') && line.endsWith('**')) return (
          <p key={i} style={{ fontWeight: 700, color: '#1e3a5f', margin: '8px 0 2px' }}>
            {line.replace(/\*\*/g, '')}
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
    <p style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
      {label} — generate AI narrative in the Report Builder to populate this section.
    </p>
  );
}

export default function ReportPDFContent({ narratives, period = 'Q2 2026', stats }: Props) {
  const generated = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Use live stats if available, otherwise fall back to display placeholders
  const gdpDisplay     = stats ? `${stats.gdpGrowthPct.toFixed(1)}%` : '—';
  const fdiDisplay     = stats ? stats.fdiInflow : '—';
  const inflDisplay    = stats ? `${stats.inflationRate.toFixed(1)}%` : '—';
  const projDisplay    = stats ? String(stats.totalProjects) : '—';
  const sourceLabel    = stats ? `Data: ${stats.dataSource === 'genspark' ? 'AI Web Search' : stats.dataSource === 'upload' ? 'Uploaded File' : 'Manual'}` : 'Data: not yet ingested';

  return (
    <div
      style={{
        width: 794,
        background: 'white',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#0f172a',
      }}
    >
      {/* Cover / Header */}
      <div style={{ background: NAVY, color: 'white', padding: '40px 48px 32px' }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase' as const }}>
          BP Batam — Tenant Intelligence Brief
        </p>

        <div style={{ borderBottom: `3px solid ${BLUE}`, paddingBottom: 20, marginBottom: 24 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, margin: '0 0 4px', lineHeight: 1.1 }}>
            BATAM ECONOMIC OUTLOOK
          </h1>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#93c5fd', margin: 0 }}>
            {period}
          </h2>
        </div>

        {/* Key stats row — driven by live data */}
        <div style={{ display: 'flex', gap: 48 }}>
          <StatBox label="GDP Growth"       value={gdpDisplay}  color="#34d399" />
          <StatBox label="FDI Inflow"       value={fdiDisplay}  color="#60a5fa" />
          <StatBox label="Inflation"        value={inflDisplay} color="#a78bfa" />
          <StatBox label="Active Projects"  value={projDisplay} color="#fb923c" />
        </div>
      </div>

      {/* Executive Note */}
      <div style={{ background: LIGHT, padding: '14px 48px', borderBottom: `1px solid #dbeafe` }}>
        <p style={{ fontSize: 11, color: '#1e3a5f', margin: 0, lineHeight: 1.6 }}>
          <strong>Report Scope:</strong> This brief covers {period} macroeconomic indicators,
          infrastructure progress, key geopolitical events, sector pipeline updates, and the
          forward-looking outlook for Batam Free Trade Zone tenants.{' '}
          <span style={{ color: '#94a3b8' }}>{sourceLabel}</span>
        </p>
      </div>

      {/* Sections */}
      <SectionBlock num="02" title="Infrastructure & Government Plans">
        {narratives.infra
          ? <NarrativeText text={narratives.infra} />
          : <PlaceholderText label="Infrastructure narrative" />}
      </SectionBlock>

      <SectionBlock num="03" title="Geopolitical Events">
        {narratives.geo
          ? <NarrativeText text={narratives.geo} />
          : <PlaceholderText label="Geopolitical events narrative" />}
      </SectionBlock>

      <SectionBlock num="04" title="Sector Update">
        {narratives.sector
          ? <NarrativeText text={narratives.sector} />
          : <PlaceholderText label="Sector update narrative" />}
      </SectionBlock>

      <SectionBlock num="05" title="Forward Looking Outlook">
        {narratives.outlook
          ? <NarrativeText text={narratives.outlook} />
          : <PlaceholderText label="Forward-looking outlook narrative" />}
      </SectionBlock>

      {/* Footer */}
      <div
        style={{
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 9, color: '#94a3b8' }}>
          CONFIDENTIAL — BP BATAM TENANT INTELLIGENCE BRIEF {period.toUpperCase()}
        </span>
        <span style={{ fontSize: 9, color: '#94a3b8' }}>Generated {generated}</span>
      </div>
    </div>
  );
}
