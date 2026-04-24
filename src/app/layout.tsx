import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: 'VANTAGE', template: '%s — VANTAGE' },
  description: 'Economic intelligence platform for Batam Free Trade Zone. AI-powered data ingestion, analysis and report generation.',
  keywords: ['Batam', 'FTZ', 'economic intelligence', 'report automation', 'Indonesia', 'investment'],
  authors: [{ name: 'VANTAGE Intelligence' }],
  openGraph: {
    title: 'VANTAGE — Batam FTZ Intelligence',
    description: 'Economic intelligence platform for Batam Free Trade Zone.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VANTAGE — Batam FTZ Intelligence',
    description: 'Economic intelligence platform for Batam Free Trade Zone.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} antialiased min-h-screen flex`}
        style={{ background: '#020917', color: '#f1f5f9' }}
      >
        <Sidebar />

        <main className="flex-1 ml-64 min-h-screen overflow-x-hidden flex flex-col">
          <Header />
          <div className="flex-1 p-8 page-animate">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
