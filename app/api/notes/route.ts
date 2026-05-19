import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserIdFromRequest } from '@/lib/supabase/server';

// GET all notes for the authenticated user
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data });
}

// POST — create a new note for the authenticated user
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.title || typeof body.title !== 'string') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const content: string = body.content ?? '';

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      title: body.title,
      content,
      subject: body.subject || null,
      source_type: body.source_type || 'manual',
      word_count: content ? content.split(/\s+/).filter(Boolean).length : 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data });
}
