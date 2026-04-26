export type TrendSignal = 'improving' | 'stable' | 'declining';
export type TenantRisk = 'neutral' | 'risk' | 'red';
export type MacroCategory = 'macro_economic' | 'financial';

export interface IndicatorPeriod {
  period: string;
  signal: TrendSignal;
  value?: number;
  unit?: string;
  notes?: string;
}

export interface MacroIndicator {
  category: MacroCategory;
  name: string;
  periods: IndicatorPeriod[];
}

export type InfraType = 'road' | 'power' | 'water' | 'connectivity' | 'fleet' | 'policies';

export interface InfraProject {
  id: string;
  type: InfraType;
  name: string;
  progress: number;
  status: 'planned' | 'in_progress' | 'completed';
  notes?: string;
}

export interface GeoEventImpact {
  fdi: TrendSignal;
  gdp: TrendSignal;
  tenantRisk: TenantRisk;
}

export interface GeoEvent {
  id: string;
  title: string;
  description: string;
  source?: string;
  sourceUrl?: string;
  impact: GeoEventImpact;
}

export type SectorType =
  | 'solar'
  | 'data_center'
  | 'bess'
  | 'medical'
  | 'ems'
  | 'e_cigarette'
  | 'other';

export type BatamLocation = 'west' | 'north' | 'south' | 'east' | 'offshore';

export interface SectorProject {
  id: string;
  sector: SectorType;
  company: string;
  location: BatamLocation;
  description: string;
  status: string;
  isNew?: boolean;
}

export interface GDPDataPoint {
  year: number;
  quarter?: number;
  gdpTrillionIDR?: number;
  gdpGrowthPct?: number;
  gdpPerCapitaUSD?: number;
}

export interface ReportNarratives {
  macro?: string;
  infra?: string;
  geo?: string;
  sector?: string;
  outlook?: string;
}

export interface ReportData {
  period: string;
  generatedAt?: string;
  macroIndicators: MacroIndicator[];
  gdpHistorical: GDPDataPoint[];
  infraProjects: InfraProject[];
  geoEvents: GeoEvent[];
  sectorProjects: SectorProject[];
  narratives: ReportNarratives;
}

export type RawSheetData = Record<string, unknown>[];
export type ParsedWorkbook = Record<string, RawSheetData>;

// ─── Dynamic data types (populated by ingest / upload) ────────────────────

export interface SectorSummary {
  sector: string;
  radarLabel: string;
  projectCount: number;
  highlight: string;
}

export interface MacroGridRow {
  name: string;
  signals: TrendSignal[];
}

export interface MacroGridGroup {
  category: string;
  indicators: MacroGridRow[];
}

export interface DashboardStats {
  gdpGrowthPct: number;
  gdpGrowthChange: string;
  fdiInflow: string;
  fdiChange: string;
  inflationRate: number;
  inflationChange: string;
  totalProjects: number;
  period: string;
  lastUpdated: string;
  dataSource: 'genspark' | 'upload' | 'manual';
  dataConfidence?: 'verified' | 'ai_estimated';
  dataWarnings?: string[];
}

export type NewsCategory =
  | 'fdi'
  | 'infrastructure'
  | 'policy'
  | 'sector'
  | 'geopolitics'
  | 'economy';

export type NewsRelevance = 'high' | 'medium' | 'low';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  category: NewsCategory;
  relevance: NewsRelevance;
  imageUrl?: string;
  sourceUrl?: string;
}

export interface LabourStats {
  totalWorkers: number;
  unemploymentRate: number;
  newJobsCreated: number;
  wageGrowthPct: number;
  topEmployers: string[];
}

export interface TradeStats {
  totalExportsUSD: string;
  totalImportsUSD: string;
  tradeBalance: string;
  topExportProducts: string[];
  topImportOrigins: string[];
  yoyExportGrowth: string;
}
