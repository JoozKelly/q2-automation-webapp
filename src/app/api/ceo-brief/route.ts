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

  const prompt = `You are a senior strategy consultant preparing a CEO-level briefing for Batam Free Trade Zone stakeholders.
${context ? `\nCurrent economic data context:\n${context}\n` : ''}
${focus ? `\nUser's focus areas: ${focus}\n` : ''}
${file ? `\nThe user has uploaded an existing quarterly report (attached). Use it as your primary reference for facts, figures, and tone.` : ''}

Generate a comprehensive CEO Brief in the following markdown structure. Be specific, use actual Batam FTZ data, and write in a crisp executive style.

---

# CEO Brief — Batam FTZ Q2 2026

## Executive Summary
[5–7 concise bullet points capturing the most important findings and their strategic implications]

## Recommended Narrative Arc
[Describe the overarching story: what is the headline message, what supporting evidence underpins it, and what call-to-action follows]

### Chapter 1: Macroeconomic Foundation
**Angle:** [One-line framing]
**Key message:** [2-3 sentences]
**Talking points:**
- [point 1]
- [point 2]
- [point 3]

### Chapter 2: Infrastructure & Policy Enablers
**Angle:** [One-line framing]
**Key message:** [2-3 sentences]
**Talking points:**
- [point 1]
- [point 2]
- [point 3]

### Chapter 3: Geopolitical Tailwinds
**Angle:** [One-line framing]
**Key message:** [2-3 sentences]
**Talking points:**
- [point 1]
- [point 2]
- [point 3]

### Chapter 4: Sector Momentum
**Angle:** [One-line framing]
**Key message:** [2-3 sentences]
**Talking points:**
- [point 1]
- [point 2]
- [point 3]

### Chapter 5: Forward Outlook & Risks
**Angle:** [One-line framing]
**Key message:** [2-3 sentences]
**Talking points:**
- [point 1]
- [point 2]
- [point 3]

## Strategic Messaging Framework
[3–5 overarching messages that should appear consistently across all materials]

## Suggested Opening (for presentation/speech)
[2–3 sentence hook that grabs a CEO audience's attention]

## Suggested Closing
[2–3 sentences that leave the audience with a clear call to action]

---

Write with authority. Use data where available. Every chapter should connect back to the central narrative.`;

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
