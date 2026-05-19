'use client';

import { motion } from 'framer-motion';
import { Brain, Clock, TrendingUp } from 'lucide-react';
import { Quiz } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { ConfidenceBadge } from '@/components/shared/ConfidenceBadge';
import Link from 'next/link';

export function QuizCard({ quiz }: { quiz: Quiz }) {
  const scorePercent = quiz.score !== null && quiz.score !== undefined
    ? Math.round((quiz.score / quiz.total_questions) * 100)
    : null;

  return (
    <Link href={`/quiz/${quiz.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card cursor-pointer group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0, 212, 170, 0.12)' }}
            >
              <Brain size={18} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                {quiz.title}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {quiz.total_questions} questions · {formatRelativeTime(quiz.created_at)}
              </p>
            </div>
          </div>
          <ConfidenceBadge difficulty={quiz.difficulty} />
        </div>

        <div className="flex items-center gap-4">
          {scorePercent !== null ? (
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} style={{
                color: scorePercent >= 70 ? 'var(--success)' : scorePercent >= 50 ? 'var(--warning)' : 'var(--error)'
              }} />
              <span className="text-sm font-bold" style={{
                color: scorePercent >= 70 ? 'var(--success)' : scorePercent >= 50 ? 'var(--warning)' : 'var(--error)'
              }}>
                {scorePercent}%
              </span>
            </div>
          ) : (
            <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
              Not started
            </span>
          )}
          {quiz.time_taken_seconds && (
            <div className="flex items-center gap-1">
              <Clock size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {Math.floor(quiz.time_taken_seconds / 60)}:{(quiz.time_taken_seconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
