'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Brain, Layers, Trash2, Loader2 } from 'lucide-react';
import { Note } from '@/types';
import { formatRelativeTime, getSubjectColor, truncate } from '@/lib/utils';
import { SubjectBadge } from '@/components/shared/ConfidenceBadge';
import { useAppStore } from '@/store/useAppStore';
import { authedFetch } from '@/lib/api';
import { confirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import Link from 'next/link';

interface NoteCardProps {
  note: Note;
  onChat?: () => void;
  onQuiz?: () => void;
  onFlashcards?: () => void;
}

export function NoteCard({ note, onChat, onQuiz, onFlashcards }: NoteCardProps) {
  const deleteNote = useAppStore((s) => s.deleteNote);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirmDialog({
      title: 'Delete this note?',
      message: `"${note.title}" will be permanently deleted, along with any chats, quizzes, and flashcards generated from it.`,
      confirmLabel: 'Delete note',
      variant: 'danger',
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await authedFetch(`/api/notes/${note.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      deleteNote(note.id);
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card group relative"
    >
      <Link href={`/notes/${note.id}`} className="block">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--accent-glow)' }}
            >
              <FileText size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="min-w-0">
              <h3
                className="text-sm font-bold leading-tight truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {note.title}
              </h3>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {note.word_count ? `${note.word_count} words · ` : ''}
                {note.source_type === 'pdf'
                  ? 'Doc'
                  : note.source_type === 'paste'
                    ? 'Pasted'
                    : 'Manual'}
                {' · '}
                {formatRelativeTime(note.created_at)}
              </p>
            </div>
          </div>
          {note.subject && (
            <SubjectBadge subject={note.subject} color={getSubjectColor(note.subject)} />
          )}
        </div>

        {note.content && (
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            {truncate(note.content, 120)}
          </p>
        )}
      </Link>

      {/* Actions */}
      <div
        className="flex items-center gap-1 pt-3 border-t flex-wrap"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChat?.();
          }}
          className="btn-ghost text-xs py-1.5 px-2.5"
          title="Chat with AI"
        >
          <MessageSquare size={14} /> Chat
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuiz?.();
          }}
          className="btn-ghost text-xs py-1.5 px-2.5"
          title="Generate Quiz"
        >
          <Brain size={14} /> Quiz
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFlashcards?.();
          }}
          className="btn-ghost text-xs py-1.5 px-2.5"
          title="Generate Flashcards"
        >
          <Layers size={14} /> Cards
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-ghost text-xs py-1.5 px-2.5 ml-auto"
          title="Delete note"
          style={{ color: 'var(--error)' }}
        >
          {deleting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>
    </motion.div>
  );
}
