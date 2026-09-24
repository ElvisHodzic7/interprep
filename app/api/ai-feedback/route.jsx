// app/api/ai-feedback/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    let conversation = typeof body?.conversation === 'string' ? body.conversation : '';

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Nedostaje OPENAI_API_KEY' }, { status: 500 });
    }
    if (!conversation) {
      return NextResponse.json({ error: 'Nedostaje razgovor' }, { status: 400 });
    }

    // Ako je OGROMNO, skrati: uzmi zadnjih ~120k znakova (cca 10–15k tokena “grubo”)
    const MAX_CHARS = 120_000;
    if (conversation.length > MAX_CHARS) {
      conversation = conversation.slice(-MAX_CHARS);
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = 'You are an assistant that returns only minified JSON. No prose, no code fences.';
    const user = `
Given the interview conversation below, produce a JSON summary with this shape:
{
  "rating": {
    "technicalSkills": number,
    "communication": number,
    "problemSolving": number,
    "experience": number,
    "totalRating": number
  },
  "summary": [string, string, ...],
  "recommendation": boolean,
  "recommendationMsg": string
}
Rules:
- Numbers 0..10
- totalRating = sum of the 4 categories
- "summary" (2-3 short sentences) and "recommendationMsg" (one sentence) MUST be written in Bosnian (Latin script). Do not use English.
- Return ONLY valid JSON, no markdown, no backticks.

Conversation:
${conversation}
`.trim();

    const chat = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.2,
    });

    const content = chat?.choices?.[0]?.message?.content || '';

    if (!content) {
      // Vraćamo 502 sa objašnjenjem umjesto generičkog 500
      return NextResponse.json({ error: 'AI je vratio prazan odgovor' }, { status: 502 });
    }

    return NextResponse.json({ content });
  } catch (e) {
    console.error('/api/ai-feedback error:', e?.stack || e);
    return NextResponse.json({ error: e?.message || 'Greška na serveru' }, { status: 500 });
  }
}
