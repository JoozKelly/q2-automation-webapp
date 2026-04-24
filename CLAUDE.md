# VANTAGE — Batam FTZ Economic Intelligence Platform

> Automates quarterly economic reporting for Batam Free Trade Zone tenants.
> Replaces manual Excel charting and PPT design with an AI-powered web application.

## Project Goals

1. Ingest live economic data (Genspark search, CSV/Excel/PDF upload, or manual paste)
2. Visualise GDP, FDI, inflation, macroeconomic signals, infrastructure, sectors, and news
3. AI-generate structured narratives (Storyline Planner → Report Builder)
4. Export a styled PDF report and multi-sheet Excel workbook

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 App Router, Turbopack |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`), globals.css CSS variables |
| Charts | Recharts v3 — always fixed pixel `width`/`height` (no ResponsiveContainer) |
| State | Zustand v5 with persist middleware |
| AI | Anthropic `claude-sonnet-4-6` via `@anthropic-ai/sdk` |
| Web scraping | Genspark CLI: `npx @genspark/cli search <query> --output json` |
| PDF | react-to-pdf (`usePDF`), hidden div at `position: fixed; left: -9999px; width: 794px` |
| Excel | SheetJS (`xlsx`) multi-sheet workbook |
| Images | Unsplash Source API (no auth): `https://source.unsplash.com/featured/800x400/?{keyword}` |

## Key Files

| File | Purpose |
|---|---|
| `src/app/api/ingest/route.ts` | BPS/general data fetch + Claude synthesis |
| `src/app/api/news/route.ts` | News fetch + Unsplash imageUrl injection |
| `src/app/api/ceo-brief/route.ts` | Storyline/narrative generation |
| `src/app/api/analyze-files/route.ts` | Document upload → Claude analysis |
| `src/store/reportStore.ts` | Central Zustand store (dashboard data, narratives) |
| `src/store/sessionStore.ts` | Session save/load/delete |
| `src/store/uiStateStore.ts` | UI persistence (active tab, queries, prevReportText) |
| `src/context/store.ts` | `useDataStore` (raw economic data + chart series) |
| `src/types/report.ts` | All TypeScript interfaces |
| `src/components/charts/` | Chart components |
| `src/components/pdf/ReportPDFContent.tsx` | Full PDF layout with all charts |

## Streaming Protocol

All API routes stream line-prefixed text:
- `[LOG] text` — progress update shown in terminal pane
- `[WARN] text` — non-fatal warning
- `[PAYLOAD] {json}` — main data (parsed client-side)
- `[ERROR] text` — failure
- `[DONE]` — stream end

## JSON Parsing Rules

**Always** use `repairAndParse`/`repairAndParseArray` + the brace/bracket-counting largest-candidate extractor.
Never trust raw LLM output as valid JSON. The extractor skips code fences; the repair removes trailing commas, unquoted keys, and JS comments.

## Data Confidence

`dashboardStats.dataConfidence`:
- `'verified'` — Genspark returned real web data (shown as green "Live data" badge)
- `'ai_estimated'` — no web data found (shown as amber "AI estimated" badge + warning banner)

## Color Palette (VANTAGE Brand — Sky/Cyan Theme)

CSS variables defined in `src/app/globals.css`:
```
--bg: #010b18          (deep space base)
--surface-2: #071a2e   (card surface)
--accent: #0ea5e9      (sky-500 primary)
--text-1: #f0f6ff
```
Components use these variables and Tailwind sky-* classes for accent colours.
Do not hardcode indigo colours — that palette was replaced.

## Workflow Rules

- **Git:** Commit and push after every significant feature. Clear, descriptive messages.
- **TypeScript:** Run `npx tsc --noEmit` before committing. Zero errors required.
- **No comments** unless the WHY is non-obvious.
- **Charts in PDF:** Fixed pixel dimensions only inside the hidden 794px div.
- **No indigo accent** — use sky-500/sky-400/sky-300 or `--accent` CSS variable.

## ⚠️ Deployment Notes

The `spawn('npx', ['@genspark/cli', ...])` calls **will NOT work** on Vercel serverless (no shell).

Options:
1. **VPS + PM2 (recommended):** `next build && next start`, Nginx reverse proxy, PM2 process manager. Genspark CLI works natively.
2. **Vercel:** Must replace Genspark spawn with Claude's `web_search` tool (`anthropic-beta: web-search-2025-03-05`).
3. **Railway/Render:** Supports long-running Node processes; Genspark CLI works.
4. **Docker:** `FROM node:22-alpine`, `RUN npm ci`, `CMD next start`. Deploy to any VPS.

Required env var: `ANTHROPIC_API_KEY`

## Reference Materials

- Previous Q1 reports: `c:\Users\joozk\OneDrive\Desktop\devfolio\Q1EXPREPORT\`
- Q2 flow PDF: `c:\Users\joozk\OneDrive\Desktop\devfolio\BATAMOUTLOK_Q22026 FLOW.pdf`
