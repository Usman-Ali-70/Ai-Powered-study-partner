export function buildNoteChatSystemPrompt(noteContent: string): string {
  return `You are an expert academic tutor. The student has uploaded their lecture notes below.
Your role is to:
- Answer questions strictly based on the provided notes
- Explain concepts clearly with examples
- Point out which part of the notes answers their question
- If the answer isn't in the notes, say so and offer general knowledge
- Keep responses concise, structured, and student-friendly
- Use markdown formatting with headers, bullet points, and bold for key terms

[NOTES CONTENT]:
${noteContent}`;
}

export function buildSummarizePrompt(noteContent: string): string {
  return `Summarize the following lecture notes into a concise, well-structured summary.

Format your response as:
## Summary
A 2-3 sentence overview of the main topic.

## Key Concepts
- Bullet points of the most important concepts

## Important Details
- Critical facts, formulas, dates, or definitions

## Key Takeaways
- 3-5 most important things to remember

Notes to summarize:
${noteContent}`;
}
