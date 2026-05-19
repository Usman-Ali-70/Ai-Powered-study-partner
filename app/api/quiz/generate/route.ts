import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';
import { createServerClient } from '@/lib/supabase/server';
import { buildQuizPrompt } from '@/lib/prompts/quiz';

export async function POST(req: NextRequest) {
  try {
    const { noteId, difficulty, questionCount, questionTypes } = await req.json();
    const supabase = createServerClient();

    // Fetch note content
    const { data: note } = await supabase
      .from('notes')
      .select('content, user_id')
      .eq('id', noteId)
      .single();

    if (!note || !note.content) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Generate quiz with Groq
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildQuizPrompt(note.content, difficulty, questionCount, questionTypes) }],
      temperature: 0.5,
    });
    const text = response.choices[0]?.message?.content ?? '';

    // Parse JSON from response
    let quizData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      return NextResponse.json({ error: 'Failed to parse quiz data' }, { status: 500 });
    }

    // Save quiz to database
    const { data: quiz, error } = await supabase.from('quizzes').insert({
      user_id: note.user_id,
      note_id: noteId,
      title: quizData.title || 'AI Generated Quiz',
      subject: quizData.subject,
      difficulty,
      questions: quizData.questions,
      total_questions: quizData.questions.length,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ error: 'Quiz generation failed' }, { status: 500 });
  }
}
