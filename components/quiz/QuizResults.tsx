'use client';

import { motion } from 'framer-motion';
import { Check, X, Brain, Layers, ArrowLeft, RotateCcw } from 'lucide-react';
import { QuizQuestion, AnalyticsInsight } from '@/types';
import Link from 'next/link';

interface QuizResultsProps {
  questions: QuizQuestion[];
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  insight?: AnalyticsInsight | null;
  quizId: string;
}

export function QuizResults({
  questions,
  answers,
  score,
  totalQuestions,
  timeTaken,
  insight,
  quizId,
}: QuizResultsProps) {
  const percent = Math.round((score / totalQuestions) * 100);
  const circumference = 2 * Math.PI * 45;
  const strokeOffset = circumference - (circumference * percent) / 100;

  const getGrade = () => {
    if (percent >= 90) return { text: 'Excellent!', color: 'var(--success)' };
    if (percent >= 70) return { text: 'Good Job!', color: 'var(--accent-secondary)' };
    if (percent >= 50) return { text: 'Keep Studying', color: 'var(--warning)' };
    return { text: 'Needs Review', color: 'var(--error)' };
  };
  const grade = getGrade();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Score Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center mb-8"
        style={{ padding: '48px' }}
      >
        {/* Score Circle */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="4" />
            <motion.circle
              cx="50" cy="50" r="45" fill="none"
              stroke={grade.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeOffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-black"
              style={{ fontFamily: 'var(--font-display)', color: grade.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              {percent}%
            </motion.span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: grade.color }}>
          {grade.text}
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {score} out of {totalQuestions} correct ·{' '}
          {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')} elapsed
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <Link href={`/quiz/${quizId}`} className="btn-secondary text-sm">
            <RotateCcw size={14} /> Retake Quiz
          </Link>
          <Link href="/dashboard" className="btn-primary text-sm">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </motion.div>

      {/* AI Insights */}
      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card mb-8"
          style={{ borderColor: 'rgba(108, 99, 255, 0.3)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Brain size={18} style={{ color: 'var(--accent)' }} />
            <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              AI Analysis
            </h3>
          </div>
          {insight.weakAreas.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>WEAK AREAS</p>
              <div className="flex flex-wrap gap-2">
                {insight.weakAreas.map((area) => (
                  <span key={area} className="badge" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--error)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}>
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
          {insight.recommendations.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>RECOMMENDATIONS</p>
              <ul className="space-y-2">
                {insight.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent)' }}>•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Question Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Question Breakdown
        </h3>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const userAnswer = answers[q.id] || 'No answer';
            const isCorrect = userAnswer.toLowerCase().trim() === q.correct.toLowerCase().trim();
            return (
              <div key={q.id} className="card" style={{ padding: '16px 20px' }}>
                <div className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    }}
                  >
                    {isCorrect
                      ? <Check size={12} style={{ color: 'var(--success)' }} />
                      : <X size={12} style={{ color: 'var(--error)' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1">
                      Q{i + 1}: {q.question}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 text-xs">
                      <span style={{ color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
                        Your answer: {userAnswer}
                      </span>
                      {!isCorrect && (
                        <span style={{ color: 'var(--success)' }}>
                          Correct: {q.correct}
                        </span>
                      )}
                    </div>
                    {q.explanation && (
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
