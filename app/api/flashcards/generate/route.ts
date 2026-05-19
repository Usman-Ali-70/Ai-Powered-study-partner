import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';
import { createServerClient } from '@/lib/supabase/server';
import { buildFlashcardsPrompt } from '@/lib/prompts/flashcards';

export async function POST(req: NextRequest) {
  try {
    const { noteId } = await req.json();
    const supabase = createServerClient();

    // Fetch note
    const { data: note } = await supabase
      .from('notes')
      .select('content, user_id')
      .eq('id', noteId)
      .single();

    if (!note || !note.content) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Generate flashcards with Groq
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildFlashcardsPrompt(note.content) }],
      temperature: 0.5,
    });
    const text = response.choices[0]?.message?.content ?? '';

    let cardsData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cardsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      return NextResponse.json({ error: 'Failed to parse flashcard data' }, { status: 500 });
    }

    // Create deck
    const { data: deck, error: deckError } = await supabase
      .from('flashcard_decks')
      .insert({
        user_id: note.user_id,
        note_id: noteId,
        title: cardsData.deckTitle || 'AI Flashcards',
        subject: cardsData.subject,
        card_count: cardsData.cards.length,
      })
      .select()
      .single();

    if (deckError) {
      return NextResponse.json({ error: deckError.message }, { status: 500 });
    }

    // Create individual cards
    const cards = cardsData.cards.map((card: { front: string; back: string }) => ({
      deck_id: deck.id,
      user_id: note.user_id,
      front: card.front,
      back: card.back,
      ease_factor: 2.5,
      interval: 1,
      repetitions: 0,
      next_review: new Date().toISOString(),
    }));

    const { error: cardsError } = await supabase
      .from('flashcards')
      .insert(cards);

    if (cardsError) {
      return NextResponse.json({ error: cardsError.message }, { status: 500 });
    }

    return NextResponse.json({ deck });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    return NextResponse.json({ error: 'Flashcard generation failed' }, { status: 500 });
  }
}
