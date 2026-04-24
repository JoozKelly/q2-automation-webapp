"use client";

import { useState } from 'react';
import { Search, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DataIngestion() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleGensparkSearch = () => {
    setIsSearching(true);
    // Simulate an API call that runs `npx @genspark/cli search "BPS Kota Batam Economic Growth Q2 2026"`
    setTimeout(() => {
      setIsSearching(false);
      setSearchStatus('success');
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Data Ingestion</h2>
        <p className="text-slate-400 mt-2">Connect to BPS Batam via Genspark CLI or upload CSV data manually.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Genspark CLI Integration Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm flex flex-col space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Search size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Genspark Deep Search</h3>
              <p className="text-sm text-slate-400">Automated BPS Batam Crawl</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 flex-1">
            Uses the <code className="bg-slate-800 text-indigo-300 px-1 py-0.5 rounded">@genspark/cli</code> to automatically search and crawl the latest economic indicators from official sources.
          </p>
          
          {searchStatus === 'success' && (
            <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-400/10 p-3 rounded-lg text-sm border border-emerald-400/20">
              <CheckCircle2 size={16} />
              <span>Successfully retrieved Q2 2026 data.</span>
            </div>
          )}

          {searchStatus === 'error' && (
            <div className="flex items-center space-x-2 text-rose-400 bg-rose-400/10 p-3 rounded-lg text-sm border border-rose-400/20">
              <AlertCircle size={16} />
              <span>Error: API key required. Please login via CLI.</span>
            </div>
          )}

          <button 
            onClick={handleGensparkSearch}
            disabled={isSearching}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${isSearching ? 'bg-indigo-500/50 text-indigo-200 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'}`}
          >
            {isSearching ? 'Crawling BPS Batam...' : 'Run Genspark Search'}
          </button>
        </div>

        {/* Manual Upload Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm flex flex-col space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Manual Excel Upload</h3>
              <p className="text-sm text-slate-400">Fallback Ingestion</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 flex-1">
            If the automated crawl fails, you can upload the <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300">GDP Kota Batam.xlsx</code> file directly.
          </p>
          
          <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer group">
            <UploadCloud size={32} className="text-slate-500 group-hover:text-blue-400 mb-2 transition-colors" />
            <p className="text-sm font-medium text-slate-300">Click to upload or drag & drop</p>
            <p className="text-xs text-slate-500 mt-1">XLSX, CSV up to 10MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
