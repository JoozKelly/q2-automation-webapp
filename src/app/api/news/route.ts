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

// ── Extract real URLs from Genspark JSON output ───────────────────────────────

interface GensparkItem {
  title?: string;
  url?: string;
  link?: string;
  href?: string;
  source?: string;
}

function extractSourceUrls(raw: string): Array<{ title: string; url: string }> {
  // Try to parse as JSON (Genspark --output json)
  try {
    const parsed: unknown = JSON.parse(raw);
    const items: GensparkItem[] = Array.isArray(parsed)
      ? (parsed as GensparkItem[])
      : ((parsed as Record<string, unknown>).results as GensparkItem[] ??
         (parsed as Record<string, unknown>).items   as GensparkItem[] ??
         (parsed as Record<string, unknown>).data    as GensparkItem[] ?? []);
    const urls = items
      .map((item) => ({ title: item.title ?? '', url: item.url ?? item.link ?? item.href ?? '' }))
      .filter((x) => x.url.startsWith('http'));
    if (urls.length > 0) return urls;
  } catch { /* fall through to regex */ }

  // Fallback: regex-extract all URLs from raw text
  const found = raw.match(/https?:\/\/[^\s"'<>)]+/g) ?? [];
  return [...new Set(found)].map((url) => ({ title: '', url }));
}

// ── Largest-candidate array extractor ────────────────────────────────────────

function extractArray(text: string): string | null {
  const s = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
  const candidates: string[] = [];

  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '[') continue;
    let depth = 0, inStr = false, esc = false;
    for (let j = i; j < s.length; j++) {
      const c = s[j];
      if (esc)               { esc = false; continue; }
      if (c === '\\' && inStr) { esc = true; continue; }
      if (c === '"')         { inStr = !inStr; continue; }
      if (inStr)             continue;
      if (c === '[') depth++;
      if (c === ']') {
        depth--;
        if (depth === 0) { candidates.push(s.slice(i, j + 1)); i = j; break; }
      }
    }
  }
  if (!candidates.length) return null;
  return candidates.reduce((a, b) => (a.length > b.length ? a : b));
}

// ── JSON array repair + parse ─────────────────────────────────────────────────

