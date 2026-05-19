'use client';

import { motion } from 'framer-motion';
import { Layers, Clock } from 'lucide-react';
import { FlashcardDeck } from '@/types';
import { formatRelativeTime, getSubjectColor } from '@/lib/utils';
import { SubjectBadge } from '@/components/shared/ConfidenceBadge';
import Link from 'next/link';

export function DeckCard({ deck }: { deck: FlashcardDeck }) {
  return (
    <Link href={`/flashcards/${deck.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card cursor-pointer group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245, 158, 11, 0.12)' }}
            >
              <Layers size={18} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
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
      </motion.div>
    </Link>
  );
}
