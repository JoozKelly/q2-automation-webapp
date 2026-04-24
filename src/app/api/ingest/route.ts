import { spawn } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

async function tryGenspark(query: string): Promise<string> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(''), 18000);
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

function buildPrompt(query: string, rawData: string): string {
  const now = new Date().toISOString();
  return `You are a senior economic analyst specialising in Indonesia's Batam Free Trade Zone (FTZ).
Today's date is April 2026. The reporting period is Q2 2026 (April–June 2026).
${rawData ? `\nWeb search results for "${query}":\n${rawData.slice(0, 4000)}\n` : ''}
Generate a complete, realistic economic intelligence payload for Batam FTZ Q2 2026.
Base your numbers on actual Batam/Kepri economic trends and the ${rawData ? 'search results above' : 'latest information you have'}.

Return ONLY a valid JSON object — no markdown fences, no commentary. Use this exact schema:

{
  "dashboardStats": {
    "gdpGrowthPct": <Batam city real GDP growth %, e.g. 7.2>,
    "gdpGrowthChange": <vs Q1 e.g. "+0.3%">,
    "fdiInflow": <quarterly FDI string e.g. "$220M">,
    "fdiChange": <vs prior quarter e.g. "+18%">,
    "inflationRate": <CPI % e.g. 2.5>,
    "inflationChange": <vs prior month e.g. "-0.1%">,
    "totalProjects": <total active tenant investment projects integer>,
    "period": "Q2 2026",
    "lastUpdated": "${now}",
    "dataSource": "genspark"
  },
  "gdpData": [
    {"year":"2019","gdp":<number>,"target":<number>},
    {"year":"2020","gdp":<number>,"target":<number>},
    {"year":"2021","gdp":<number>,"target":<number>},
    {"year":"2022","gdp":<number>,"target":<number>},
    {"year":"2023","gdp":<number>,"target":<number>},
    {"year":"2024","gdp":<number>,"target":<number>},
    {"year":"2025","gdp":<number>,"target":<number>}
  ],
  "investmentData": [
    {"quarter":"Q1 2025","foreign":<USD M>,"domestic":<USD M>},
    {"quarter":"Q2 2025","foreign":<USD M>,"domestic":<USD M>},
    {"quarter":"Q3 2025","foreign":<USD M>,"domestic":<USD M>},
    {"quarter":"Q4 2025","foreign":<USD M>,"domestic":<USD M>},
    {"quarter":"Q1 2026","foreign":<USD M>,"domestic":<USD M>},
    {"quarter":"Q2 2026","foreign":<USD M>,"domestic":<USD M>}
  ],
  "inflationData": [
    {"month":"Nov 25","rate":<number>},
    {"month":"Dec 25","rate":<number>},
    {"month":"Jan 26","rate":<number>},
    {"month":"Feb 26","rate":<number>},
    {"month":"Mar 26","rate":<number>},
    {"month":"Apr 26","rate":<number>}
  ],
  "gdpHistorical": [
    {"year":2018,"gdpGrowthPct":<number>},
    {"year":2019,"gdpGrowthPct":<number>},
    {"year":2020,"gdpGrowthPct":<number>},
    {"year":2021,"gdpGrowthPct":<number>},
    {"year":2022,"gdpGrowthPct":<number>},
    {"year":2023,"gdpGrowthPct":<number>},
    {"year":2024,"gdpGrowthPct":<number>},
    {"year":2025,"gdpGrowthPct":<number>}
  ],
  "macroGrid": [
    {
      "category": "Macro Economic",
      "indicators": [
        {"name":"GDP","signals":["improving","improving","stable","improving","improving","improving","improving","improving","improving","improving"]},
        {"name":"Trade","signals":[<10 realistic signals for 2024Q1–2026Q2>]},
        {"name":"Industrial Activity","signals":[<10 signals>]},
        {"name":"Labor","signals":[<10 signals>]},
        {"name":"Prices / Inflation","signals":[<10 signals>]}
      ]
    },
    {
      "category": "Financial",
      "indicators": [
        {"name":"Currency (vs USD)","signals":[<10 signals>]},
        {"name":"Interest Rates","signals":[<10 signals>]},
        {"name":"Capital Flow (FDI)","signals":[<10 signals>]}
      ]
    }
  ],
  "infraProjects": [
    {"id":"1","type":"power","name":"<specific Batam power project>","progress":<0-100>,"status":"in_progress","notes":"<brief note>"},
    {"id":"2","type":"road","name":"<specific road project>","progress":<0-100>,"status":"in_progress","notes":"<brief note>"},
    {"id":"3","type":"water","name":"<specific water project>","progress":<0-100>,"status":"in_progress","notes":"<brief note>"},
    {"id":"4","type":"connectivity","name":"<specific connectivity project>","progress":<0-100>,"status":"in_progress","notes":"<brief note>"},
    {"id":"5","type":"fleet","name":"<specific port/ferry project>","progress":<0-100>,"status":"in_progress","notes":"<brief note>"},
    {"id":"6","type":"policies","name":"<specific policy/incentive>","progress":<0-100>,"status":"planned","notes":"<brief note>"}
  ],
  "geoEvents": [
    {
      "id":"1",
      "title":"<specific current event title>",
      "description":"<2–3 sentences on the event and its relevance to Batam FTZ tenants>",
      "source":"<source name, Month Year>",
      "impact":{"fdi":"<improving|stable|declining>","gdp":"<improving|stable|declining>","tenantRisk":"<neutral|risk|red>"}
    }
  ],
  "sectorSummaries": [
    {"sector":"Electronics Mfg (EMS)","radarLabel":"EMS","projectCount":<int>,"highlight":"<key companies or milestones>"},
    {"sector":"Solar / Renewable","radarLabel":"Solar","projectCount":<int>,"highlight":"<key companies or milestones>"},
    {"sector":"Data Centers","radarLabel":"Data Ctr","projectCount":<int>,"highlight":"<key companies or milestones>"},
    {"sector":"BESS","radarLabel":"BESS","projectCount":<int>,"highlight":"<key companies or milestones>"},
    {"sector":"Medical Devices","radarLabel":"Medical","projectCount":<int>,"highlight":"<key companies or milestones>"},
    {"sector":"E-Cigarettes","radarLabel":"E-Cig","projectCount":<int>,"highlight":"<key companies or milestones>"}
  ],
  "summary": "<2–3 sentence executive synthesis of Batam FTZ Q2 2026 economic conditions for tenants>"
}

Rules:
- Every signal must be exactly one of: "improving", "stable", "declining"
- Every macroGrid indicator must have exactly 10 signals (periods: 2024 Q1 → 2026 Q2)
- geoEvents must have 3–5 entries covering current Q2 2026 events
- All numbers must be realistic for Batam FTZ
- Return only the JSON object`;
}

