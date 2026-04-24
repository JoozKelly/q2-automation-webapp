import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReportAuto Q2 — Batam FTZ",
  description: "Automated end-to-end report generation for Batam Tenants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen flex`} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
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
