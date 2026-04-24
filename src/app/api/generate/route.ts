import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  try {
    const { data, sections } = await request.json();

    if (!data) {
      return NextResponse.json({ error: 'Economic data is required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 });
    }

    const prompt = `You are an expert economic analyst writing a quarterly report for Batam tenants (businesses operating in the Batam Free Trade Zone, Indonesia).

Based on the following economic data, write a professional markdown-formatted report.
Include these sections: ${sections.join(', ')}.

Data:
${JSON.stringify(data, null, 2)}

Guidelines:
- Write for a business audience (C-suite executives, investors, tenants)
- Use ### for section headers
- Be analytical — explain what the numbers mean for tenants
- Keep each section to 2–3 concise paragraphs
- End with forward-looking statements
- Return ONLY the markdown report — no preamble or closing remarks`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const result =
      message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ result }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating report:', message);
    return NextResponse.json(
      { error: 'Failed to generate report', details: message },
      { status: 500 }
    );
  }
}
