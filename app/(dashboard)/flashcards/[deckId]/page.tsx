'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { FlashCard } from '@/components/flashcards/FlashCard';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Flashcard, FlashcardDeck } from '@/types';
import { sm2 } from '@/lib/utils';
import { toast } from 'sonner';

const ratingButtons = [
  { quality: 1 as const, label: 'Again', color: 'var(--error)', key: '1' },
  { quality: 2 as const, label: 'Hard', color: 'var(--warning)', key: '2' },
  { quality: 4 as const, label: 'Good', color: 'var(--accent-secondary)', key: '3' },
  { quality: 5 as const, label: 'Easy', color: 'var(--success)', key: '4' },
];

export default function FlashcardStudyPage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const router = useRouter();
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [studied, setStudied] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: deckData } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('id', deckId)
        .single();
      if (deckData) setDeck(deckData);

      const { data: cardsData } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId)
        .order('next_review', { ascending: true });
      if (cardsData) setCards(cardsData);

      setLoading(false);
    };
    fetchData();
  }, [deckId]);

  const handleRate = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    const card = cards[currentIndex];
    if (!card) return;

    const updates = sm2(card, quality);
    await supabase
      .from('flashcards')
      .update(updates)
      .eq('id', card.id);

    // Update deck last_studied
    await supabase
      .from('flashcard_decks')
      .update({ last_studied: new Date().toISOString() })
      .eq('id', deckId);

    setStudied((s) => s + 1);
    setIsFlipped(false);

    if (currentIndex + 1 >= cards.length) {
      setCompleted(true);
    } else {
      setTimeout(() => setCurrentIndex((i) => i + 1), 200);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      setIsFlipped((f) => !f);
    }
    if (isFlipped) {
      const keyMap: Record<string, 0 | 1 | 2 | 3 | 4 | 5> = { '1': 1, '2': 2, '3': 4, '4': 5 };
      if (keyMap[e.key] !== undefined) handleRate(keyMap[e.key]);
    }
  }, [isFlipped, currentIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (loading) return <PageLoader />;
  if (!deck || cards.length === 0) {
    return (
      <div className="text-center py-20">
        <p style={{ color: 'var(--text-secondary)' }}>No cards found in this deck.</p>
        <button onClick={() => router.push('/flashcards')} className="btn-secondary mt-4">
          <ArrowLeft size={16} /> Back to Decks
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center py-16"
      >
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(34, 197, 94, 0.12)' }}
        >
          <Check size={32} style={{ color: 'var(--success)' }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Session Complete!
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          You studied {studied} cards from &ldquo;{deck.title}&rdquo;
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setCompleted(false);
              setStudied(0);
            }}
            className="btn-secondary"
          >
            <RotateCcw size={16} /> Study Again
          </button>
          <button onClick={() => router.push('/flashcards')} className="btn-primary">
            Back to Decks
          </button>
        </div>
      </motion.div>
    );
  }

  const card = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.push('/flashcards')} className="btn-ghost text-sm">
          <ArrowLeft size={16} /> {deck.title}
        </button>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full mb-8" style={{ background: 'var(--bg-elevated)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #f59e0b, var(--accent-secondary))' }}
          animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="mb-8">
        <FlashCard front={card.front} back={card.back} />
      </div>

      {/* Rating buttons (show after flip) */}
      <div className="flex items-center justify-center gap-3">
        {ratingButtons.map((btn) => (
          <button
            key={btn.quality}
            onClick={() => handleRate(btn.quality)}
            className="py-3 px-6 rounded-xl text-sm font-bold border transition-all hover:scale-105"
            style={{
              background: `${btn.color}12`,
              borderColor: `${btn.color}30`,
              color: btn.color,
            }}
          >
            {btn.label}
            <span className="block text-[10px] font-normal mt-0.5 opacity-60">
              Press {btn.key}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
        Space to flip · 1-4 to rate
      </p>
    </div>
  );
}
