"use client";

import { useState } from 'react';
import { FileText, LayoutTemplate, Sparkles, Send, Download } from 'lucide-react';
import { usePDF } from 'react-to-pdf';

export default function ReportBuilder() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyline, setStoryline] = useState('');
  const { toPDF, targetRef } = usePDF({filename: 'Batam_Economic_Outlook_Q2_2026.pdf'});

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI synthesis of data
    setTimeout(() => {
      setStoryline(`### Batam Economic Outlook Q2 2026\n\n**Executive Summary:**\nBatam's economy has demonstrated exceptional resilience in Q2 2026, driven by a surge in high-tech manufacturing investments and stabilized inflation. The GDP growth reached an impressive 7.2%, outperforming national averages.\n\n**Key Highlights:**\n- **Foreign Direct Investment:** The confirmed $200M investment from Apple Inc. and Luxshare for AirTag production has catapulted FDI inflows by 22% compared to Q1.\n- **Inflation Control:** Effective local policies have kept the inflation rate steady at 2.5%, ensuring favorable operating costs for our tenants.\n- **Infrastructure Readiness:** The industrial parks are fully prepared to accommodate the influx of new manufacturing lines, with upgraded power grids and specialized logistics hubs.`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Report Builder</h2>
        <p className="text-slate-400 mt-2">Synthesize data and generate the final storyline for the Q2 Economic Memo.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Settings Panel */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm flex flex-col space-y-6 overflow-y-auto">
          <div>
            <h3 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
              <LayoutTemplate size={20} className="text-indigo-400" />
              <span>Report Structure</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Select sections to include</p>
          </div>

          <div className="space-y-3">
            {['Executive Summary', 'Macroeconomic Indicators', 'Investment Highlights (Apple/Luxshare)', 'Sector Analysis', 'Future Outlook'].map((item, i) => (
              <label key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 cursor-pointer transition-colors">
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900" />
                <span className="text-sm font-medium text-slate-300">{item}</span>
              </label>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-medium transition-all ${isGenerating ? 'bg-indigo-500/50 text-indigo-200 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'}`}
            >
              <Sparkles size={18} />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate Storyline (AI)'}</span>
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm flex flex-col overflow-hidden">
          <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <FileText size={18} className="text-emerald-400" />
              <span>Generated Content</span>
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => toPDF()}
                disabled={!storyline}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${storyline ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                title="Export PDF"
              >
                <Download size={16} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto bg-white text-slate-900" ref={targetRef}>
            {storyline ? (
              <div className="prose prose-slate max-w-none p-8">
                {storyline.split('\n').map((line, i) => {
                  if (line.startsWith('###')) return <h3 key={i} className="text-2xl font-bold text-slate-900 mt-6 mb-4">{line.replace('### ', '')}</h3>;
                  if (line.startsWith('**')) return <h4 key={i} className="text-xl font-semibold text-slate-800 mt-5 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                  if (line.startsWith('-')) return <li key={i} className="text-slate-700 ml-4 mb-2">{line.substring(2)}</li>;
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i} className="text-slate-700 leading-relaxed">{line}</p>;
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                <Sparkles size={48} className="text-slate-700 opacity-50" />
                <p>Select sections and click Generate to build the report storyline.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
