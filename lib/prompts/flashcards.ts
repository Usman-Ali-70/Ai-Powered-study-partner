export function buildFlashcardsPrompt(noteContent: string): string {
  return `Create comprehensive flashcards from these notes. Focus on key definitions, concepts, formulas, dates, and important facts.
Return ONLY valid JSON, no markdown, no explanation:

{
  "deckTitle": "Descriptive deck title",
  "subject": "Detected subject",
  "cards": [
    { "front": "What is [concept]?", "back": "Clear, concise answer" },
    { "front": "Define [term]", "back": "Definition" },
    { "front": "Formula for [X]", "back": "Formula with explanation" }
  ]
}

Create at least 10 cards and up to 25. Make fronts as questions when possible.

Notes:
${noteContent.slice(0, 8000)}`;
}
