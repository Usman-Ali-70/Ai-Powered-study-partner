'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Plus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase/client';
import { QuizCard } from '@/components/quiz/QuizCard';
import { EmptyState } from '@/components/shared/EmptyState';
import Link from 'next/link';

export default function QuizListPage() {
  const { user, quizzes, setQuizzes } = useAppStore();

  useEffect(() => {
    if (!user?.id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setQuizzes(data);
    };
    fetch();
  }, [user?.id, setQuizzes]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Quizzes
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Test your knowledge with AI-generated quizzes
          </p>
        </div>
        <Link href="/quiz/generate" className="btn-primary text-sm shrink-0 w-full sm:w-auto">
          <Plus size={16} /> New Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No quizzes yet"
          description="Generate your first quiz from your notes to test your knowledge."
          action={{ label: 'Generate Quiz', onClick: () => {} }}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
