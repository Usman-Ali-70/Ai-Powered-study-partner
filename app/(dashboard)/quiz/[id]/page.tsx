'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { QuizSession } from '@/components/quiz/QuizSession';
import { QuizResults } from '@/components/quiz/QuizResults';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Quiz, AnalyticsInsight } from '@/types';
import { toast } from 'sonner';
import { authedFetch } from '@/lib/api';

export default function QuizSessionPage() {
  const params = useParams();
  const quizId = params.id as string;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<{
    answers: Record<string, string>;
    score: number;
    timeTaken: number;
    insight: AnalyticsInsight | null;
  } | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      const { data } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();
      if (data) {
        setQuiz(data);
        if (data.score !== null && data.score !== undefined) {
          setCompleted(true);
          setResults({
            answers: {},
            score: data.score,
            timeTaken: data.time_taken_seconds || 0,
            insight: null,
          });
        }
      }
      setLoading(false);
    };
    fetchQuiz();
  }, [quizId]);

  const handleComplete = async (answers: Record<string, string>, timeTaken: number) => {
    if (!quiz) return;

    // Calculate score
    let score = 0;
    const questions = quiz.questions;
    questions.forEach((q) => {
      const userAnswer = answers[q.id]?.toLowerCase().trim();
      const correct = q.correct.toLowerCase().trim();
      if (userAnswer === correct) score++;
    });

    // Save to DB
    const { error: dbError } = await supabase
      .from('quizzes')
      .update({
        score,
        time_taken_seconds: timeTaken,
        completed_at: new Date().toISOString(),
      })
      .eq('id', quizId);

    if (dbError) {
      console.warn('Initial quiz save failed, attempting fallback without time tracking column...', dbError);
      // Fallback: if table doesn't have the time_taken_seconds column, save score and completed_at only
      const { error: fallbackError } = await supabase
        .from('quizzes')
        .update({
          score,
          completed_at: new Date().toISOString(),
        })
        .eq('id', quizId);

      if (fallbackError) {
        console.error('Quiz save failed in fallback:', fallbackError);
        toast.error('Failed to save quiz score: ' + fallbackError.message);
      } else {
        toast.success(`Quiz completed! Score saved successfully.`);
      }
    } else {
      toast.success(`Quiz completed! Score: ${score}/${questions.length}`);
    }

    // Get AI insight for wrong answers
    let insight: AnalyticsInsight | null = null;
    const wrongAnswers = questions
      .filter((q) => {
        const a = answers[q.id]?.toLowerCase().trim();
        return a !== q.correct.toLowerCase().trim();
      })
      .map((q) => ({
        question: q.question,
        topic: q.topic,
        userAnswer: answers[q.id] || 'No answer',
        correct: q.correct,
      }));

    if (wrongAnswers.length > 0) {
      try {
        const res = await authedFetch('/api/quiz/submit', {
          method: 'POST',
          body: JSON.stringify({ wrongAnswers }),
        });
        if (res.ok) {
          insight = await res.json();
        }
      } catch {
        // Non-critical
      }
    }

    setResults({ answers, score, timeTaken, insight });
    setCompleted(true);
  };

  if (loading) return <PageLoader />;
  if (!quiz) {
    return (
      <div className="text-center py-20">
        <p style={{ color: 'var(--text-secondary)' }}>Quiz not found</p>
      </div>
    );
  }

  if (completed && results) {
    return (
      <QuizResults
        questions={quiz.questions}
        answers={results.answers}
        score={results.score}
        totalQuestions={quiz.total_questions}
        timeTaken={results.timeTaken}
        insight={results.insight}
        quizId={quizId}
      />
    );
  }

  return <QuizSession questions={quiz.questions} onComplete={handleComplete} />;
}
