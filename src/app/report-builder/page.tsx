"use client";

import { useState } from 'react';
import { Sparkles, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { usePDF } from 'react-to-pdf';
import { useDataStore } from '@/context/store';
import { useReportStore } from '@/store/reportStore';
import InfraSection from '@/components/sections/InfraSection';
import GeoSection from '@/components/sections/GeoSection';
import SectorSection from '@/components/sections/SectorSection';
import ReportPDFContent from '@/components/pdf/ReportPDFContent';

type SectionKey = 'infra' | 'geo' | 'sector' | 'outlook';

const SECTION_META: { key: SectionKey; number: string; title: string; subtitle: string }[] = [
  { key: 'infra',   number: '02', title: 'Infrastructure & Government Plans', subtitle: 'Progress on key infrastructure categories' },
  { key: 'geo',     number: '03', title: 'Geopolitical Events',              subtitle: 'Major events and their impact on Batam' },
  { key: 'sector',  number: '04', title: 'Sector Update',                    subtitle: 'Active projects by industry cluster' },
  { key: 'outlook', number: '05', title: 'Forward Looking Outlook',          subtitle: 'Key themes and risks ahead' },
];

function NarrativePane({
  narrative,
  isGenerating,
  onGenerate,
  onChange,
}: {
  narrative: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Narrative</span>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            isGenerating
              ? 'bg-indigo-500/30 text-indigo-300 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]'
          }`}
        >
          <Sparkles size={13} />
          {isGenerating ? 'Generating…' : 'Generate'}
        </button>
      </div>
      <textarea
        value={narrative}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isGenerating ? 'Writing narrative…' : 'Click Generate to draft AI copy, or type here…'}
        className="flex-1 min-h-[180px] w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
      />
    </div>
  );
}

interface SectionWrapperProps {
  meta: (typeof SECTION_META)[number];
  narrative: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onNarrativeChange: (v: string) => void;
  children: React.ReactNode;
}

function SectionWrapper({ meta, narrative, isGenerating, onGenerate, onNarrativeChange, children }: SectionWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-800 hover:bg-slate-800/30 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black text-slate-700">{meta.number}</span>
          <div>
            <h3 className="text-base font-bold text-slate-200">{meta.title}</h3>
            <p className="text-xs text-slate-500">{meta.subtitle}</p>
          </div>
        </div>
        {collapsed ? <ChevronDown size={18} className="text-slate-500" /> : <ChevronUp size={18} className="text-slate-500" />}
      </button>

      {!collapsed && (
        <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>{children}</div>
          <NarrativePane
            narrative={narrative}
            isGenerating={isGenerating}
            onGenerate={onGenerate}
            onChange={onNarrativeChange}
          />
        </div>
      )}
    </div>
  );
}

export default function ReportBuilder() {
  const { data: chartData } = useDataStore();
  const { data: reportData, sectorSummaries, dashboardStats } = useReportStore();
  const { toPDF, targetRef } = usePDF({ filename: 'Batam_Economic_Outlook_Q2_2026.pdf' });

  const [narratives, setNarratives] = useState<Record<SectionKey, string>>({
    infra: '', geo: '', sector: '', outlook: '',
  });
  const [generating, setGenerating] = useState<Record<SectionKey, boolean>>({
    infra: false, geo: false, sector: false, outlook: false,
  });

  const setNarrative = (key: SectionKey, text: string) =>
    setNarratives((prev) => ({ ...prev, [key]: text }));

  const setGen = (key: SectionKey, val: boolean) =>
    setGenerating((prev) => ({ ...prev, [key]: val }));

  const buildPrompt = (key: SectionKey): string => {
    const infra = reportData.infraProjects.length > 0
      ? `Infrastructure projects: ${JSON.stringify(reportData.infraProjects)}`
      : 'Batam infrastructure: power grid expansion, road networks, water supply, fibre connectivity, port upgrades, tax incentives.';

    const geo = reportData.geoEvents.length > 0
      ? `Geopolitical events: ${JSON.stringify(reportData.geoEvents)}`
      : 'Key events: Rempang Island MOU (US×Indonesia), Carbon Neutral Industrial Park (Sembcorp), Singapore Solar Offtake, US–IDN Trade Framework.';

    const sector = sectorSummaries.length > 0
      ? `Sector data: ${JSON.stringify(sectorSummaries)}`
      : 'Sectors: Electronics/EMS (9 projects), Solar (6), Data Centers (4), BESS (3), Medical (2), E-Cigarettes (4).';

    const macroContext = dashboardStats
      ? `GDP growth: ${dashboardStats.gdpGrowthPct}% (${dashboardStats.gdpGrowthChange}), FDI: ${dashboardStats.fdiInflow} (${dashboardStats.fdiChange}), Inflation: ${dashboardStats.inflationRate}% (${dashboardStats.inflationChange}).`
      : chartData?.summary ?? 'Batam Q2 2026 economic data.';

    const prompts: Record<SectionKey, string> = {
      infra: `Write a professional 2-paragraph narrative on Batam's infrastructure progress for Q2 2026. Context: ${infra} Macro: ${macroContext} Be specific, business-oriented, and highlight tenant implications.`,
      geo: `Write a professional 2-paragraph narrative on major geopolitical events affecting Batam in Q2 2026. Context: ${geo} Macro: ${macroContext} Analyse FDI and tenant impact.`,
      sector: `Write a professional 2-paragraph narrative on Batam's sector update for Q2 2026. Context: ${sector} Macro: ${macroContext} Highlight growth momentum and key players.`,
      outlook: `Write a professional 3-paragraph forward-looking outlook for Batam FTZ in H2 2026. Macro context: ${macroContext} Cover macro risks, infrastructure pipeline, sector opportunities, and strategic positioning vs Johor and Vietnam. End with an executive recommendation for tenants.`,
    };
    return prompts[key];
  };

  const handleGenerate = async (key: SectionKey) => {
    setGen(key, true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: chartData ?? { summary: 'Batam Q2 2026 economic data' },
          sections: [buildPrompt(key)],
        }),
      });
      const json = await res.json();
      if (json.result) setNarrative(key, json.result);
    } catch (err) {
      console.error(err);
    } finally {
      setGen(key, false);
    }
  };

  const hasInfra   = reportData.infraProjects.length > 0;
  const hasGeo     = reportData.geoEvents.length > 0;
  const hasSectors = sectorSummaries.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hidden styled PDF target */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none' }} ref={targetRef}>
        <ReportPDFContent narratives={narratives} period="Q2 2026" stats={dashboardStats} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Report Builder</h2>
          <p className="text-slate-400 mt-1 text-sm">
            Generate AI narratives for each section, then export a styled PDF.
            {dashboardStats && (
              <span className="ml-2 text-emerald-400 font-medium">
                · Live data loaded ({dashboardStats.dataSource === 'genspark' ? 'AI search' : 'uploaded file'})
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => toPDF()}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTION_META.map((meta) => (
          <SectionWrapper
            key={meta.key}
            meta={meta}
            narrative={narratives[meta.key]}
            isGenerating={generating[meta.key]}
            onGenerate={() => handleGenerate(meta.key)}
            onNarrativeChange={(v) => setNarrative(meta.key, v)}
          >
            {meta.key === 'infra' && (
              <InfraSection projects={hasInfra ? reportData.infraProjects : undefined} />
            )}
            {meta.key === 'geo' && (
              <GeoSection events={hasGeo ? reportData.geoEvents : undefined} />
            )}
            {meta.key === 'sector' && (
              <SectorSection summaries={hasSectors ? sectorSummaries : undefined} />
            )}
            {meta.key === 'outlook' && (
              <div className="rounded-xl bg-slate-800/30 border border-slate-700 p-5 space-y-3">
                {dashboardStats ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'GDP Growth', value: `${dashboardStats.gdpGrowthPct.toFixed(1)}% (${dashboardStats.gdpGrowthChange})` },
                      { label: 'FDI Inflow', value: `${dashboardStats.fdiInflow} (${dashboardStats.fdiChange})` },
                      { label: 'Inflation', value: `${dashboardStats.inflationRate.toFixed(1)}% (${dashboardStats.inflationChange})` },
                      { label: 'Active Projects', value: String(dashboardStats.totalProjects) },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-slate-200">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    Run the AI search in Data Ingestion to populate macro context for this section.
                    Key themes to cover: infrastructure pipeline readiness, FDI diversification,
                    geopolitical positioning (US–IDN, Singapore corridor), competitive landscape vs
                    Johor &amp; Vietnam, and tenant risk signals for H2 2026.
                  </p>
                )}
              </div>
            )}
          </SectionWrapper>
        ))}
      </div>
    </div>
  );
}
