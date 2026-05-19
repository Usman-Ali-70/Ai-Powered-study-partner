import { NextRequest, NextResponse } from 'next/server';
import groq, { DEFAULT_GROQ_MODEL } from '@/lib/groq';
import { buildGeneralChatSystemPrompt } from '@/lib/prompts/chat';

export async function POST(req: NextRequest) {
  try {
    const { messages, model = DEFAULT_GROQ_MODEL, temperature = 0.7 } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Map old Gemini model selections gracefully to Groq models
    let groqModel = 'llama-3.3-70b-versatile';
    if (model === 'gemini-2.0-flash-lite' || model === 'llama-3.1-8b-instant') {
      groqModel = 'llama-3.1-8b-instant';
    }

    const systemPrompt = buildGeneralChatSystemPrompt();

    const response = await groq.chat.completions.create({
      model: groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      temperature,
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Groq Chat API error:', error);
    return NextResponse.json(
      { error: 'Chat failed. Please check your Groq API key and try again.' },
      { status: 500 }
    );
  }
}
