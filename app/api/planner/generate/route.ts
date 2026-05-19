import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';
import { createServerClient, getUserIdFromRequest } from '@/lib/supabase/server';
import { buildPlannerPrompt } from '@/lib/prompts/planner';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { subjects, deadlines, hoursPerDay, sessionLength } = await req.json();
    const supabase = createServerClient();
    const today = format(new Date(), 'yyyy-MM-dd');

    // Generate plan with Groq
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: buildPlannerPrompt(subjects, deadlines, hoursPerDay, sessionLength, today) }],
      temperature: 0.5,
    });
    const text = response.choices[0]?.message?.content ?? '';

    let planData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      return NextResponse.json({ error: 'Failed to parse plan data' }, { status: 500 });
    }

    // Flatten plan into individual tasks
    const tasks: Array<{
      user_id: string;
      title: string;
      subject: string;
      description: string;
      study_date: string;
      duration_minutes: number;
      priority: string;
      ai_generated: boolean;
    }> = [];

    for (const day of planData.plan || []) {
      for (const task of day.tasks || []) {
        tasks.push({
          user_id: userId,
          title: task.topic || task.subject,
          subject: task.subject,
          description: task.description,
          study_date: day.date,
          duration_minutes: task.duration_minutes || sessionLength,
          priority: task.priority || 'medium',
          ai_generated: true,
        });
      }
    }

    if (tasks.length > 0) {
      const { error } = await supabase.from('study_tasks').insert(tasks);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ tasks, plan: planData });
  } catch (error) {
    console.error('Planner generation error:', error);
    return NextResponse.json({ error: 'Plan generation failed' }, { status: 500 });
  }
}
