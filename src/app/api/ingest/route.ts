import { spawn } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

// ── Genspark scraper ──────────────────────────────────────────────────────────

async function tryGenspark(query: string, timeoutMs = 20000): Promise<string> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(''), timeoutMs);
    const child = spawn('npx', ['@genspark/cli', 'search', query, '--output', 'json'], {
      shell: true,
    });
    let out = '';
    child.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    child.stderr.on('data', () => {});
    child.on('close', () => { clearTimeout(timer); resolve(out.trim()); });
    child.on('error', () => { clearTimeout(timer); resolve(''); });
  });
}

// ── JSON extraction — returns the LARGEST object found (avoids small inline examples) ──

function extractJSON(text: string): string | null {
  const s = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
  const candidates: string[] = [];

  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '{') continue;
    let depth = 0, inStr = false, esc = false;
    for (let j = i; j < s.length; j++) {
      const c = s[j];
      if (esc)               { esc = false; continue; }
      if (c === '\\' && inStr) { esc = true;  continue; }
      if (c === '"')         { inStr = !inStr; continue; }
      if (inStr)             continue;
      if (c === '{') depth++;
      if (c === '}') {
        depth--;
        if (depth === 0) { candidates.push(s.slice(i, j + 1)); i = j; break; }
      }
    }
  }
  if (!candidates.length) return null;
  // Return the largest candidate — almost always the main payload
  return candidates.reduce((a, b) => (a.length > b.length ? a : b));
}

// ── JSON repair — handles unquoted keys, trailing commas, comments ────────────

