import * as XLSX from 'xlsx';
import type { GDPDataPoint, ParsedWorkbook, RawSheetData, TrendSignal } from '@/types/report';

export function parseWorkbook(buffer: ArrayBuffer): ParsedWorkbook {
  const wb = XLSX.read(buffer, { type: 'array' });
  const result: ParsedWorkbook = {};
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    result[sheetName] = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: null,
    });
  }
  return result;
}

export function parseCSV(text: string): RawSheetData {
  const wb = XLSX.read(text, { type: 'string' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });
}

export function parseGDPSheet(rows: RawSheetData): GDPDataPoint[] {
  const result: GDPDataPoint[] = [];
  for (const row of rows) {
    const year = toNum(
      row['Year'] ?? row['year'] ?? row['Tahun'] ?? row['YEAR']
    );
    if (!year || isNaN(year)) continue;
    result.push({
      year,
      gdpTrillionIDR: toNum(
        row['GDP (Triliun IDR)'] ??
          row['GDP'] ??
          row['gdp'] ??
          row['PDRB (Miliar)'] ??
          row['PDRB']
      ),
      gdpGrowthPct: toNum(
        row['Growth (%)'] ??
          row['growth_pct'] ??
          row['Growth Rate'] ??
          row['Pertumbuhan (%)'] ??
          row['Laju Pertumbuhan']
      ),
      gdpPerCapitaUSD: toNum(
        row['GDP per Capita (USD)'] ??
          row['gdp_per_capita'] ??
          row['PDRB Per Kapita']
      ),
    });
  }
  return result;
}

export function detectGDPSheet(wb: ParsedWorkbook): string | null {
  const keywords = ['gdp', 'pdrb', 'macro', 'ekonomi', 'growth'];
  for (const name of Object.keys(wb)) {
    if (keywords.some((kw) => name.toLowerCase().includes(kw))) return name;
  }
  return Object.keys(wb)[0] ?? null;
}

export function signalFromDelta(current: number, previous: number, threshold = 0.005): TrendSignal {
  if (previous === 0) return 'stable';
  const delta = (current - previous) / Math.abs(previous);
  if (delta > threshold) return 'improving';
  if (delta < -threshold) return 'declining';
  return 'stable';
}

function toNum(val: unknown): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  const n = Number(String(val).replace(/,/g, ''));
  return isNaN(n) ? undefined : n;
}
