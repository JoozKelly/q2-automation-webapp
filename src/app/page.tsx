"use client";

import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const gdpData = [
  { year: '2020', gdp: 4.5, target: 5.0 },
  { year: '2021', gdp: 5.1, target: 5.2 },
  { year: '2022', gdp: 5.8, target: 5.5 },
  { year: '2023', gdp: 6.2, target: 6.0 },
  { year: '2024', gdp: 6.8, target: 6.5 },
  { year: '2025', gdp: 7.0, target: 6.8 },
  { year: '2026', gdp: 7.2, target: 7.0 },
];

const investmentData = [
  { quarter: 'Q1 2025', foreign: 120, domestic: 80 },
  { quarter: 'Q2 2025', foreign: 150, domestic: 90 },
  { quarter: 'Q3 2025', foreign: 140, domestic: 85 },
  { quarter: 'Q4 2025', foreign: 180, domestic: 100 },
  { quarter: 'Q1 2026', foreign: 220, domestic: 110 },
];

const inflationData = [
  { month: 'Oct 25', rate: 2.8 },
  { month: 'Nov 25', rate: 2.9 },
  { month: 'Dec 25', rate: 3.1 },
  { month: 'Jan 26', rate: 2.7 },
  { month: 'Feb 26', rate: 2.6 },
  { month: 'Mar 26', rate: 2.5 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Current GDP Growth" value="7.2%" change="+0.4%" isPositive={true} />
        <MetricCard title="Foreign Investment" value="$220M" change="+22.2%" isPositive={true} subtitle="Luxshare & Apple.inc Expansion" />
        <MetricCard title="Inflation Rate" value="2.5%" change="-0.1%" isPositive={true} subtitle="Stabilizing below 3%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GDP Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">GDP Growth vs Target (%)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gdpData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Line type="monotone" dataKey="gdp" name="Actual GDP" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#475569" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment Area Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">Investment Inflows (USD Millions)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={investmentData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="quarter" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Area type="monotone" dataKey="foreign" name="Foreign (FDI)" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="domestic" name="Domestic (DDI)" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflation Bar Chart */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">Monthly Inflation Rate (%)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inflationData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                />
                <Bar dataKey="rate" name="Inflation" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* AI Storyline Summary */}
        <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center space-x-2">
            <span>✨ AI Generated Storyline (Q2)</span>
          </h3>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed relative z-10">
            <p>
              <strong className="text-slate-100">Macroeconomic Stability:</strong> Batam continues to demonstrate robust economic resilience, exceeding the 7.0% GDP growth target. Inflation has stabilized at 2.5%, creating a favorable environment for industrial expansion.
            </p>
            <p>
              <strong className="text-slate-100">Investment Surge:</strong> The $200 million investment commitment from Apple Inc. and Luxshare for AirTag manufacturing has driven foreign direct investment up by 22.2% quarter-over-quarter, signaling strong confidence in the region's high-tech manufacturing capabilities.
            </p>
            <p>
              <strong className="text-slate-100">Future Outlook:</strong> We anticipate sustained momentum into Q3, supported by stable domestic consumption and ongoing infrastructure enhancements in key industrial parks.
            </p>
          </div>
          <div className="mt-6">
            <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors">
              <span>View Full Generated Copy</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, isPositive, subtitle }: { title: string, value: string, change: string, isPositive: boolean, subtitle?: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-between group hover:border-slate-700 transition-colors">
      <div>
        <h4 className="text-slate-400 font-medium text-sm mb-1">{title}</h4>
        <div className="flex items-end space-x-3">
          <span className="text-3xl font-bold text-slate-100">{value}</span>
          <span className={`text-sm font-medium mb-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {change}
          </span>
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-800/50 line-clamp-1 group-hover:text-slate-400 transition-colors">
          {subtitle}
        </p>
      )}
    </div>
  );
}
