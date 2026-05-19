'use client';

import { motion } from 'framer-motion';
import { FileText, MessageSquare, Brain, Layers, Calendar } from 'lucide-react';
import { Note } from '@/types';
import { formatRelativeTime, getSubjectColor, truncate } from '@/lib/utils';
import { SubjectBadge } from '@/components/shared/ConfidenceBadge';
import Link from 'next/link';

interface NoteCardProps {
  note: Note;
  onChat?: () => void;
  onQuiz?: () => void;
  onFlashcards?: () => void;
}

export function NoteCard({ note, onChat, onQuiz, onFlashcards }: NoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card group"
    >
      <Link href={`/notes/${note.id}`} className="block">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--accent-glow)' }}
            >
              <FileText size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {note.title}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {note.word_count ? `${note.word_count} words · ` : ''}
                {note.source_type === 'pdf' ? 'PDF' : note.source_type === 'paste' ? 'Pasted' : 'Manual'}
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
      <div className="flex items-center gap-1.5 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onChat?.(); }}
          className="btn-ghost text-xs py-1.5 px-2.5"
          title="Chat with AI"
        >
          <MessageSquare size={14} /> Chat
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onQuiz?.(); }}
          className="btn-ghost text-xs py-1.5 px-2.5"
          title="Generate Quiz"
        >
          <Brain size={14} /> Quiz
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onFlashcards?.(); }}
          className="btn-ghost text-xs py-1.5 px-2.5"
          title="Generate Flashcards"
        >
          <Layers size={14} /> Cards
        </button>
      </div>
    </motion.div>
  );
}