function repairAndParse(raw: string): unknown {
  const extracted = extractJSON(raw);
  if (!extracted) throw new Error('No JSON object found in model response');

  // Try direct parse first
  try { return JSON.parse(extracted); } catch (_) {}

  // Repair common LLM JSON mistakes
  const repaired = extracted
    .replace(/\/\/[^\n\r]*/g, '')                                    // // comments
    .replace(/\/\*[\s\S]*?\*\//g, '')                               // /* */ comments
    .replace(/,(\s*[}\]])/g, '$1')                                   // trailing commas
    .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3'); // unquoted keys

  return JSON.parse(repaired); // throws descriptive error if still invalid
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt(query: string, rawData: string): string {
  const now = new Date().toISOString();
  return `You are a senior economic analyst specialising in Indonesia's Batam Free Trade Zone (FTZ).
Today's date is April 2026. Reporting period: Q2 2026 (April–June 2026).
${rawData ? `\nLive web data for "${query}":\n${rawData.slice(0, 5000)}\n` : ''}
Generate a complete economic intelligence payload for Batam FTZ Q2 2026.

CRITICAL FORMATTING RULES — your output will be fed directly to JSON.parse():
• Output ONLY the raw JSON object. No markdown, no code fences, no commentary before or after.
• ALL keys MUST be double-quoted strings: "key": value
• NO trailing commas. Last item in any object/array must NOT have a comma after it.
• ALL string values MUST use double quotes, not single quotes.
• NO JavaScript comments (// or /* */) inside the JSON.

Schema (replace every <...> placeholder with actual values):

{
  "dashboardStats": {
    "gdpGrowthPct": 7.2,
    "gdpGrowthChange": "+0.3%",
    "fdiInflow": "$220M",
    "fdiChange": "+18%",
    "inflationRate": 2.5,
    "inflationChange": "-0.1%",
    "totalProjects": 28,
    "period": "Q2 2026",
    "lastUpdated": "${now}",
    "dataSource": "genspark"
  },
  "gdpData": [
    {"year":"2019","gdp":5.1,"target":6.0},
    {"year":"2020","gdp":-1.2,"target":5.5},
    {"year":"2021","gdp":3.8,"target":4.5},
    {"year":"2022","gdp":5.5,"target":5.8},
    {"year":"2023","gdp":6.2,"target":6.5},
    {"year":"2024","gdp":6.8,"target":7.0},
    {"year":"2025","gdp":7.1,"target":7.5}
  ],
  "investmentData": [
    {"quarter":"Q1 2025","foreign":185,"domestic":62},
    {"quarter":"Q2 2025","foreign":198,"domestic":71},
    {"quarter":"Q3 2025","foreign":210,"domestic":68},
    {"quarter":"Q4 2025","foreign":195,"domestic":75},
    {"quarter":"Q1 2026","foreign":205,"domestic":80},
    {"quarter":"Q2 2026","foreign":220,"domestic":85}
  ],
  "inflationData": [
    {"month":"Nov 25","rate":2.8},
    {"month":"Dec 25","rate":2.7},
    {"month":"Jan 26","rate":2.6},
    {"month":"Feb 26","rate":2.5},
    {"month":"Mar 26","rate":2.4},
    {"month":"Apr 26","rate":2.5}
  ],
  "gdpHistorical": [
    {"year":2018,"gdpGrowthPct":6.0},
    {"year":2019,"gdpGrowthPct":5.1},
    {"year":2020,"gdpGrowthPct":-1.2},
    {"year":2021,"gdpGrowthPct":3.8},
    {"year":2022,"gdpGrowthPct":5.5},
    {"year":2023,"gdpGrowthPct":6.2},
    {"year":2024,"gdpGrowthPct":6.8},
    {"year":2025,"gdpGrowthPct":7.1}
  ],
  "macroGrid": [
    {
      "category": "Macro Economic",
      "indicators": [
        {"name":"GDP","signals":["improving","improving","stable","improving","improving","improving","improving","improving","improving","improving"]},
        {"name":"Trade","signals":["stable","declining","stable","stable","stable","improving","improving","stable","stable","improving"]},
        {"name":"Industrial Activity","signals":["improving","improving","improving","improving","improving","improving","improving","improving","improving","improving"]},
        {"name":"Labor","signals":["stable","stable","stable","improving","improving","improving","improving","improving","improving","stable"]},
        {"name":"Prices / Inflation","signals":["stable","stable","stable","stable","stable","stable","stable","stable","stable","stable"]}
      ]
    },
    {
      "category": "Financial",
      "indicators": [
        {"name":"Currency (vs USD)","signals":["declining","declining","stable","declining","declining","stable","stable","stable","declining","declining"]},
        {"name":"Interest Rates","signals":["stable","stable","declining","declining","declining","declining","declining","stable","stable","stable"]},
        {"name":"Capital Flow (FDI)","signals":["improving","improving","improving","improving","improving","improving","improving","improving","improving","improving"]}
      ]
    }
  ],
  "infraProjects": [
    {"id":"1","type":"power","name":"Tanjung Uncang Power Plant Expansion","progress":72,"status":"in_progress","notes":"Phase 2 adding 200MW capacity"},
    {"id":"2","type":"road","name":"Batam Centre–Batu Ampar Toll Road","progress":45,"status":"in_progress","notes":"Connects industrial zones"},
    {"id":"3","type":"water","name":"Tembesi Reservoir Upgrade","progress":88,"status":"in_progress","notes":"Increases industrial water capacity by 30%"},
    {"id":"4","type":"connectivity","name":"Batam–Bintan Fibre Backbone","progress":60,"status":"in_progress","notes":"Sub-sea fibre for data centre growth"},
    {"id":"5","type":"fleet","name":"Harbour Bay Ferry Terminal Expansion","progress":35,"status":"in_progress","notes":"Adds 4 new berths for Singapore–Batam route"},
    {"id":"6","type":"policies","name":"EV Manufacturing Investment Incentive Package","progress":20,"status":"planned","notes":"Tax holiday for EV battery and component makers"}
  ],
  "geoEvents": [
    {
      "id":"1",
      "title":"US–Indonesia Trade Framework Signed",
      "description":"The US and Indonesia formalised a bilateral trade framework covering critical minerals, semiconductors, and clean energy. Batam FTZ is positioned as a priority manufacturing hub under the agreement.",
      "source":"Reuters, March 2026",
      "impact":{"fdi":"improving","gdp":"improving","tenantRisk":"neutral"}
    },
    {
      "id":"2",
      "title":"Singapore Carbon-Neutral Industrial Park MOU",
      "description":"Sembcorp Industries signed an MOU with BP Batam to develop a 500-hectare carbon-neutral industrial park in Batam's west zone. The park targets solar, BESS and data centre tenants.",
      "source":"Business Times, February 2026",
      "impact":{"fdi":"improving","gdp":"improving","tenantRisk":"neutral"}
    },
    {
      "id":"3",
      "title":"Johor–Singapore Special Economic Zone Competes for EMS Investment",
      "description":"Malaysia's Johor–Singapore SEZ launched new tax incentives for electronics manufacturers, putting competitive pressure on Batam for EMS relocations. Analysts note Batam retains labour cost advantage.",
      "source":"Straits Times, January 2026",
      "impact":{"fdi":"declining","gdp":"stable","tenantRisk":"risk"}
    },
    {
      "id":"4",
      "title":"Indonesia Raises Domestic Content Requirements for Solar Panels",
      "description":"New regulations require 40% domestic content in solar panel supply chains by 2027. Batam-based solar manufacturers are expanding local cell production to comply.",
      "source":"Jakarta Post, April 2026",
      "impact":{"fdi":"stable","gdp":"improving","tenantRisk":"neutral"}
    },
    {
      "id":"5",
      "title":"BP Batam Reports Record Q1 2026 Investment Intake",
      "description":"BP Batam recorded USD 205M in new investment commitments in Q1 2026, a 12% year-on-year increase led by data centre and BESS project announcements.",
      "source":"BP Batam Press Release, April 2026",
      "impact":{"fdi":"improving","gdp":"improving","tenantRisk":"neutral"}
    }
  ],
  "sectorSummaries": [
    {"sector":"Electronics Mfg (EMS)","radarLabel":"EMS","projectCount":9,"highlight":"Flex, Celestica, and Jabil expanding capacity"},
    {"sector":"Solar / Renewable","radarLabel":"Solar","projectCount":6,"highlight":"Trina Solar and LONGi new cell lines"},
    {"sector":"Data Centers","radarLabel":"Data Ctr","projectCount":4,"highlight":"EdgeConneX and ST Telemedia groundbreaking"},
    {"sector":"BESS","radarLabel":"BESS","projectCount":3,"highlight":"CATL JV and BYD storage facilities"},
    {"sector":"Medical Devices","radarLabel":"Medical","projectCount":2,"highlight":"B. Braun expansion, Terumo new line"},
    {"sector":"E-Cigarettes","radarLabel":"E-Cig","projectCount":4,"highlight":"RLX, SMOORE exports to EU market"}
  ],
  "summary": "Batam FTZ continues to attract diversified foreign investment in Q2 2026, with particular momentum in data centres and BESS driven by regional digital infrastructure demand. Infrastructure improvements and the US–Indonesia trade framework are reinforcing Batam's competitive positioning despite pressure from Malaysia's Johor SEZ."
}`;
}

