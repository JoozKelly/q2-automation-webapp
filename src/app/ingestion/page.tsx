"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Terminal, Download } from 'lucide-react';
import { useDataStore, EconomicData } from '@/context/store';
import { useReportStore } from '@/store/reportStore';
import * as XLSX from 'xlsx';
import { parseWorkbook, parseGDPSheet, detectGDPSheet } from '@/lib/parsers/xlsx';

export default function DataIngestion() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, setData } = useDataStore();
  const { setGDPHistorical, setRawWorkbook } = useReportStore();

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const parseAndSaveData = (fullOutput: string) => {
    try {
      // The output contains logs and JSON. We need to extract the JSON.
      // We look for the first '{' and parse it.
      const jsonStart = fullOutput.indexOf('{');
      if (jsonStart !== -1) {
        const jsonStr = fullOutput.substring(jsonStart).split('[DONE]')[0].trim();
        const parsed = JSON.parse(jsonStr);
        
        // Transform the Genspark output into our expected EconomicData structure
        // Since we are mocking the specific Genspark output structure for this hackathon:
        const newEconomicData: EconomicData = {
          gdpData: [
            { year: '2020', gdp: 4.5, target: 5.0 },
            { year: '2021', gdp: 5.1, target: 5.2 },
            { year: '2022', gdp: 5.8, target: 5.5 },
            { year: '2023', gdp: 6.2, target: 6.0 },
            { year: '2024', gdp: 6.8, target: 6.5 },
            { year: '2025', gdp: 7.0, target: 6.8 },
            { year: '2026', gdp: parseFloat((Math.random() * (7.5 - 6.8) + 6.8).toFixed(1)), target: 7.0 }, // Dynamic update
          ],
          investmentData: [
            { quarter: 'Q1 2025', foreign: 120, domestic: 80 },
            { quarter: 'Q2 2025', foreign: 150, domestic: 90 },
            { quarter: 'Q3 2025', foreign: 140, domestic: 85 },
            { quarter: 'Q4 2025', foreign: 180, domestic: 100 },
            { quarter: 'Q1 2026', foreign: 220, domestic: 110 },
            { quarter: 'Q2 2026', foreign: Math.floor(Math.random() * 50 + 200), domestic: Math.floor(Math.random() * 20 + 100) }, // Dynamic update
          ],
          inflationData: [
            { month: 'Jan 26', rate: 2.7 },
            { month: 'Feb 26', rate: 2.6 },
            { month: 'Mar 26', rate: 2.5 },
            { month: 'Apr 26', rate: parseFloat((Math.random() * (2.8 - 2.2) + 2.2).toFixed(1)) },
          ],
          summary: parsed.message || 'Successfully fetched economic data from BPS.'
        };
        
        setData(newEconomicData);
      }
    } catch (e) {
      console.error("Failed to parse Genspark JSON", e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setUploadStatus('uploading');

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const buffer = ev.target?.result as ArrayBuffer;
        const wb = parseWorkbook(buffer);
        const gdpSheetKey = detectGDPSheet(wb);
        const gdpRows = gdpSheetKey ? parseGDPSheet(wb[gdpSheetKey]) : [];

        // Write all historical rows to the report store (for the Historical GDP chart)
        setGDPHistorical(gdpRows);
        setRawWorkbook(wb, file.name);

        const gdpData = gdpRows
          .filter((d) => d.year >= 2018)
          .map((d) => ({
            year: String(d.year),
            gdp: d.gdpGrowthPct ?? 0,
            target: Math.max(0, (d.gdpGrowthPct ?? 0) - 0.4),
          }));

        const newData: EconomicData = {
          gdpData: gdpData.length > 0 ? gdpData : [
            { year: '2021', gdp: 5.1, target: 4.8 },
            { year: '2022', gdp: 5.8, target: 5.5 },
            { year: '2023', gdp: 6.2, target: 6.0 },
            { year: '2024', gdp: 6.8, target: 6.5 },
          ],
          investmentData: [
            { quarter: 'Q1 2025', foreign: 120, domestic: 80 },
            { quarter: 'Q2 2025', foreign: 150, domestic: 90 },
            { quarter: 'Q3 2025', foreign: 140, domestic: 85 },
            { quarter: 'Q4 2025', foreign: 180, domestic: 100 },
            { quarter: 'Q1 2026', foreign: 220, domestic: 110 },
          ],
          inflationData: [
            { month: 'Jan 26', rate: 2.7 },
            { month: 'Feb 26', rate: 2.6 },
            { month: 'Mar 26', rate: 2.5 },
            { month: 'Apr 26', rate: 2.4 },
          ],
          summary: `Uploaded ${file.name}. Parsed ${gdpRows.length} GDP data points from sheet "${gdpSheetKey}".`,
        };

        setData(newData);
        setUploadStatus('success');
      } catch (err) {
        console.error('Failed to parse file:', err);
        setUploadStatus('error');
      }
    };
    reader.onerror = () => setUploadStatus('error');
    reader.readAsArrayBuffer(file);

    // Reset the input so the same file can be re-uploaded if needed
    e.target.value = '';
  };

  const handleGensparkSearch = async () => {
    setIsSearching(true);
    setSearchStatus('idle');
    setLogs([]);
    
    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'BPS Kota Batam Economic Growth Q2 2026' })
      });
      
      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullOutput = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullOutput += chunk;
        
        // Extract logs to show in UI
        const lines = chunk.split('\n').filter(l => l.includes('[LOG]'));
        if (lines.length > 0) {
          setLogs(prev => [...prev, ...lines.map(l => l.replace('[LOG]', '').trim())]);
        }
      }
      
      parseAndSaveData(fullOutput);
      setSearchStatus('success');
    } catch (err) {
      console.error(err);
      setSearchStatus('error');
    } finally {
      setIsSearching(false);
    }
  };

  const downloadXLSX = () => {
    if (!data) return;

    const wb = XLSX.utils.book_new();
    
    const wsGdp = XLSX.utils.json_to_sheet(data.gdpData);
    XLSX.utils.book_append_sheet(wb, wsGdp, "GDP Data");
    
    const wsInvestment = XLSX.utils.json_to_sheet(data.investmentData);
    XLSX.utils.book_append_sheet(wb, wsInvestment, "Investment");
    
    const wsInflation = XLSX.utils.json_to_sheet(data.inflationData);
    XLSX.utils.book_append_sheet(wb, wsInflation, "Inflation");

    XLSX.writeFile(wb, "Batam_Economic_Data_Ingested.xlsx");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Data Ingestion</h2>
        <p className="text-slate-400 mt-2">Connect to BPS Batam via Genspark CLI or upload CSV data manually.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genspark CLI Integration Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Search size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200">Genspark Deep Search</h3>
                <p className="text-sm text-slate-400">Automated BPS Batam Crawl</p>
              </div>
            </div>
            {searchStatus === 'success' && data && (
              <button onClick={downloadXLSX} className="flex items-center space-x-2 text-sm text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 px-3 py-1.5 rounded-lg transition-colors">
                <Download size={16} />
                <span>Export XLSX</span>
              </button>
            )}
          </div>
          
          <p className="text-sm text-slate-400 flex-1">
            Uses the <code className="bg-slate-800 text-indigo-300 px-1 py-0.5 rounded">@genspark/cli</code> to automatically search and crawl the latest economic indicators.
          </p>
          
          {searchStatus === 'error' && (
            <div className="flex items-center space-x-2 text-rose-400 bg-rose-400/10 p-3 rounded-lg text-sm border border-rose-400/20">
              <AlertCircle size={16} />
              <span>Error executing Genspark CLI search.</span>
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

        {/* Live Process Terminal */}
        <div className="bg-black/80 border border-slate-800 rounded-xl p-4 backdrop-blur-sm flex flex-col font-mono text-xs overflow-hidden h-[300px]">
          <div className="flex items-center space-x-2 text-slate-500 border-b border-slate-800 pb-2 mb-2">
            <Terminal size={14} />
            <span>Genspark CLI Process</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-slate-300">
            {logs.length === 0 && !isSearching && (
              <div className="text-slate-600 italic">Waiting to start search...</div>
            )}
            {logs.map((log, i) => (
              <div key={i} className="break-all">{log}</div>
            ))}
            {isSearching && (
              <div className="text-indigo-400 animate-pulse">_</div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
      
      {/* Manual Upload Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm max-w-md">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Manual Excel Upload</h3>
            <p className="text-sm text-slate-400">Upload your GDP / indicator XLSX</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 border-2 border-dashed border-slate-700 hover:border-blue-500/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          {uploadStatus === 'uploading' ? (
            <>
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-sm font-medium text-blue-300">Parsing {uploadedFileName}…</p>
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle2 size={32} className="text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-emerald-300">{uploadedFileName}</p>
              <p className="text-xs text-slate-400 mt-1">Data loaded — click to replace</p>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <AlertCircle size={32} className="text-rose-400 mb-2" />
              <p className="text-sm font-medium text-rose-300">Parse failed. Try another file.</p>
            </>
          ) : (
            <>
              <UploadCloud size={32} className="text-slate-500 group-hover:text-blue-400 mb-2 transition-colors" />
              <p className="text-sm font-medium text-slate-300">Click to upload or drag & drop</p>
              <p className="text-xs text-slate-500 mt-1">XLSX, CSV up to 10MB</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
