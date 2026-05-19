export function buildPlannerPrompt(
  subjects: string[],
  deadlines: { subject: string; date: string }[],
  hoursPerDay: number,
  sessionLength: number,
  today: string
): string {
  const subjectsStr = subjects.join(', ');
  const deadlinesStr = deadlines.map(d => `${d.subject}: ${d.date}`).join(', ');

  return `You are a study planning expert. Generate a day-by-day study plan in JSON format.

Student profile:
- Subjects: ${subjectsStr}
- Exam/Deadline dates: ${deadlinesStr}
- Daily availability: ${hoursPerDay} hours/day
- Preferred session length: ${sessionLength} minutes
- Today's date: ${today}

Instructions:
- Prioritize subjects with closer deadlines
- Distribute topics evenly across available days
- Include buffer/revision days 2 days before each exam
- Don't exceed daily hours limit
- Plan up to 14 days

Return ONLY valid JSON:
{
  "plan": [
    {
      "date": "YYYY-MM-DD",
      "tasks": [
        {
          "subject": "Subject name",
          "topic": "Specific topic to study",
          "duration_minutes": 60,
          "priority": "high",
          "description": "What specifically to focus on and how to study it"
        }
      ]
    }
  ]
}`;
}
