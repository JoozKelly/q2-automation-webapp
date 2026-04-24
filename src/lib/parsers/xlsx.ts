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

export function detectGDPSheet(wb: ParsedWorkbook): string | null {
  const keywords = ['gdp', 'pdrb', 'macro', 'ekonomi', 'growth', 'produk'];
  for (const name of Object.keys(wb)) {
    if (keywords.some((kw) => name.toLowerCase().includes(kw))) return name;
  }
  // Fallback: first sheet with the most rows
  let best: string | null = null;
  let bestLen = 0;
  for (const [name, rows] of Object.entries(wb)) {
    if (rows.length > bestLen) { best = name; bestLen = rows.length; }
  }
  return best;
}

export function parseGDPSheet(rows: RawSheetData): GDPDataPoint[] {
  if (rows.length === 0) return [];

  const keys = Object.keys(rows[0]);

  // Auto-detect columns by inspecting values
  const yearKey   = detectYearKey(rows, keys);
  const growthKey = yearKey ? detectGrowthKey(rows, keys, yearKey) : null;
  const gdpKey    = yearKey ? detectGDPValueKey(rows, keys, yearKey, growthKey) : null;

  if (!yearKey) return [];

  const result: GDPDataPoint[] = [];
  for (const row of rows) {
    const year = toNum(row[yearKey]);
    if (!year || year < 1900 || year > 2100) continue;
    result.push({
      year,
      gdpTrillionIDR: gdpKey   ? toNum(row[gdpKey])    : undefined,
      gdpGrowthPct:   growthKey ? toNum(row[growthKey]) : undefined,
    });
  }
  return result.sort((a, b) => a.year - b.year);
}

// ─── Auto-detection helpers ────────────────────────────────────────────────

function detectYearKey(rows: RawSheetData, keys: string[]): string | null {
  // First check well-known names
  const known = ['Year', 'year', 'Tahun', 'YEAR', 'tahun', 'TAHUN', 'Yr', 'yr'];
  for (const k of known) {
    if (keys.includes(k)) {
      const sample = rows.slice(0, 5).map((r) => toNum(r[k]));
      if (sample.some((v) => v !== undefined && v >= 1950 && v <= 2030)) return k;
    }
  }
  // Then scan all keys for year-range values
  for (const k of keys) {
    const vals = rows.slice(0, 10).map((r) => toNum(r[k])).filter((v): v is number => v !== undefined);
    if (vals.length > 0 && vals.every((v) => v >= 1950 && v <= 2030)) return k;
  }
  return null;
}

function detectGrowthKey(rows: RawSheetData, keys: string[], yearKey: string): string | null {
  // Well-known names
  const known = [
    'Growth (%)', 'growth_pct', 'Growth Rate', 'Growth', 'growth',
    'Pertumbuhan (%)', 'Laju Pertumbuhan', 'Pertumbuhan', 'pertumbuhan',
    'GDP Growth', 'GRDP Growth', 'Growths',
  ];
  for (const k of known) {
    if (keys.includes(k) && k !== yearKey) {
      const vals = rows.slice(0, 5).map((r) => toNum(r[k])).filter((v): v is number => v !== undefined);
      if (vals.some((v) => v >= -30 && v <= 30)) return k;
    }
  }
  // Scan: small numeric values that look like percentages (-30..30)
  for (const k of keys) {
    if (k === yearKey) continue;
    const vals = rows.slice(0, 20).map((r) => toNum(r[k])).filter((v): v is number => v !== undefined);
    if (vals.length > 3 && vals.every((v) => v >= -30 && v <= 30)) return k;
  }
  return null;
}

function detectGDPValueKey(
  rows: RawSheetData,
  keys: string[],
  yearKey: string,
  growthKey: string | null
): string | null {
  const known = [
    'GDP (Triliun IDR)', 'GDP', 'gdp', 'PDRB (Miliar)', 'PDRB', 'pdrb',
    'GDP Value', 'GRDP', 'grdp', 'Nilai PDRB', 'Total PDRB',
  ];
  for (const k of known) {
    if (keys.includes(k) && k !== yearKey && k !== growthKey) {
      const vals = rows.slice(0, 5).map((r) => toNum(r[k])).filter((v): v is number => v !== undefined);
      if (vals.length > 0) return k;
    }
  }
  // Largest numeric values that aren't the year or growth column
  let best: string | null = null;
  let bestMax = 0;
  for (const k of keys) {
    if (k === yearKey || k === growthKey) continue;
    const vals = rows.slice(0, 10).map((r) => toNum(r[k])).filter((v): v is number => v !== undefined);
    const max = Math.max(...vals);
    if (max > bestMax) { bestMax = max; best = k; }
  }
  return best;
}

// ─── Utilities ─────────────────────────────────────────────────────────────

function toNum(val: unknown): number | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  const n = Number(String(val).replace(/,/g, '').trim());
  return isNaN(n) ? undefined : n;
}

export function signalFromDelta(current: number, previous: number, threshold = 0.005): TrendSignal {
  if (previous === 0) return 'stable';
  const delta = (current - previous) / Math.abs(previous);
  if (delta > threshold) return 'improving';
  if (delta < -threshold) return 'declining';
  return 'stable';
}
