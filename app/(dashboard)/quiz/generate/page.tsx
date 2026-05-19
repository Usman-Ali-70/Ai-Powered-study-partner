'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Sparkles, FileText, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase/client';
import { AIThinkingLoader } from '@/components/shared/LoadingSpinner';
import { Note, Difficulty, QuestionType } from '@/types';
import { toast } from 'sonner';
import { authedFetch } from '@/lib/api';

export default function QuizGeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedNoteId = searchParams.get('noteId');
  const { user } = useAppStore();

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState(preselectedNoteId || '');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['mcq']);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchNotes = async () => {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setNotes(data);
    };
    fetchNotes();
  }, [user?.id]);

  const toggleType = (type: QuestionType) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (!selectedNoteId) {
      toast.error('Please select a note');
      return;
    }
    if (questionTypes.length === 0) {
      toast.error('Select at least one question type');
      return;
    }
    setGenerating(true);
    try {
      const res = await authedFetch('/api/quiz/generate', {
        method: 'POST',
        body: JSON.stringify({
          noteId: selectedNoteId,
          difficulty,
          questionCount,
          questionTypes,
        }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      toast.success('Quiz generated!');
      router.push(`/quiz/${data.quiz.id}`);
    } catch {
      toast.error('Failed to generate quiz. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AIThinkingLoader />
        <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          Generating {questionCount} {difficulty} questions...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Generate Quiz
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Create an AI-powered quiz from your notes
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Select Note */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={16} style={{ color: 'var(--accent)' }} />
            <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              1. Select Source Note
            </h3>
          </div>
          {notes.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No notes found. Create notes first to generate quizzes.
            </p>
          ) : (
            <select
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              className="input"
            >
              <option value="">Choose a note...</option>
              {notes.map((note) => (
                <option key={note.id} value={note.id}>
                  {note.title} {note.subject ? `(${note.subject})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Step 2: Configure */}
        <div className="card" style={{ padding: '24px' }}>
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} style={{ color: 'var(--accent-secondary)' }} />
            <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              2. Configure Quiz
            </h3>
          </div>

          {/* Difficulty */}
          <div className="mb-5">
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Difficulty
            </label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all"
                  style={{
                    background: difficulty === d ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                    borderColor: difficulty === d ? 'var(--accent)' : 'var(--border)',
                    color: difficulty === d ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="mb-5">
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Number of Questions
            </label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all"
                  style={{
                    background: questionCount === n ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                    borderColor: questionCount === n ? 'var(--accent)' : 'var(--border)',
                    color: questionCount === n ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Question Types */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Question Types
            </label>
            <div className="flex gap-2 flex-wrap">
              {([
                { value: 'mcq' as QuestionType, label: 'Multiple Choice' },
                { value: 'true_false' as QuestionType, label: 'True / False' },
                { value: 'short_answer' as QuestionType, label: 'Short Answer' },
              ]).map((t) => (
                <button
                  key={t.value}
                  onClick={() => toggleType(t.value)}
                  className="py-2 px-4 rounded-lg text-sm font-medium border transition-all"
                  style={{
                    background: questionTypes.includes(t.value) ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                    borderColor: questionTypes.includes(t.value) ? 'var(--accent)' : 'var(--border)',
                    color: questionTypes.includes(t.value) ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={!selectedNoteId || questionTypes.length === 0}
          className="btn-primary w-full py-3.5 text-base"
        >
          <Sparkles size={18} />
          Generate Quiz with AI
        </button>
      </div>
    </div>
  );
}
