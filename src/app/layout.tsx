import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutDashboard, FileSpreadsheet, FileText, Settings, Download } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quarterly Economic Report Automation",
  description: "Automated end-to-end report generation for Batam Tenants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased min-h-screen flex`}>
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col fixed h-full z-10">
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              ReportAuto Q2
            </h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <a href="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </a>
            <a href="/ingestion" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors">
              <FileSpreadsheet size={20} />
              <span>Data Ingestion</span>
            </a>
            <a href="/report-builder" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors">
              <FileText size={20} />
              <span>Report Builder</span>
            </a>
          </nav>

          <div className="p-4 border-t border-slate-800">
            <a href="#" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors">
              <Settings size={20} />
              <span>Settings</span>
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
          <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
            <h2 className="text-xl font-semibold text-slate-200">Batam Economic Overview</h2>
            <button className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Download size={16} />
              <span>Export PDF</span>
            </button>
          </header>
          <div className="p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
