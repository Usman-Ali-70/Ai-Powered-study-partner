'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { QuizQuestion } from '@/types';
import { formatSeconds } from '@/lib/utils';

interface QuizSessionProps {
  questions: QuizQuestion[];
  onComplete: (answers: Record<string, string>, timeTaken: number) => void;
}

export function QuizSession({ questions, onComplete }: QuizSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedOption(answers[question?.id] || null);
  }, [currentIndex, answers, question?.id]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (question?.type === 'mcq' && question.options) {
      const keys: Record<string, number> = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
      if (keys[e.key.toLowerCase()] !== undefined) {
        const option = question.options[keys[e.key.toLowerCase()]];
        if (option) {
          setSelectedOption(option);
          setAnswers((prev) => ({ ...prev, [question.id]: option }));
        }
      }
    }
    if (e.key === 'ArrowRight' && selectedOption && !isLastQuestion) {
      setCurrentIndex((i) => i + 1);
    }
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
    if (e.key === 'Enter' && selectedOption && isLastQuestion) {
      onComplete(answers, timer);
    }
  }, [question, selectedOption, currentIndex, isLastQuestion, answers, timer, onComplete]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const selectOption = (option: string) => {
    setSelectedOption(option);
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  };

  if (!question) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-1.5 badge" style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}>
          <Clock size={12} />
          {formatSeconds(timer)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full mb-8" style={{ background: 'var(--bg-elevated)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-secondary))' }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <div className="card mb-6" style={{ padding: '32px' }}>
            <p
              className="text-lg md:text-xl font-semibold leading-relaxed"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {question.question}
            </p>
          </div>

          {/* Options */}
          {question.type !== 'short_answer' && question.options && (
            <div className="space-y-3 mb-6">
              {question.options.map((option, i) => {
                const isSelected = selectedOption === option;
                const letter = String.fromCharCode(65 + i);
                return (
                  <motion.button
                    key={option}
                    onClick={() => selectOption(option)}
                    className="w-full text-left rounded-xl p-4 flex items-center gap-4 border transition-all"
                    style={{
                      background: isSelected ? 'var(--accent-glow)' : 'var(--bg-card)',
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        background: isSelected ? 'var(--accent)' : 'var(--bg-elevated)',
                        color: isSelected ? 'white' : 'var(--text-secondary)',
                      }}
                    >
                      {isSelected ? <Check size={14} /> : letter}
                    </span>
                    <span className="text-sm font-medium">{option}</span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Short answer */}
          {question.type === 'short_answer' && (
            <div className="mb-6">
              <input
                value={selectedOption || ''}
                onChange={(e) => selectOption(e.target.value)}
                className="input text-base"
                placeholder="Type your answer..."
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
          className="btn-secondary"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={() => onComplete(answers, timer)}
            disabled={!selectedOption}
            className="btn-primary"
          >
            Submit Quiz <Check size={16} />
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            disabled={!selectedOption}
            className="btn-primary"
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
        Press A/B/C/D to select • ← → to navigate • Enter to submit
      </p>
    </div>
  );
}
