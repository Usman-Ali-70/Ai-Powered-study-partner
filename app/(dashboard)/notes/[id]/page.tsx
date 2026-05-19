'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Brain,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Trash2,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { AIChatPanel } from '@/components/notes/AIChatPanel';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { SubjectBadge } from '@/components/shared/ConfidenceBadge';
import { getSubjectColor, formatDate } from '@/lib/utils';
import { Note } from '@/types';
import { toast } from 'sonner';
import { authedFetch } from '@/lib/api';
import { confirmDialog } from '@/components/shared/ConfirmDialog';

export default function NoteDetailPage() {
  const params = useParams();
  const noteId = params.id as string;
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();
      if (data) setNote(data);
      setLoading(false);
    };
    fetchNote();
  }, [noteId]);

  const handleSummarize = async () => {
    if (!note) return;
    setSummarizing(true);
    try {
      const res = await authedFetch(`/api/notes/${noteId}/summarize`, {
        method: 'POST',
        body: JSON.stringify({ content: note.content }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setNote({ ...note, summary: data.summary });
      setSummaryOpen(true);
      toast.success('Summary generated!');
    } catch {
      toast.error('Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: 'Delete this note?',
      message: note
        ? `"${note.title}" will be permanently deleted, along with its summary, chats, and any quizzes or flashcards generated from it.`
        : 'This note will be permanently deleted.',
      confirmLabel: 'Delete note',
      variant: 'danger',
    });
    if (!ok) return;
    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    if (error) {
      toast.error('Failed to delete note');
      return;
    }
    toast.success('Note deleted');
    router.push('/notes');
  };

  if (loading) return <PageLoader />;
  if (!note) {
    return (
      <div className="text-center py-20">
        <p style={{ color: 'var(--text-secondary)' }}>Note not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
      {/* Note content side */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 flex flex-col min-w-0"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push('/notes')} className="btn-ghost text-sm">
            <ArrowLeft size={16} /> Back to Notes
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/quiz/generate?noteId=${noteId}`)}
              className="btn-secondary text-xs py-2 px-3"
            >
              <Brain size={14} /> Generate Quiz
            </button>
            <button
              onClick={handleSummarize}
              disabled={summarizing}
              className="btn-secondary text-xs py-2 px-3"
            >
              {summarizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {note.summary ? 'Re-Summarize' : 'Summarize'}
            </button>
            <button onClick={handleDelete} className="btn-ghost text-xs py-2 px-3" style={{ color: 'var(--error)' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Note header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              {note.title}
            </h1>
            {note.subject && (
              <SubjectBadge subject={note.subject} color={getSubjectColor(note.subject)} />
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {note.word_count ? `${note.word_count} words · ` : ''}
            Created {formatDate(note.created_at)}
          </p>
        </div>

        {/* Summary (collapsible) */}
        {note.summary && (
          <div
            className="card mb-4"
            style={{ borderColor: 'rgba(108, 99, 255, 0.3)' }}
          >
            <button
              onClick={() => setSummaryOpen(!summaryOpen)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  AI Summary
                </span>
              </div>
              {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {summaryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}
              >
                {note.summary}
              </motion.div>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className="card flex-1 overflow-y-auto"
          style={{ padding: '24px' }}
        >
          <div
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}
          >
            {note.content || 'No content available.'}
          </div>
        </div>
      </motion.div>

      {/* Chat panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-[400px] shrink-0 card p-0 overflow-hidden"
        style={{ height: showChat ? '100%' : 'auto' }}
      >
        {showChat && note.content && (
          <AIChatPanel noteId={noteId} noteContent={note.content} />
        )}
      </motion.div>
    </div>
  );
}