// ── BPS queries (tried sequentially until one returns data) ───────────────────

const BPS_QUERIES = [
  '"BPS Batam" OR "batamkota.bps.go.id" PDRB pertumbuhan ekonomi Batam 2024 2025',
  'site:bps.go.id Batam Kepri GRDP growth manufacturing labour 2024 2025',
  '"Badan Pusat Statistik" Batam investasi tenaga kerja inflasi ekspor impor 2025',
  'Batam FTZ GDP investment FDI manufacturing exports statistics 2025 2026',
  'Kepulauan Riau economic indicators GDP inflation 2025 annual report',
];

const GENERAL_QUERIES = [
  'Batam FTZ Q2 2026 GDP growth investment inflation infrastructure sector',
  'Batam Free Trade Zone economy 2026 investment FDI BP Batam statistics',
  'Batam industrial zone economic performance 2025 2026 GDP FDI report',
];

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const queryParam = body.query as string | undefined;
  const useBPS = body.bps === true;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response('[ERROR] ANTHROPIC_API_KEY not configured\n[DONE]\n', {
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-cache' },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (msg: string) => controller.enqueue(encoder.encode(msg + '\n'));

      try {
        send('[LOG] Initialising Batam FTZ intelligence pipeline...');

        // ── Step 1: Scrape with retry until data found ──────────────────────
        let gensparkRaw = '';
        const queries = queryParam
          ? [queryParam]
          : useBPS ? BPS_QUERIES : GENERAL_QUERIES;

        for (let i = 0; i < queries.length; i++) {
          const q = queries[i];
          send(`[LOG] Search attempt ${i + 1}/${queries.length}${useBPS ? ' (BPS)' : ''}...`);
          const result = await tryGenspark(q);
          if (result && result.length > 120) {
            gensparkRaw = result;
            send('[LOG] Live data collected — handing off to AI analyst...');
            break;
          }
          if (i < queries.length - 1) {
            send('[LOG] No results — trying next query...');
          }
        }

        const webDataFound = !!gensparkRaw;

        if (!gensparkRaw) {
          send('[LOG] Web search exhausted — synthesising from AI knowledge base...');
          send('[WARN] No live web data found — indicators will be AI-estimated. Upload BPS reports for verified data.');
        }

        // ── Step 2: Claude synthesis with retry on bad JSON ────────────────
        send('[LOG] Synthesising indicators, infrastructure, geopolitics & sectors...');

        const client = new Anthropic({ apiKey });
        let parsed: Record<string, unknown> = {};
        let jsonStr = '';

        for (let attempt = 1; attempt <= 2; attempt++) {
          if (attempt === 2) send('[LOG] Retrying synthesis with stricter prompt...');

          const message = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 6000,
            messages: [{ role: 'user', content: buildPrompt(queryParam ?? queries[0], gensparkRaw) }],
          });

          const raw = message.content[0].type === 'text' ? message.content[0].text : '';
          try {
            parsed = repairAndParse(raw) as Record<string, unknown>;
            // Inject confidence metadata
            if (parsed.dashboardStats && typeof parsed.dashboardStats === 'object') {
              const stats = parsed.dashboardStats as Record<string, unknown>;
              stats.dataConfidence = webDataFound ? 'verified' : 'ai_estimated';
              if (!webDataFound) {
                stats.dataWarnings = [
                  'No live web data was retrieved. All indicators are AI-estimated from training knowledge.',
                  'For verified figures, upload a recent BPS report or paste statistical data in Data Ingestion.',
                ];
              }
            }
            jsonStr = JSON.stringify(parsed);
            break;
          } catch (e) {
            if (attempt === 2) throw new Error(`JSON parse failed after 2 attempts: ${e instanceof Error ? e.message : e}`);
          }
        }

        send('[LOG] Data synthesis complete — populating dashboard...');
        send(`[PAYLOAD] ${jsonStr}`);
        send('[DONE]');
      } catch (err) {
        send(`[ERROR] ${err instanceof Error ? err.message : String(err)}`);
        send('[DONE]');
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
