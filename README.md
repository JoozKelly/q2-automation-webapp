# VANTAGE — Batam FTZ Economic Intelligence Platform

> Automate your quarterly economic reporting. From raw data to boardroom-ready insights in minutes.

VANTAGE is a web application that replaces manual Excel charting and PowerPoint design for Batam Free Trade Zone (FTZ) quarterly economic reporting. It ingests documents and live web data, synthesises insights with Claude AI, and produces publication-ready analysis for tenants, investors, and government stakeholders.

---

## What it does

```
Raw Data  →  AI Ingestion  →  Live Dashboard  →  Report Builder  →  PDF Export
(BPS, PDFs,    (Claude +        (charts, KPIs,     (AI-generated     (structured
 news, XLSX)    Genspark)        macro grid)         narratives)       PDF)
```

**1. Data Ingestion** — upload PDFs, Excel files, and images, or trigger a live Genspark web search targeting BPS Batam statistics and regional news sources. Claude extracts structured economic data automatically.

**2. Dashboard** — KPI cards (GDP growth, FDI inflow, inflation rate, active projects), a 10-quarter macro indicator signal grid, GDP historical trend, investment inflows, and a live news feed — all populated from your ingested data.

**3. Storyline Planner** — plan your Q3 narrative arc with AI-generated chapter structures (angle, key message, talking points). Each chapter feeds directly into the Report Builder.

**4. Report Builder** — generate section-by-section narrative prose using Claude. Each section is aware of the storyline chapters you planned. Export the complete report as a PDF.

---

## Demo

### Step 1 — Ingest data
Navigate to **Data Ingestion**. Choose one of three sources:

| Source | What it does |
|--------|-------------|
| **Document Analysis** | Upload BPS PDFs, XLSX tables, or chart images. Claude reads them and extracts GDP, FDI, inflation, sector, and infrastructure data. |
| **BPS Search** | Runs Genspark web searches targeting BPS Batam (bps.go.id) statistics pages. Claude synthesises the search results into structured indicators. Retries across 5 different query strategies until live data is found. |
| **News Intelligence** | Fetches the latest Batam FTZ news from Reuters, Jakarta Post, Straits Times, Business Times, and Antara. Results are displayed in a newspaper-style layout with featured article and category-coloured cards. |

After any ingestion, a **Data Preview** shows your key indicators instantly. A **Section Selector** lets you choose exactly which data to push to the dashboard — you stay in control.

### Step 2 — Review the Dashboard
The dashboard populates with live data:
- **KPI row**: GDP growth %, FDI inflow ($M), inflation rate, active project count
- **Macro Indicator Grid**: 10-quarter signal view across GDP, Trade, Industrial Activity, Labour, Inflation, Currency, Interest Rates, and Capital Flow
- **Charts**: GDP vs target (line), investment inflows by quarter (stacked area), monthly inflation (bar)
- **News feed**: live scraped articles displayed in a news-website layout

### Step 3 — Plan the Q3 Storyline
Go to **Storyline Planner**. Enter a brief context (e.g. "Batam FTZ Q3 2026 quarterly brief for tenant CEOs") and generate a structured narrative arc. Claude returns:
- Chapter titles with angles
- Key messages per chapter
- Recommended talking points

Chapters are displayed as interactive cards and feed into the Report Builder.

### Step 4 — Build the Report
Go to **Report Builder**. Each section (Executive Summary, Macro Environment, Investment Climate, Infrastructure, Sector Analysis, Outlook) shows a **Chapter Hint** from your storyline. Click **Generate** to produce AI-written prose for each section. Click **Export PDF** when done.

### Step 5 — Save your session
Use **Save Session** in the header to name and store the entire state — all data, narratives, and charts — to localStorage. Load any saved session from the sidebar at any time.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts v3 |
| State | Zustand v5 (persisted to localStorage) |
| AI | Anthropic Claude (`claude-sonnet-4-6`) via `@anthropic-ai/sdk` |
| Web search | Genspark CLI (`@genspark/cli`) |
| File parsing | SheetJS (`xlsx`) for Excel/CSV |
| PDF export | `react-to-pdf` |
| Streaming | Native ReadableStream with `[LOG]` / `[PAYLOAD]` / `[DONE]` markers |

---

## Getting Started

### Prerequisites
- Node.js 18+
- An Anthropic API key

### Install

```bash
git clone https://github.com/JoozKelly/q2-automation-webapp
cd q2-automation-webapp
npm install
```

### Configure

Create a `.env.local` file:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── ingestion/page.tsx    # Data ingestion (Documents · BPS · News)
│   ├── ceo-brief/page.tsx    # Q3 Storyline Planner
│   ├── report-builder/page.tsx
│   ├── api/
│   │   ├── ingest/route.ts   # BPS search + Claude synthesis (streaming)
│   │   ├── news/route.ts     # News scraping + structuring (streaming)
│   │   ├── analyze-files/    # Multimodal file analysis
│   │   └── generate-section/ # Section narrative generation
│   ├── globals.css           # Design tokens, animations
│   └── layout.tsx
├── components/
│   ├── ui/
│   │   ├── Sidebar.tsx       # Nav + sessions panel
│   │   └── Header.tsx        # Page title + save session
│   └── charts/
│       ├── MacroIndicatorGrid.tsx
│       └── GDPHistoricalChart.tsx
├── store/
│   ├── reportStore.ts        # Structured data (KPIs, charts, news)
│   └── sessionStore.ts       # Named session save/load
└── context/
    └── store.ts              # Time-series chart data (Zustand)
```

---

## Key Design Decisions

**JSON parsing robustness** — Claude occasionally generates JSON with trailing commas, unquoted keys, or code fences. The API routes use a brace-counting extractor that collects all candidate `{...}` objects and returns the largest one (avoiding inline examples Claude may write before the real payload), followed by a repair pass that strips comments, fixes trailing commas, and quotes bare keys.

**Sequential scraping retry** — If the first Genspark query returns no results, the route automatically tries the next query in a list of 5 strategies (BPS-targeted → general → fallback). Claude is used as a last resort when all web searches fail.

**Section selector** — Rather than blindly overwriting the dashboard on every ingest, users see a preview of what was found and choose which sections to apply. This prevents accidental overwrites when experimenting with different data sources.

**Session persistence** — All dashboard data, narratives, and news items are stored in a named session (max 20) persisted to localStorage via Zustand's `persist` middleware.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |

---

## License

MIT
