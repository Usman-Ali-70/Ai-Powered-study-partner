'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Clock, Trash2, Loader2 } from 'lucide-react';
import { FlashcardDeck } from '@/types';
import { formatRelativeTime, getSubjectColor } from '@/lib/utils';
import { SubjectBadge } from '@/components/shared/ConfidenceBadge';
import { useAppStore } from '@/store/useAppStore';
import { authedFetch } from '@/lib/api';
import { confirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import Link from 'next/link';

export function DeckCard({ deck }: { deck: FlashcardDeck }) {
  const deleteDeck = useAppStore((s) => s.deleteDeck);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirmDialog({
      title: 'Delete this deck?',
      message: `"${deck.title}" and all ${deck.card_count} cards inside it will be permanently removed.`,
      confirmLabel: 'Delete deck',
      variant: 'danger',
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await authedFetch(`/api/flashcards/${deck.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      deleteDeck(deck.id);
      toast.success('Deck deleted');
    } catch {
      toast.error('Failed to delete deck');
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
      <Link href={`/flashcards/${deck.id}`} className="block">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245, 158, 11, 0.12)' }}
            >
              <Layers size={18} style={{ color: '#f59e0b' }} />
            </div>
            <div className="min-w-0">
              <h3
                className="text-sm font-bold truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {deck.title}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {deck.card_count} cards
              </p>
            </div>
          </div>
          {deck.subject && (
            <SubjectBadge subject={deck.subject} color={getSubjectColor(deck.subject)} />
          )}
        </div>

        {deck.last_studied && (
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Clock size={12} />
            Last studied {formatRelativeTime(deck.last_studied)}
          </div>
        )}
      </Link>

      <button
        onClick={handleDelete}
        disabled={deleting}
        title="Delete deck"
        aria-label="Delete deck"
        className="absolute bottom-3 right-3 p-1.5 rounded-md md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--error)',
        }}
      >
        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>
    </motion.div>
  );
}
