'use client';

import { getDifficultyColor } from '@/lib/utils';

export function ConfidenceBadge({ difficulty }: { difficulty: string }) {
  return (
    <span
      className="badge"
      style={{
        background: `${getDifficultyColor(difficulty)}15`,
        color: getDifficultyColor(difficulty),
        border: `1px solid ${getDifficultyColor(difficulty)}30`,
      }}
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

export function SubjectBadge({ subject, color }: { subject: string; color?: string }) {
  const c = color || 'var(--accent)';
  return (
    <span
      className="badge"
      style={{
        background: `${c}15`,
        color: c,
        border: `1px solid ${c}30`,
      }}
    >
      {subject}
    </span>
  );
}
