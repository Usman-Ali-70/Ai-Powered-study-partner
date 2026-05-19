import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserIdFromRequest } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { deckId } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('id', deckId)
    .eq('user_id', userId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ deck: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { deckId } = await params;
  const supabase = createServerClient();

  // Cascade delete any flashcards belonging to this deck first (best-effort)
  try {
    await supabase.from('flashcards').delete().eq('deck_id', deckId);
  } catch {
    // ignore — table may not exist or RLS may allow cascade already
  }

  const { error } = await supabase
    .from('flashcard_decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
