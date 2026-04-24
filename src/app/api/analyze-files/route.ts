import Anthropic from '@anthropic-ai/sdk';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

function buildExtractionPrompt(fileNames: string[]): string {
  const now = new Date().toISOString();
  return `You are a senior economic analyst specialising in Batam Free Trade Zone, Indonesia.
The user has uploaded the following file(s): ${fileNames.join(', ')}.
Today's date is April 2026. The reporting period is Q2 2026.

Carefully read ALL provided content (spreadsheets, PDFs, images) and extract every piece of economic data you can find.
Then generate a complete economic intelligence payload for Batam FTZ Q2 2026.

If a specific data point is not present in the files, use your own knowledge to supply a realistic estimate, but prefer file data over estimates.

Return ONLY a valid JSON object — no markdown fences, no commentary:

{
  "dashboardStats": {
    "gdpGrowthPct": <number>,
    "gdpGrowthChange": <string e.g. "+0.4%">,
    "fdiInflow": <string e.g. "$220M">,
    "fdiChange": <string e.g. "+18%">,
    "inflationRate": <number>,
    "inflationChange": <string e.g. "-0.1%">,
    "totalProjects": <integer>,
    "period": "Q2 2026",
    "lastUpdated": "${now}",
    "dataSource": "upload"
  },
  "gdpData": [
    {"year":"2019","gdp":<n>,"target":<n>},
    {"year":"2020","gdp":<n>,"target":<n>},
    {"year":"2021","gdp":<n>,"target":<n>},
    {"year":"2022","gdp":<n>,"target":<n>},
    {"year":"2023","gdp":<n>,"target":<n>},
    {"year":"2024","gdp":<n>,"target":<n>},
    {"year":"2025","gdp":<n>,"target":<n>}
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
    {"month":"Nov 25","rate":<n>},
    {"month":"Dec 25","rate":<n>},
    {"month":"Jan 26","rate":<n>},
    {"month":"Feb 26","rate":<n>},
    {"month":"Mar 26","rate":<n>},
    {"month":"Apr 26","rate":<n>}
  ],
  "gdpHistorical": [
    {"year":2018,"gdpGrowthPct":<n>},
    {"year":2019,"gdpGrowthPct":<n>},
    {"year":2020,"gdpGrowthPct":<n>},
    {"year":2021,"gdpGrowthPct":<n>},
    {"year":2022,"gdpGrowthPct":<n>},
    {"year":2023,"gdpGrowthPct":<n>},
    {"year":2024,"gdpGrowthPct":<n>},
    {"year":2025,"gdpGrowthPct":<n>}
  ],
  "macroGrid": [
    {
      "category": "Macro Economic",
      "indicators": [
        {"name":"GDP","signals":[<10 signals: improving|stable|declining, one per quarter 2024Q1–2026Q2>]},
        {"name":"Trade","signals":[<10>]},
        {"name":"Industrial Activity","signals":[<10>]},
        {"name":"Labor","signals":[<10>]},
        {"name":"Prices / Inflation","signals":[<10>]}
      ]
    },
    {
      "category": "Financial",
      "indicators": [
        {"name":"Currency (vs USD)","signals":[<10>]},
        {"name":"Interest Rates","signals":[<10>]},
        {"name":"Capital Flow (FDI)","signals":[<10>]}
      ]
    }
  ],
  "infraProjects": [
    {"id":"1","type":"power","name":"<name>","progress":<0-100>,"status":"in_progress","notes":"<note>"},
    {"id":"2","type":"road","name":"<name>","progress":<0-100>,"status":"in_progress","notes":"<note>"},
    {"id":"3","type":"water","name":"<name>","progress":<0-100>,"status":"in_progress","notes":"<note>"},
    {"id":"4","type":"connectivity","name":"<name>","progress":<0-100>,"status":"in_progress","notes":"<note>"},
    {"id":"5","type":"fleet","name":"<name>","progress":<0-100>,"status":"in_progress","notes":"<note>"},
    {"id":"6","type":"policies","name":"<name>","progress":<0-100>,"status":"planned","notes":"<note>"}
  ],
  "geoEvents": [
    {"id":"1","title":"<title>","description":"<2-3 sentences>","source":"<source, Month Year>","impact":{"fdi":"improving","gdp":"improving","tenantRisk":"neutral"}},
    {"id":"2","title":"<title>","description":"<2-3 sentences>","source":"<source>","impact":{"fdi":"improving","gdp":"stable","tenantRisk":"neutral"}},
    {"id":"3","title":"<title>","description":"<2-3 sentences>","source":"<source>","impact":{"fdi":"stable","gdp":"improving","tenantRisk":"neutral"}}
  ],
  "sectorSummaries": [
    {"sector":"Electronics Mfg (EMS)","radarLabel":"EMS","projectCount":<n>,"highlight":"<key companies>"},
    {"sector":"Solar / Renewable","radarLabel":"Solar","projectCount":<n>,"highlight":"<key companies>"},
    {"sector":"Data Centers","radarLabel":"Data Ctr","projectCount":<n>,"highlight":"<key companies>"},
    {"sector":"BESS","radarLabel":"BESS","projectCount":<n>,"highlight":"<key companies>"},
    {"sector":"Medical Devices","radarLabel":"Medical","projectCount":<n>,"highlight":"<status>"},
    {"sector":"E-Cigarettes","radarLabel":"E-Cig","projectCount":<n>,"highlight":"<key companies>"}
  ],
  "summary": "<2-3 sentence executive synthesis>"
}

Rules:
- Signals must be exactly "improving", "stable", or "declining"
- Each indicator must have exactly 10 signals
- Extract actual numbers from files where present; estimate only where missing
- Return only the JSON object`;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const files = formData.getAll('files') as File[];
  if (!files.length) {
    return Response.json({ error: 'No files provided' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentBlocks: any[] = [];
  const fileNames: string[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return Response.json({ error: `File "${file.name}" exceeds 20 MB limit` }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const name = file.name.toLowerCase();
    const mime = file.type;

    if (mime === 'application/pdf' || name.endsWith('.pdf')) {
      const base64 = Buffer.from(buffer).toString('base64');
      contentBlocks.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64 },
      });
      fileNames.push(file.name);
    } else if (mime.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif)$/.test(name)) {
      const base64 = Buffer.from(buffer).toString('base64');
      const mediaType = mime.startsWith('image/') ? mime : 'image/png';
      contentBlocks.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64 },
      });
      fileNames.push(file.name);
    } else if (/\.(xlsx|xls|csv)$/.test(name) || mime.includes('spreadsheet') || mime.includes('excel') || mime === 'text/csv') {
      const wb = XLSX.read(buffer, { type: 'array' });
      let sheetText = `Spreadsheet: ${file.name}\n`;
      for (const sheetName of wb.SheetNames.slice(0, 8)) {
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });
        sheetText += `\n### Sheet: ${sheetName}\n${JSON.stringify(rows.slice(0, 150))}\n`;
      }
      contentBlocks.push({ type: 'text', text: sheetText });
      fileNames.push(file.name);
    }
  }

  if (!contentBlocks.length) {
    return Response.json({ error: 'No supported file types found (PDF, image, XLSX, CSV)' }, { status: 400 });
  }

  contentBlocks.push({ type: 'text', text: buildExtractionPrompt(fileNames) });

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: contentBlocks }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model did not return valid JSON');
    JSON.parse(match[0]); // validate
    return Response.json({ ok: true, ...JSON.parse(match[0]) });
  } catch (err) {
    console.error('analyze-files error:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
