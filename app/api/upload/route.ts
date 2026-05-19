import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserIdFromRequest } from '@/lib/supabase/server';
import { extractTextFromDocument } from '@/lib/parsers/document';
import groq from '@/lib/groq';
import { buildSummarizePrompt } from '@/lib/prompts/summarize';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let step = 'init';
  try {
    step = 'auth';
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized — please sign in again' }, { status: 401 });

    step = 'read-form';
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    step = 'read-buffer';
    const supabase = createServerClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'application/octet-stream';
    const fileNameLower = file.name.toLowerCase();

    // 1. Extract text FIRST — this is the only thing we truly need.
    step = 'parse';
    let rawText = '';
    try {
      rawText = await extractTextFromDocument(buffer, fileNameLower, contentType);
    } catch (err) {
      console.error('Parse error:', err);
      const detail = err instanceof Error ? err.message : 'Unknown parser error';
      return NextResponse.json(
        { error: `Could not read this document. ${detail}` },
        { status: 400 },
      );
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: 'No readable text was found in this document. Is it a scanned image PDF?' },
        { status: 400 },
      );
    }

    // 2. Upload to Supabase Storage — best effort, never blocks the note creation.
    step = 'storage';
    let fileUrl = '';
    try {
      // Make sure the bucket exists. Ignored if it already does.
      try {
        await supabase.storage.createBucket('notes', { public: false });
      } catch {
        // bucket already exists
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${userId}/${Date.now()}_${safeName}`;
      const { data: storageData, error: storageErr } = await supabase.storage
        .from('notes')
        .upload(storagePath, buffer, { contentType, upsert: false });
      if (storageErr) {
        console.warn('Storage upload failed (continuing without file URL):', storageErr.message);
      } else {
        fileUrl = storageData?.path ?? '';
      }
    } catch (err) {
      console.warn('Storage exception (continuing):', err);
    }

    // 3. Generate summary (best effort, never blocks).
    step = 'summarize';
    let summary = '';
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: buildSummarizePrompt(rawText.slice(0, 8000)) }],
        temperature: 0.5,
      });
      summary = response.choices[0]?.message?.content ?? '';
    } catch (err) {
      console.warn('Summary generation failed (continuing):', err);
    }

    // 4. Save to notes table.
    step = 'db-insert';
    const sourceType: 'pdf' | 'manual' = fileNameLower.endsWith('.pdf') ? 'pdf' : 'manual';
    const titleBase = file.name.replace(/\.[^.]+$/i, '');
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title: titleBase,
        content: rawText,
        summary,
        source_type: sourceType,
        file_url: fileUrl,
        word_count: rawText.split(/\s+/).filter(Boolean).length,
      })
      .select()
      .single();

    if (noteError) {
      console.error('DB insert error:', noteError);
      return NextResponse.json(
        { error: `Database error: ${noteError.message}` },
        { status: 500 },
      );
    }
    return NextResponse.json({ note });
  } catch (error) {
    console.error(`Upload error at step "${step}":`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Upload failed at step "${step}": ${error.message}`
            : `Upload failed at step "${step}"`,
      },
      { status: 500 },
    );
  }
}
