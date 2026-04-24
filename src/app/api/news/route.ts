import { spawn } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

async function runGenspark(query: string): Promise<string> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(''), 20000);
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

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const query: string =
    (body.query as string) ??
    'Batam Free Trade Zone investment news infrastructure April 2026 site:reuters.com OR site:thejakartapost.com OR site:straitstimes.com OR site:businesstimes.com.sg OR site:antaranews.com';

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
        const rawNews = await runGenspark(query);

        if (rawNews) {
          send('[LOG] News results collected — structuring with AI...');
        } else {
          send('[LOG] Web search unavailable — generating news from AI knowledge base...');
        }

        const client = new Anthropic({ apiKey });
        const prompt = `You are an economic news analyst covering Batam Free Trade Zone, Indonesia.
${rawNews ? `\nWeb search results:\n${rawNews.slice(0, 5000)}\n` : ''}
Based on ${rawNews ? 'the search results and ' : ''}your knowledge (today is April 2026), extract or generate 6–10 recent news items relevant to Batam FTZ tenants and investors.

Return ONLY a valid JSON array (no markdown):

[
  {
    "id": "1",
    "title": "<headline>",
    "summary": "<2-3 sentence summary of the news and its relevance to Batam FTZ>",
    "source": "<publication name>",
    "date": "<Month YYYY or specific date>",
    "category": "<fdi|infrastructure|policy|sector|geopolitics|economy>",
    "relevance": "<high|medium|low>"
  }
]

Focus on: FDI announcements, infrastructure updates, Singapore–Indonesia corridor, trade policy, sector investment, and macroeconomic conditions.
Return only the JSON array.`;

        const message = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        });

        const raw = message.content[0].type === 'text' ? message.content[0].text : '[]';
        const match = raw.match(/\[[\s\S]*\]/);
        if (!match) throw new Error('No JSON array in response');

        JSON.parse(match[0]); // validate
        send('[LOG] News items structured successfully.');
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