const BPS_QUERIES = [
  '"BPS Batam" OR "batamkota.bps.go.id" PDRB pertumbuhan ekonomi Batam 2024 2025',
  'site:bps.go.id Batam Kepri GRDP growth rate manufacturing 2024 2025',
  '"Badan Pusat Statistik" Batam investasi tenaga kerja inflasi ekspor impor 2025',
  'Batam FTZ investment FDI manufacturing exports 2025 Q1 Q2',
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const queryParam = body.query as string | undefined;
  const useBPS = body.bps === true;

  const query: string = queryParam ??
    (useBPS
      ? BPS_QUERIES.join(' | ')
      : 'Batam FTZ Q2 2026 GDP growth investment inflation infrastructure geoeconomics sector projects');

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
        if (useBPS) {
          send('[LOG] Running targeted BPS Batam search queries...');
        } else {
          send('[LOG] Running Genspark web search...');
        }

        let gensparkRaw = '';
        if (useBPS) {
          const results = await Promise.all(BPS_QUERIES.slice(0, 2).map((q) => tryGenspark(q)));
          gensparkRaw = results.filter(Boolean).join('\n\n---\n\n');
          if (gensparkRaw) {
            send('[LOG] BPS search data collected — extracting indicators...');
          } else {
            send('[LOG] BPS search returned no results — using AI knowledge base for Batam statistics...');
          }
        } else {
          gensparkRaw = await tryGenspark(query);
          if (gensparkRaw) {
            send('[LOG] Genspark data collected — handing off to AI analyst...');
          } else {
            send('[LOG] Genspark search timed out — falling back to AI knowledge base...');
          }
        }

        send('[LOG] Synthesising macro indicators, infrastructure, geopolitics & sectors...');

        const client = new Anthropic({ apiKey });
        const message = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4096,
          messages: [{ role: 'user', content: buildPrompt(query, gensparkRaw) }],
        });

        const raw = message.content[0].type === 'text' ? message.content[0].text : '';
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('Model did not return valid JSON');

        JSON.parse(match[0]); // validate before sending
        send('[LOG] Data synthesis complete — populating dashboard...');
        send(`[PAYLOAD] ${match[0]}`);
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
