import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { addDays } from 'date-fns';
import { Flashcard } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) return formatDate(date);
  if (diffDays > 1) return `${diffDays} days ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffHours > 1) return `${diffHours} hours ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffMinutes > 1) return `${diffMinutes} minutes ago`;
  return 'Just now';
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function getSubjectColor(subject?: string): string {
  if (!subject) return 'var(--text-muted)';
  const colors: Record<string, string> = {
    math: '#6c63ff',
    mathematics: '#6c63ff',
    science: '#00d4aa',
    physics: '#00d4aa',
    chemistry: '#f59e0b',
    biology: '#22c55e',
    history: '#ef4444',
    english: '#ec4899',
    computer: '#3b82f6',
    economics: '#8b5cf6',
    literature: '#f97316',
    geography: '#14b8a6',
  };
  const key = subject.toLowerCase();
  for (const [k, v] of Object.entries(colors)) {
    if (key.includes(k)) return v;
  }
  return '#6c63ff';
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'var(--success)';
    case 'medium': return 'var(--warning)';
    case 'hard': return 'var(--error)';
    default: return 'var(--text-muted)';
  }
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// SM-2 Spaced Repetition Algorithm
export function sm2(card: Flashcard, quality: 0 | 1 | 2 | 3 | 4 | 5): Partial<Flashcard> {
  const q = quality;
  let { ease_factor, interval, repetitions } = card;

  if (q >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * ease_factor);
    repetitions += 1;
  } else {
    interval = 1;
    repetitions = 0;
  }

  ease_factor = Math.max(1.3, ease_factor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  return {
    ease_factor,
    interval,
    repetitions,
    next_review: addDays(new Date(), interval).toISOString(),
    last_quality: q,
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
