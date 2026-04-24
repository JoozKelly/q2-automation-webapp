"use client";

import { useState, useRef } from 'react';
import {
  UploadCloud, Sparkles, FileText, Copy, CheckCircle2,
  AlertCircle, ChevronRight, BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useReportStore } from '@/store/reportStore';
import { useDataStore } from '@/context/store';

function MarkdownSection({ text }: { text: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-slate-100 mt-6 mb-3">{line.slice(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-indigo-300 mt-5 mb-2 uppercase tracking-wide">{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-slate-200 mt-4 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith('---')) return <hr key={i} className="border-slate-700 my-4" />;
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-slate-200 my-1">{line.replace(/\*\*/g, '')}</p>;
        if (line.startsWith('- ') || line.startsWith('* ')) return (
          <div key={i} className="flex gap-2 my-0.5 text-slate-300 text-sm">
            <span className="text-indigo-400 mt-0.5 shrink-0">•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
        return <p key={i} className="text-slate-300 text-sm my-1 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

function parseChapters(text: string): { title: string; angle: string; keyMessage: string; points: string[] }[] {
  const chapters: { title: string; angle: string; keyMessage: string; points: string[] }[] = [];
  const chapterBlocks = text.split(/(?=### Chapter \d+:)/g).filter(b => b.startsWith('### Chapter'));
  for (const block of chapterBlocks) {
    const titleMatch = block.match(/### Chapter \d+:\s*(.+)/);
    const angleMatch = block.match(/\*\*Angle:\*\*\s*(.+)/);
    const msgMatch = block.match(/\*\*Key message:\*\*\s*(.+)/);
    const pointMatches = [...block.matchAll(/^- (.+)/gm)];
    if (!titleMatch) continue;
    chapters.push({
      title: titleMatch[1].trim(),
      angle: angleMatch?.[1]?.trim() ?? '',
      keyMessage: msgMatch?.[1]?.trim() ?? '',
      points: pointMatches.slice(0, 3).map(m => m[1]),
    });
  }
  return chapters;
}

const CHAPTER_PILLS = [
  'Ch 1: Macro Foundation',
  'Ch 2: Infra & Policy',
  'Ch 3: Geopolitical',
  'Ch 4: Sector Momentum',
  'Ch 5: H2 2026 Setup',
];

export default function CEOBriefPage() {
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [prevReportText, setPrevReportText] = useState('');
  const [focus, setFocus] = useState('');
  const [generating, setGenerating] = useState(false);
  const [briefText, setBriefText] = useState('');
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { dashboardStats, newsItems, data: reportData, setCeoBrief, updateNarrative } = useReportStore();
  const { data: chartData } = useDataStore();

  const handleGenerate = async () => {
    setGenerating(true);
    setStatus('streaming');
    setBriefText('');

    // Build context string from store data
    const contextParts: string[] = [];
    if (dashboardStats) {
      contextParts.push(
        `GDP Growth: ${dashboardStats.gdpGrowthPct}% (${dashboardStats.gdpGrowthChange}), ` +
        `FDI: ${dashboardStats.fdiInflow} (${dashboardStats.fdiChange}), ` +
        `Inflation: ${dashboardStats.inflationRate}% (${dashboardStats.inflationChange}), ` +
        `Active Projects: ${dashboardStats.totalProjects}`
      );
    } else if (chartData) {
      const lastGDP = chartData.gdpData.at(-1);
      const lastFDI = chartData.investmentData.at(-1);
      if (lastGDP) contextParts.push(`GDP Growth: ${lastGDP.gdp}%`);
      if (lastFDI) contextParts.push(`FDI: $${lastFDI.foreign}M`);
    }
    if (reportData.infraProjects.length) {
      contextParts.push(`Infrastructure: ${reportData.infraProjects.map((p) => `${p.name} (${p.progress}%)`).join(', ')}`);
    }
    if (reportData.geoEvents.length) {
      contextParts.push(`Key events: ${reportData.geoEvents.map((e) => e.title).join('; ')}`);
    }
    if (newsItems.length) {
      contextParts.push(`Recent news: ${newsItems.slice(0, 5).map((n) => n.title).join('; ')}`);
    }

    const form = new FormData();
    form.append('context', contextParts.join('\n'));
    form.append('focus', focus);
    form.append('prevReportText', prevReportText);
    if (reportFile) form.append('file', reportFile);

    try {
      const res = await fetch('/api/ceo-brief', { method: 'POST', body: form });
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setBriefText(full);
      }

      setCeoBrief(full);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setBriefText(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Push each narrative chapter to the Report Builder store
  const pushToReportBuilder = () => {
    if (!briefText) return;

    // Extract chapter sections from markdown
    const sectionMap: Record<string, string> = {};

    const lines = briefText.split('\n');
    let currentKey: string | null = null;
    let buffer: string[] = [];

    const keywordMap: [RegExp, string][] = [
      [/infra|infrastructure|government/i, 'infra'],
      [/geopolit|trade|diplomatic|corridor/i, 'geo'],
      [/sector|industry|ems|solar|data center/i, 'sector'],
      [/outlook|forward|risk|h2 2026/i, 'outlook'],
    ];

    for (const line of lines) {
      if (line.startsWith('### Chapter')) {
        if (currentKey && buffer.length) {
          (sectionMap as Record<string, string>)[currentKey] = buffer.join('\n').trim();
        }
        buffer = [];
        currentKey = null;
        for (const [re, key] of keywordMap) {
          if (re.test(line)) { currentKey = key; break; }
        }
      } else if (currentKey) {
        buffer.push(line);
      }
    }
    if (currentKey && buffer.length) {
      (sectionMap as Record<string, string>)[currentKey] = buffer.join('\n').trim();
    }

    for (const [section, text] of Object.entries(sectionMap)) {
      updateNarrative(section as Parameters<typeof updateNarrative>[0], text);
    }

    alert(`Narrative context pushed to Report Builder for ${Object.keys(sectionMap).length} section(s).`);
  };

  const hasDashboardData = !!dashboardStats || !!chartData;
  const chapters = status === 'done' ? parseChapters(briefText) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Q3 Storyline Planner</h2>
        <p className="text-slate-400 mt-1 text-sm">
          Use your Q2 data to plan the narrative arc for next quarter. Upload your existing Q2 report
          and/or use ingested data to generate recommended storylines, talking points, and a chapter
          structure for your Q3 CEO briefing.
        </p>
      </div>

      {/* Setup panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload existing report */}
        <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-400" />
            Previous Quarter Report (Q1 2026)
          </h3>
          <p className="text-xs text-slate-500">
            Upload a PDF or paste the key highlights below — Claude will use it to suggest a storyline for the most recent quarter.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setReportFile(e.target.files?.[0] ?? null)}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-[#1e3a5f]/50 hover:border-indigo-500/40 rounded-lg p-5 flex flex-col items-center gap-2 cursor-pointer transition-colors group"
          >
            {reportFile ? (
              <>
                <FileText size={24} className="text-rose-400" />
                <p className="text-sm font-medium text-slate-200">{reportFile.name}</p>
                <p className="text-xs text-slate-500">Click to replace</p>
              </>
            ) : (
              <>
                <UploadCloud size={24} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                <p className="text-sm text-slate-400">Click to upload PDF</p>
              </>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 block">
              Or paste key highlights from previous report
            </label>
            <textarea
              value={prevReportText}
              onChange={(e) => setPrevReportText(e.target.value)}
              placeholder="e.g. Q1 GDP growth was 6.8%, FDI reached $185M. Key projects: Tanjung Uncang Phase 1 completed. Solar sector added 3 new investments..."
              rows={4}
              className="w-full bg-[#060e1e] border border-[#1e3a5f]/50 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Data context */}
        <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Current Data Context</h3>

          {hasDashboardData ? (
            <div className="space-y-2">
              {dashboardStats && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'GDP Growth', value: `${dashboardStats.gdpGrowthPct}%` },
                    { label: 'FDI', value: dashboardStats.fdiInflow },
                    { label: 'Inflation', value: `${dashboardStats.inflationRate}%` },
                    { label: 'Projects', value: String(dashboardStats.totalProjects) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#0f2040]/60 rounded-xl p-2.5">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-sm font-semibold text-slate-200">{value}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} />
                {reportData.infraProjects.length} infra projects · {reportData.geoEvents.length} events · {newsItems.length} news items loaded
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-500 text-sm">No data ingested yet.</p>
              <Link
                href="/ingestion"
                className="text-xs text-indigo-400 hover:underline mt-1 inline-flex items-center gap-1"
              >
                Go to Data Ingestion <ChevronRight size={12} />
              </Link>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">
              Strategic priorities to emphasise
            </label>
            <textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. Lead with renewable energy momentum, position vs Johor SEZ, highlight US–Indonesia trade framework…"
              rows={3}
              className="w-full bg-[#0b1829] border border-[#1e3a5f]/50 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Chapter Structure Preview */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Chapter Structure</p>
        <div className="flex flex-wrap gap-2">
          {CHAPTER_PILLS.map((pill) => (
            <span
              key={pill}
              className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs px-3 py-1.5 rounded-full"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={generating || (!hasDashboardData && !reportFile)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            generating || (!hasDashboardData && !reportFile)
              ? 'bg-indigo-500/30 text-indigo-300 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]'
          }`}
        >
          <Sparkles size={15} className={generating ? 'animate-pulse' : ''} />
          {generating ? 'Generating Brief…' : 'Generate CEO Brief'}
        </button>

        {!hasDashboardData && !reportFile && (
          <p className="text-xs text-slate-500">
            Upload a report PDF above, or{' '}
            <Link href="/ingestion" className="text-indigo-400 hover:underline">
              ingest data first
            </Link>
            .
          </p>
        )}
      </div>

      {/* Chapter Cards — shown after generation */}
      {status === 'done' && chapters.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Generated Chapter Storylines</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((ch, idx) => (
              <div key={idx} className="bg-[#080f20] border border-[#1e3a5f]/50 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Chapter {idx + 1}</p>
                <p className="text-sm font-semibold text-slate-100 leading-snug">{ch.title}</p>
                {ch.angle && (
                  <p className="text-xs text-indigo-300 italic">{ch.angle}</p>
                )}
                {ch.keyMessage && (
                  <p className="text-xs text-slate-400 leading-relaxed">{ch.keyMessage}</p>
                )}
                {ch.points.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {ch.points.map((pt, pi) => (
                      <li key={pi} className="flex gap-1.5 text-xs text-slate-400">
                        <span className="text-indigo-500 shrink-0 mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output */}
      {(briefText || status === 'error') && (
        <div className="bg-[#0b1829] border border-[#1e3a5f]/50 rounded-2xl overflow-hidden">
          {/* Output header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e3a5f]/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">CEO Brief</span>
              {status === 'streaming' && (
                <span className="text-xs text-indigo-400 animate-pulse">Writing…</span>
              )}
              {status === 'done' && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Done
                </span>
              )}
            </div>
            {status === 'done' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={pushToReportBuilder}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight size={13} />
                  Push to Report Builder
                </button>
                <button
                  onClick={copyToClipboard}
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 bg-[#0f2040]/60 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[600px] overflow-y-auto">
            {status === 'error' ? (
              <div className="flex items-center gap-2 text-rose-400 text-sm">
                <AlertCircle size={16} />
                {briefText}
              </div>
            ) : (
              <MarkdownSection text={briefText} />
            )}
            {status === 'streaming' && (
              <span className="inline-block w-1 h-4 bg-indigo-400 animate-pulse ml-1 align-middle" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
