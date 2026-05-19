import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, getUserIdFromRequest } from '@/lib/supabase/server';
import { extractTextFromPDF } from '@/lib/parsers/pdf';
import groq from '@/lib/groq';
import { buildSummarizePrompt } from '@/lib/prompts/summarize';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const supabase = createServerClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    // Ensure storage bucket exists
    try {
      await supabase.storage.createBucket('notes', { public: false });
    } catch {
      // Ignore if bucket already exists
    }

    // 1. Upload to Supabase Storage (scoped to user)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${userId}/${Date.now()}_${safeName}`;
    const { data: storageData } = await supabase.storage
      .from('notes')
      .upload(fileName, buffer, { contentType: 'application/pdf', upsert: false });

    const fileUrl = storageData?.path ?? '';

    // 2. Extract text from PDF
    let rawText = '';
    try {
      rawText = await extractTextFromPDF(buffer);
    } catch {
      return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 400 });
    }

    // 3. Generate summary (best effort)
    let summary = '';
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: buildSummarizePrompt(rawText.slice(0, 8000)) }],
        temperature: 0.5,
      });
      summary = response.choices[0]?.message?.content ?? '';
    } catch {
      // Non-critical — continue without summary
    }

    // 4. Save to notes table
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title: file.name.replace(/\.pdf$/i, ''),
        content: rawText,
        summary,
        source_type: 'pdf',
        file_url: fileUrl,
        word_count: rawText.split(/\s+/).filter(Boolean).length,
      })
      .select()
      .single();

    if (noteError) {
      return NextResponse.json({ error: noteError.message }, { status: 500 });
    }
    return NextResponse.json({ note });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
