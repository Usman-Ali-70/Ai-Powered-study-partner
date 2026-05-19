'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock, TrendingUp, Trash2, Loader2 } from 'lucide-react';
import { Quiz } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { ConfidenceBadge } from '@/components/shared/ConfidenceBadge';
import { useAppStore } from '@/store/useAppStore';
import { authedFetch } from '@/lib/api';
import { confirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import Link from 'next/link';

export function QuizCard({ quiz }: { quiz: Quiz }) {
  const deleteQuiz = useAppStore((s) => s.deleteQuiz);
  const [deleting, setDeleting] = useState(false);

  const scorePercent =
    quiz.score !== null && quiz.score !== undefined
      ? Math.round((quiz.score / quiz.total_questions) * 100)
      : null;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirmDialog({
      title: 'Delete this quiz?',
      message: `"${quiz.title}" and your attempt history will be permanently removed.`,
      confirmLabel: 'Delete quiz',
      variant: 'danger',
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await authedFetch(`/api/quiz/${quiz.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      deleteQuiz(quiz.id);
      toast.success('Quiz deleted');
    } catch {
      toast.error('Failed to delete quiz');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card cursor-pointer group relative"
    >
      <Link href={`/quiz/${quiz.id}`} className="block">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0, 212, 170, 0.12)' }}
            >
              <Brain size={18} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div className="min-w-0">
              <h3
                className="text-sm font-bold truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
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
              <TrendingUp
                size={14}
                style={{
                  color:
                    scorePercent >= 70
                      ? 'var(--success)'
                      : scorePercent >= 50
                        ? 'var(--warning)'
                        : 'var(--error)',
                }}
              />
              <span
                className="text-sm font-bold"
                style={{
                  color:
                    scorePercent >= 70
                      ? 'var(--success)'
                      : scorePercent >= 50
                        ? 'var(--warning)'
                        : 'var(--error)',
                }}
              >
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
                {Math.floor(quiz.time_taken_seconds / 60)}:
                {(quiz.time_taken_seconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Delete quiz"
        aria-label="Delete quiz"
        className="absolute bottom-3 right-3 p-1.5 rounded-md md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--error)',
        }}
      >
        {deleting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
      </button>
    </motion.div>
  );
}
