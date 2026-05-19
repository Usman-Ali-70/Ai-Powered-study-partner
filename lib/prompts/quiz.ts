export function buildQuizPrompt(
  noteContent: string,
  difficulty: string,
  count: number,
  types: string[],
  focusAreas?: string[]
): string {
  const typeDesc = types.join(', ');
  const focusDesc = focusAreas?.length ? `Focus especially on: ${focusAreas.join(', ')}.` : '';

  return `Generate a ${difficulty} quiz with exactly ${count} questions from these notes.
Question types to use: ${typeDesc}. ${focusDesc}
Return ONLY valid JSON, no markdown, no explanation, just raw JSON:

{
  "title": "Quiz title based on content",
  "subject": "detected subject area",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": "Option A",
      "explanation": "Clear explanation of why this is correct",
      "topic": "specific subtopic from notes",
      "difficulty": "${difficulty}"
    }
  ]
}

For true_false questions, options should be ["True", "False"].
For short_answer questions, omit options, and correct should be a concise answer.
Make sure explanations are educational and reference the notes.

Notes:
${noteContent.slice(0, 8000)}`;
}

export function buildWeakAreaAnalysisPrompt(wrongAnswers: { question: string; topic: string; userAnswer: string; correct: string }[]): string {
  const wrongList = wrongAnswers.map((w, i) => `${i + 1}. Topic: ${w.topic}\n   Question: ${w.question}\n   Student answered: ${w.userAnswer}\n   Correct: ${w.correct}`).join('\n\n');
  return `Analyze these incorrect quiz answers and identify weak areas for a student.
Return ONLY valid JSON:

{
  "weakAreas": ["Topic 1", "Topic 2"],
  "recommendations": [
    "Specific actionable advice about what to review",
    "Another specific recommendation"
  ],
  "studyPriority": "high"
}

Wrong answers:
${wrongList}`;
}
