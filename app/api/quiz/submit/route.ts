import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';
import { buildWeakAreaAnalysisPrompt } from '@/lib/prompts/quiz';

export async function POST(req: NextRequest) {
  try {
    const { wrongAnswers } = await req.json();

    if (!wrongAnswers || wrongAnswers.length === 0) {
      return NextResponse.json({
        weakAreas: [],
        recommendations: ['Great job! No wrong answers to analyze.'],
        studyPriority: 'low',
      });
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildWeakAreaAnalysisPrompt(wrongAnswers) }],
      temperature: 0.5,
    });
    const text = response.choices[0]?.message?.content ?? '';

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const insight = JSON.parse(jsonMatch[0]);
        return NextResponse.json(insight);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      weakAreas: ['General review needed'],
      recommendations: ['Review the topics where you made mistakes.'],
      studyPriority: 'medium',
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
