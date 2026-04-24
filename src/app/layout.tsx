import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Download } from "lucide-react";
import Sidebar from "@/components/ui/Sidebar";

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
        <Sidebar />

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