function repairAndParseArray(raw: string): unknown[] {
  const extracted = extractArray(raw);
  if (!extracted) throw new Error('No JSON array found in model response');

  try { return JSON.parse(extracted) as unknown[]; } catch (_) {}

  const repaired = extracted
    .replace(/\/\/[^\n\r]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3');

  return JSON.parse(repaired) as unknown[];
}

// ── News queries (tried sequentially until one returns data) ──────────────────

const NEWS_QUERIES = [
  'Batam FTZ investment news April 2026 site:reuters.com OR site:thejakartapost.com OR site:straitstimes.com',
  'Batam Free Trade Zone BP Batam FDI infrastructure sector news 2026',
  '"Batam" investment manufacturing data centre BESS solar 2026 news',
  'Kepulauan Riau Batam economy manufacturing export import 2025 2026',
  'Indonesia Batam economic development industrial zone investment Q2 2026',
];

function buildNewsPrompt(rawData: string, sourceUrls: Array<{ title: string; url: string }>): string {
  const urlBlock = sourceUrls.length > 0
    ? `\nReal URLs found in web search results (use these for sourceUrl wherever they match the article):\n${
        sourceUrls.slice(0, 20).map((u) => `- ${u.url}${u.title ? `  [${u.title}]` : ''}`).join('\n')
      }\n`
    : '';
  return `You are an economic news analyst covering Batam Free Trade Zone, Indonesia.
Today is April 2026. Reporting period: Q2 2026.
${rawData ? `\nLive web search results:\n${rawData.slice(0, 4000)}\n` : ''}${urlBlock}
Extract or generate 8 recent news items relevant to Batam FTZ tenants and investors.

CRITICAL FORMATTING RULES — output fed directly to JSON.parse():
• Output ONLY the raw JSON array. No markdown, no code fences, no commentary.
• ALL keys MUST be double-quoted strings.
• NO trailing commas. NO JavaScript comments.
• ALL string values MUST use double quotes.

Return exactly this structure (imageSearchTerm should be 2–3 keywords for finding a relevant photo):

[
  {
    "id": "1",
    "title": "US–Indonesia Trade Framework Signed",
    "summary": "The US and Indonesia formalised a bilateral trade framework covering critical minerals, semiconductors, and clean energy. Batam FTZ is positioned as a priority manufacturing hub. New supply chain ties are expected to boost FDI inflows significantly.",
    "source": "Reuters",
    "date": "March 2026",
    "category": "policy",
    "relevance": "high",
    "imageSearchTerm": "trade agreement handshake",
    "sourceUrl": "https://www.reuters.com/world/asia-pacific/..."
  },
  {
    "id": "2",
    "title": "Sembcorp Signs MOU for Carbon-Neutral Industrial Park in Batam",
    "summary": "Sembcorp Industries signed an MOU with BP Batam to develop a 500-hectare carbon-neutral industrial park. The park will host solar, BESS, and data centre tenants. First phase groundbreaking is scheduled for Q3 2026.",
    "source": "Business Times",
    "date": "February 2026",
    "category": "fdi",
    "relevance": "high",
    "imageSearchTerm": "solar energy industrial park"
  },
  {
    "id": "3",
    "title": "Johor–Singapore SEZ Launches EMS Incentives, Pressuring Batam",
    "summary": "Malaysia's Johor–Singapore Special Economic Zone introduced new tax incentives for electronics manufacturers, intensifying competition for EMS relocations. Analysts note Batam retains a labour cost advantage of 15–20%. Both zones are targeting the same tier of multinational clients.",
    "source": "Straits Times",
    "date": "January 2026",
    "category": "geopolitics",
    "relevance": "high",
    "imageSearchTerm": "manufacturing electronics factory"
  },
  {
    "id": "4",
    "title": "BP Batam Records USD 205M Investment in Q1 2026",
    "summary": "BP Batam reported USD 205M in new investment commitments in Q1 2026, a 12% year-on-year increase. Data centre and BESS projects led the intake. The authority expects Q2 inflows to surpass Q1 driven by two large data centre announcements.",
    "source": "BP Batam Press Release",
    "date": "April 2026",
    "category": "fdi",
    "relevance": "high",
    "imageSearchTerm": "data center technology investment"
  },
  {
    "id": "5",
    "title": "Indonesia Raises Domestic Content Rules for Solar Panels",
    "summary": "New regulations mandate 40% domestic content in solar panel supply chains by 2027. Batam-based solar manufacturers are expanding local cell production lines to comply. The rule is expected to stimulate additional domestic component investment.",
    "source": "Jakarta Post",
    "date": "April 2026",
    "category": "policy",
    "relevance": "medium",
    "imageSearchTerm": "solar panel manufacturing"
  },
  {
    "id": "6",
    "title": "EdgeConneX Breaks Ground on 60MW Data Centre in Batam",
    "summary": "EdgeConneX commenced construction on a 60MW hyperscale data centre in Batam's west industrial corridor. The facility is designed to serve Singapore overflow demand and Indonesian cloud adoption growth. Full commissioning is expected in Q1 2027.",
    "source": "Data Centre Dynamics",
    "date": "March 2026",
    "category": "sector",
    "relevance": "high",
    "imageSearchTerm": "data center server room"
  },
  {
    "id": "7",
    "title": "Tanjung Uncang Power Plant Phase 2 Reaches 72% Completion",
    "summary": "The 200MW expansion of Tanjung Uncang Power Plant is progressing at 72% completion. The additional capacity is critical to support Batam's growing data centre and manufacturing load. Commissioning is expected by Q4 2026.",
    "source": "Bisnis Indonesia",
    "date": "March 2026",
    "category": "infrastructure",
    "relevance": "high",
    "imageSearchTerm": "power plant construction"
  },
  {
    "id": "8",
    "title": "CATL JV Announces 2 GWh BESS Facility in Batam",
    "summary": "A joint venture involving CATL will build a 2 GWh battery energy storage facility in Batam to serve Singapore's energy balancing needs via the cross-Strait interconnection. The project creates approximately 400 direct jobs. Investment value is estimated at USD 180M.",
    "source": "Nikkei Asia",
    "date": "February 2026",
    "category": "sector",
    "relevance": "high",
    "imageSearchTerm": "battery energy storage technology"
  }
]

Use the web data above where available; fill gaps from your knowledge.
Category must be one of: fdi, infrastructure, policy, sector, geopolitics, economy
Relevance must be one of: high, medium, low
imageSearchTerm: 2-3 English keywords for a relevant photo (e.g. "solar panels factory", "data center servers")
sourceUrl: PRIORITY ORDER — (1) use a matching URL from the "Real URLs" list above if the domain or title matches, (2) otherwise use https://news.google.com/search?q={URL-encoded article title}&hl=en — NEVER invent a fake article path`;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const queryParam = body.query as string | undefined;

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
        send('[LOG] Searching for latest Batam FTZ news...');

        // ── Step 1: Scrape with retry until data found ──────────────────────
        let rawNews = '';
        const queries = queryParam ? [queryParam] : NEWS_QUERIES;

        for (let i = 0; i < queries.length; i++) {
          send(`[LOG] News search attempt ${i + 1}/${queries.length}...`);
          const result = await tryGenspark(queries[i]);
          if (result && result.length > 120) {
            rawNews = result;
            send('[LOG] News results collected — structuring with AI...');
            break;
          }
          if (i < queries.length - 1) send('[LOG] No results — trying next query...');
        }

        // Extract real article URLs from Genspark JSON before passing to Claude
        const sourceUrls = rawNews ? extractSourceUrls(rawNews) : [];
        if (sourceUrls.length > 0) {
          send(`[LOG] Extracted ${sourceUrls.length} source URLs from search results.`);
        }

        if (!rawNews) {
          send('[LOG] Web search exhausted — generating news from AI knowledge base...');
        }

        // ── Step 2: Claude synthesis with retry on bad JSON ────────────────
        send('[LOG] Structuring news items...');

        const client = new Anthropic({ apiKey });
        let parsed: unknown[] | null = null;
        let jsonStr = '';

        for (let attempt = 1; attempt <= 2; attempt++) {
          if (attempt === 2) send('[LOG] Retrying news synthesis...');

          const message = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 3500,
            messages: [{ role: 'user', content: buildNewsPrompt(rawNews, sourceUrls) }],
          });

          const raw = message.content[0].type === 'text' ? message.content[0].text : '[]';
          try {
            parsed = repairAndParseArray(raw);
            // Attach loremflickr image URLs (Unsplash Source API is deprecated)
            parsed = (parsed as Record<string, unknown>[]).map((item) => {
              const term = ((item.imageSearchTerm as string) ?? (item.category as string) ?? 'indonesia economy')
                .toLowerCase()
                .replace(/[^a-z0-9 ]/g, '')
                .trim()
                .replace(/\s+/g, ',');
              return {
                ...item,
                imageUrl: `https://loremflickr.com/800/400/${encodeURIComponent(term)}?lock=${item.id ?? Math.random()}`,
              };
            });
            jsonStr = JSON.stringify(parsed);
            break;
          } catch (e) {
            if (attempt === 2) throw new Error(`JSON parse failed after 2 attempts: ${e instanceof Error ? e.message : e}`);
          }
        }

        send('[LOG] News items structured successfully.');
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
