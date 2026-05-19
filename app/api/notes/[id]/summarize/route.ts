import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';
import { buildSummarizePrompt } from '@/lib/prompts/summarize';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content } = await req.json();

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildSummarizePrompt(content) }],
      temperature: 0.5,
    });
    const summary = response.choices[0]?.message?.content ?? '';

    // Update note with summary
    const supabase = createServerClient();
    await supabase.from('notes').update({ summary }).eq('id', id);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summarize error:', error);
    return NextResponse.json({ error: 'Summarization failed' }, { status: 500 });
  }
}
