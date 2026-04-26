"use client";

import { useState, useMemo } from 'react';
import { Sparkles, Download, ChevronDown, ChevronUp, BookOpen, Lightbulb, CheckCircle2 } from 'lucide-react';
import { usePDF } from 'react-to-pdf';
import { useDataStore } from '@/context/store';
import { useReportStore } from '@/store/reportStore';
import InfraSection from '@/components/sections/InfraSection';
import GeoSection from '@/components/sections/GeoSection';
import SectorSection from '@/components/sections/SectorSection';
import ReportPDFContent from '@/components/pdf/ReportPDFContent';
import Link from 'next/link';

// ─── CEO brief chapter parser ────────────────────────────────────────────────

interface Chapter {
  title: string;
  angle: string;
  keyMessage: string;
  points: string[];
}

function parseChapters(text: string): Chapter[] {
  if (!text) return [];
  const chapters: Chapter[] = [];
  const blocks = text.split(/(?=### Chapter \d+:)/g).filter((b) => b.startsWith('### Chapter'));
  for (const block of blocks) {
    const titleMatch = block.match(/### Chapter \d+:\s*(.+)/);
    const angleMatch = block.match(/\*\*Angle:\*\*\s*(.+)/);
    const msgMatch   = block.match(/\*\*Key message:\*\*\s*(.+)/);
    const pointMatches = [...block.matchAll(/^- (.+)/gm)];
    if (!titleMatch) continue;
    chapters.push({
      title:      titleMatch[1].trim(),
      angle:      angleMatch?.[1]?.trim() ?? '',
      keyMessage: msgMatch?.[1]?.trim() ?? '',
      points:     pointMatches.slice(0, 3).map((m) => m[1]),
    });
  }
  return chapters;
}

// Map chapter index → section key
const CHAPTER_SECTION_MAP: Record<number, string> = {
  0: 'infra',    // Chapter 1: Macro Foundation → we use it for context
  1: 'infra',    // Chapter 2: Infra & Policy
  2: 'geo',      // Chapter 3: Geopolitical
  3: 'sector',   // Chapter 4: Sector Momentum
  4: 'outlook',  // Chapter 5: H2 Setup
};

// ─── Storyline Guide panel ───────────────────────────────────────────────────

function StorylineGuide({ chapters }: { chapters: Chapter[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-[#080f20] border border-indigo-500/20 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-indigo-500/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen size={15} className="text-indigo-400" />
          <span className="text-sm font-semibold text-indigo-300">Q3 Storyline Guide</span>
          <span className="text-xs text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
            {chapters.length} chapters from CEO Brief
          </span>
        </div>
        {open
          ? <ChevronUp size={15} className="text-slate-500" />
          : <ChevronDown size={15} className="text-slate-500" />}
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-[#0f2040]/10 border-t border-indigo-500/20">
          {chapters.map((ch, i) => (
            <div key={i} className="bg-[#080f20] p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                Chapter {i + 1}
              </p>
              <p className="text-xs font-semibold text-slate-200 leading-snug">{ch.title}</p>
              {ch.angle && (
                <p className="text-[11px] text-indigo-300/80 italic leading-snug">{ch.angle}</p>
              )}
              {ch.points.length > 0 && (
                <ul className="space-y-0.5 pt-1">
                  {ch.points.map((pt, j) => (
                    <li key={j} className="flex gap-1.5 text-[11px] text-slate-400 leading-relaxed">
                      <span className="text-indigo-500 shrink-0 mt-0.5">·</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section chapter hint ────────────────────────────────────────────────────

function ChapterHint({ chapter }: { chapter: Chapter }) {
  return (
    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-3 py-2.5 mb-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Lightbulb size={12} className="text-indigo-400" />
        <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
          CEO Brief angle
        </span>
      </div>
      {chapter.angle && (
        <p className="text-xs text-indigo-300 italic mb-1">{chapter.angle}</p>
      )}
      {chapter.keyMessage && (
        <p className="text-xs text-slate-400 leading-snug">{chapter.keyMessage}</p>
      )}
    </div>
  );
}

// ─── Narrative pane ──────────────────────────────────────────────────────────

function NarrativePane({
  narrative,
  isGenerating,
  onGenerate,
  onChange,
  chapter,
}: {
  narrative: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onChange: (v: string) => void;
  chapter?: Chapter;
}) {
  return (
    <div className="flex flex-col gap-2 h-full">
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
      {chapter && (chapter.angle || chapter.keyMessage) && (
        <ChapterHint chapter={chapter} />
      )}
      <textarea
        value={narrative}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isGenerating ? 'Writing narrative…' : 'Click Generate to draft AI copy, or type here…'}
        className="flex-1 min-h-[180px] w-full bg-[#080f20] border border-[#1e3a5f]/50 rounded-lg px-4 py-3 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
      />
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

type SectionKey = 'infra' | 'geo' | 'sector' | 'outlook';

const SECTION_META: { key: SectionKey; number: string; title: string; subtitle: string }[] = [
  { key: 'infra',   number: '02', title: 'Infrastructure & Government Plans', subtitle: 'Progress on key infrastructure categories' },
  { key: 'geo',     number: '03', title: 'Geopolitical Events',               subtitle: 'Major events and their impact on Batam' },
  { key: 'sector',  number: '04', title: 'Sector Update',                     subtitle: 'Active projects by industry cluster' },
  { key: 'outlook', number: '05', title: 'Forward Looking Outlook',           subtitle: 'Key themes and risks ahead' },
];

interface SectionWrapperProps {
  meta: (typeof SECTION_META)[number];
  narrative: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onNarrativeChange: (v: string) => void;
  chapter?: Chapter;
  children: React.ReactNode;
}

function SectionWrapper({ meta, narrative, isGenerating, onGenerate, onNarrativeChange, chapter, children }: SectionWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-2xl overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f]/50 hover:bg-[#0f2040]/40 transition-colors text-left"
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
            chapter={chapter}
          />
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportBuilder() {
  const { data: chartData }  = useDataStore();
  const { data: reportData, sectorSummaries, dashboardStats, ceoBrief, macroGrid, newsItems, labourStats, tradeStats, updateNarrative: saveNarrative } = useReportStore();
  const { toPDF, targetRef } = usePDF({ filename: 'Batam_Economic_Outlook_Q2_2026.pdf' });

  const [narratives, setNarratives] = useState<Record<SectionKey, string>>({
    infra:   reportData.narratives.infra   ?? '',
    geo:     reportData.narratives.geo     ?? '',
    sector:  reportData.narratives.sector  ?? '',
    outlook: reportData.narratives.outlook ?? '',
  });
  const [generating, setGenerating] = useState<Record<SectionKey, boolean>>({
    infra: false, geo: false, sector: false, outlook: false,
  });
  const [generatingAll, setGeneratingAll] = useState(false);

  const setNarrative = (key: SectionKey, text: string) => {
    setNarratives((prev) => ({ ...prev, [key]: text }));
    saveNarrative(key as Parameters<typeof saveNarrative>[0], text);
  };

  const setGen = (key: SectionKey, val: boolean) =>
    setGenerating((prev) => ({ ...prev, [key]: val }));

  const chapters = useMemo(() => parseChapters(ceoBrief), [ceoBrief]);

  // Map section key → the most relevant chapter
  const sectionChapter: Record<SectionKey, Chapter | undefined> = useMemo(() => ({
    infra:   chapters[1],  // Ch 2: Infra & Policy
    geo:     chapters[2],  // Ch 3: Geopolitical
    sector:  chapters[3],  // Ch 4: Sector Momentum
    outlook: chapters[4],  // Ch 5: H2 2026 Setup
  }), [chapters]);

  const buildPrompt = (key: SectionKey): string => {
    const chapterCtx = sectionChapter[key]
      ? `CEO Brief angle for this section: "${sectionChapter[key]!.angle}". Key message to convey: "${sectionChapter[key]!.keyMessage}". Talking points: ${sectionChapter[key]!.points.join('; ')}.`
      : '';

    const infra = reportData.infraProjects.length > 0
      ? `Infrastructure projects: ${JSON.stringify(reportData.infraProjects)}`
      : 'Batam infrastructure: power grid expansion, road networks, water supply, fibre connectivity, port upgrades, tax incentives.';

    const geo = reportData.geoEvents.length > 0
      ? `Geopolitical events: ${JSON.stringify(reportData.geoEvents)}`
      : 'Key events: Rempang Island MOU (US×Indonesia), Carbon Neutral Industrial Park, Singapore Solar Offtake, US–IDN Trade Framework.';

    const sector = sectorSummaries.length > 0
      ? `Sector data: ${JSON.stringify(sectorSummaries)}`
      : 'Sectors: Electronics/EMS (9), Solar (6), Data Centers (4), BESS (3), Medical (2), E-Cigarettes (4).';

    const macroContext = dashboardStats
      ? `GDP growth: ${dashboardStats.gdpGrowthPct}% (${dashboardStats.gdpGrowthChange}), FDI: ${dashboardStats.fdiInflow} (${dashboardStats.fdiChange}), Inflation: ${dashboardStats.inflationRate}% (${dashboardStats.inflationChange}).`
      : chartData?.summary ?? 'Batam Q2 2026 economic data.';

    const prompts: Record<SectionKey, string> = {
      infra: `Write a professional 2-paragraph narrative on Batam's infrastructure progress for Q2 2026. ${chapterCtx} Context: ${infra} Macro: ${macroContext} Be specific, business-oriented, and highlight tenant implications.`,
      geo: `Write a professional 2-paragraph narrative on major geopolitical events affecting Batam in Q2 2026. ${chapterCtx} Context: ${geo} Macro: ${macroContext} Analyse FDI and tenant impact.`,
      sector: `Write a professional 2-paragraph narrative on Batam's sector update for Q2 2026. ${chapterCtx} Context: ${sector} Macro: ${macroContext} Highlight growth momentum and key players.`,
      outlook: `Write a professional 3-paragraph forward-looking outlook for Batam FTZ in H2 2026. ${chapterCtx} Macro context: ${macroContext} Cover macro risks, infrastructure pipeline, sector opportunities, and strategic positioning vs Johor and Vietnam. End with an executive recommendation for tenants.`,
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

  const handleGenerateAll = async () => {
    setGeneratingAll(true);
    for (const key of ['infra', 'geo', 'sector', 'outlook'] as SectionKey[]) {
      await handleGenerate(key);
    }
    setGeneratingAll(false);
  };

  const hasInfra   = reportData.infraProjects.length > 0;
  const hasGeo     = reportData.geoEvents.length > 0;
  const hasSectors = sectorSummaries.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hidden PDF target */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none', width: 794 }} ref={targetRef}>
        <ReportPDFContent
          narratives={narratives}
          period="Q2 2026"
          stats={dashboardStats}
          gdpData={chartData?.gdpData}
          investmentData={chartData?.investmentData}
          inflationData={chartData?.inflationData}
          infraProjects={reportData.infraProjects}
          geoEvents={reportData.geoEvents}
          sectorSummaries={sectorSummaries}
          macroGrid={macroGrid}
          newsItems={newsItems}
          labourStats={labourStats}
          tradeStats={tradeStats}
        />
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAll}
            disabled={generatingAll || Object.values(generating).some(Boolean)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              generatingAll
                ? 'bg-emerald-500/30 text-emerald-300 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }`}
          >
            <Sparkles size={15} className={generatingAll ? 'animate-pulse' : ''} />
            {generatingAll ? 'Generating All...' : 'Generate All'}
          </button>
          <button
            onClick={() => toPDF()}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Storyline ready banner */}
      {ceoBrief && !Object.values(narratives).some(Boolean) && (
        <div className="flex items-center justify-between gap-4 px-5 py-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-300">
              Storyline ready — click <strong>Generate All</strong> to auto-write all section narratives based on your Q3 Storyline Plan and ingested data.
            </p>
          </div>
          <button onClick={handleGenerateAll} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 shrink-0 whitespace-nowrap">
            Generate All →
          </button>
        </div>
      )}

      {/* CEO Brief Storyline Guide */}
      {chapters.length > 0 ? (
        <StorylineGuide chapters={chapters} />
      ) : (
        <div className="bg-[#0b1829] border border-dashed border-[#1e3a5f]/40 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={16} className="text-slate-600" />
            <div>
              <p className="text-sm font-medium text-slate-400">No storyline guide yet</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Generate a CEO Brief to unlock an AI-driven chapter guide that shapes each section's narrative.
              </p>
            </div>
          </div>
          <Link
            href="/ceo-brief"
            className="shrink-0 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            Go to Storyline Planner →
          </Link>
        </div>
      )}

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
            chapter={sectionChapter[meta.key]}
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
              <div className="rounded-xl bg-[#080f20] border border-[#1e3a5f]/50 p-5 space-y-3">
                {dashboardStats ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'GDP Growth', value: `${dashboardStats.gdpGrowthPct.toFixed(1)}% (${dashboardStats.gdpGrowthChange})` },
                      { label: 'FDI Inflow', value: `${dashboardStats.fdiInflow} (${dashboardStats.fdiChange})` },
                      { label: 'Inflation', value: `${dashboardStats.inflationRate.toFixed(1)}% (${dashboardStats.inflationChange})` },
                      { label: 'Active Projects', value: String(dashboardStats.totalProjects) },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#0f2040]/60 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                        <p className="text-sm font-semibold text-slate-200">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    Run the AI search in Data Ingestion to populate macro context for this section.
                    Key themes: infrastructure pipeline readiness, FDI diversification,
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
