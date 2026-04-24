import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response('data: [ERROR] ANTHROPIC_API_KEY not configured\n\n', {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }

  const formData = await request.formData().catch(() => null);
  const context = (formData?.get('context') as string) ?? '';
  const focus = (formData?.get('focus') as string) ?? '';
  const prevReportText = (formData?.get('prevReportText') as string) ?? '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentBlocks: any[] = [];

  // Attach uploaded PDF if provided
  const file = formData?.get('file') as File | null;
  if (file && file.size > 0) {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mime = file.type === 'application/pdf' ? 'application/pdf' : file.type;
    if (mime === 'application/pdf') {
      contentBlocks.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64 },
      });
    }
  }

  const prompt = `You are a senior strategy consultant preparing the storyline for Batam FTZ's MOST RECENT quarterly report. Using the previous quarter's report as a baseline, and the current Q2 2026 data as the latest evidence, recommend what NEW stories to tell for the upcoming quarter — what improved, what risks emerged, and how to frame Batam's competitive position for CEO and investor audiences.
${context ? `\nQ2 2026 economic data context:\n${context}\n` : ''}
${prevReportText ? `\nPrevious quarter report highlights (Q1 2026):\n${prevReportText.slice(0, 3000)}\n` : ''}
${focus ? `\nStrategic priorities to emphasise: ${focus}\n` : ''}
${file ? `\nThe user has uploaded an existing Q2 report (attached). Use it as your primary reference for facts, figures, and trends going into Q3.` : ''}

Generate a forward-looking Q3 Storyline Plan in the following markdown structure. Be specific about what to SAY next quarter based on Q2 data trends, and write in a crisp executive style.

---

# Q3 2026 Storyline Plan — Batam FTZ

## Q3 Narrative Priorities
[5–7 concise bullet points on what the CEO should emphasise NEXT quarter — the strategic stories, angles, and themes that will resonate most with CEO and investor audiences in Q3]

## Q3 Story Arc
[Describe the overarching message for the upcoming Q3 report: what is the headline narrative, what Q2 evidence supports it, and what forward-looking call-to-action it leads to]

### Chapter 1: Macroeconomic Foundation
**Angle:** [One-line framing for Q3]
**Key message:** [2-3 sentences on what to say about the macro foundation going into Q3]
**Talking points:**
- [point 1]
- [point 2]
- [point 3]

### Chapter 2: Infrastructure & Policy Enablers
**Angle:** [One-line framing for Q3]
**Key message:** [2-3 sentences on what to say about infrastructure and policy momentum]
**Talking points:**
- [point 1]
- [point 2]
- [point 3]

### Chapter 3: Geopolitical Tailwinds
**Angle:** [One-line framing for Q3]
**Key message:** [2-3 sentences on what geopolitical angles to lead with in Q3]
**Talking points:**
- [point 1]
- [point 2]
- [point 3]

### Chapter 4: Sector Momentum
**Angle:** [One-line framing for Q3]
**Key message:** [2-3 sentences on which sectors to spotlight and why]
**Talking points:**
- [point 1]
- [point 2]
- [point 3]

### Chapter 5: H2 2026 Setup
**Angle:** [One-line framing for positioning into the second half of 2026]
**Key message:** [2-3 sentences on how to position Batam FTZ for H2 2026 based on Q2 momentum]
**Talking points:**
- [point 1]
- [point 2]
- [point 3]

## Strategic Messaging Framework
[3–5 overarching messages that should appear consistently across all Q3 materials]

## Suggested Opening (for presentation/speech)
[2–3 sentence hook that grabs a CEO audience's attention going into Q3]

## Suggested Closing
[2–3 sentences that leave the audience with a clear call to action for Q3 and beyond]

---

Write with authority. Use Q2 data trends to justify every Q3 recommendation. Every chapter should connect back to the central Q3 narrative arc.`;

  contentBlocks.push({ type: 'text', text: prompt });

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          stream: true,
          messages: [{ role: 'user', content: contentBlocks }],
        });

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(`\n\n[Error: ${err instanceof Error ? err.message : String(err)}]`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
