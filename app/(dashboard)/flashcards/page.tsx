'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase/client';
import { DeckCard } from '@/components/flashcards/DeckCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { useSearchParams, useRouter } from 'next/navigation';
import { AIThinkingLoader } from '@/components/shared/LoadingSpinner';
import { Note } from '@/types';
import { toast } from 'sonner';
import { authedFetch } from '@/lib/api';

export default function FlashcardsPage() {
  const { user, decks, setDecks } = useAppStore();
  const searchParams = useSearchParams();
  const generateFromNote = searchParams.get('generate');
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      const { data: deckData } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (deckData) setDecks(deckData);

      const { data: noteData } = await supabase
        .from('notes')
        .select('id, title, subject')
        .eq('user_id', user.id);
      if (noteData) setNotes(noteData as Note[]);
    };
    fetchData();
  }, [user?.id, setDecks]);

  useEffect(() => {
    if (generateFromNote) {
      setSelectedNoteId(generateFromNote);
      handleGenerate(generateFromNote);
    }
  }, [generateFromNote]);

  const handleGenerate = async (noteId?: string) => {
    const id = noteId || selectedNoteId;
    if (!id) {
      toast.error('Please select a note');
      return;
    }
    setGenerating(true);
    setShowGenerate(false);
    try {
      const res = await authedFetch('/api/flashcards/generate', {
        method: 'POST',
        body: JSON.stringify({ noteId: id }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      toast.success(`Created deck with ${data.deck.card_count} cards!`);
      router.push(`/flashcards/${data.deck.id}`);
    } catch {
      toast.error('Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AIThinkingLoader />
        <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          Creating flashcards from your notes...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Flashcards
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Study with AI-generated flashcard decks
          </p>
        </div>
        <button onClick={() => setShowGenerate(true)} className="btn-primary text-sm">
          <Sparkles size={16} /> Generate Deck
        </button>
      </div>

      {/* Generate modal */}
      {showGenerate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowGenerate(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="card w-full max-w-md"
            style={{ padding: '32px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Generate Flashcards
            </h2>
            <select
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              className="input mb-4"
            >
              <option value="">Select a note...</option>
              {notes.map((n) => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
            <button
              onClick={() => handleGenerate()}
              disabled={!selectedNoteId}
              className="btn-primary w-full"
            >
              <Sparkles size={16} /> Generate
            </button>
          </motion.div>
        </motion.div>
      )}

      {decks.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No flashcard decks"
          description="Generate flashcards from your notes to start studying with spaced repetition."
          action={{ label: 'Generate Flashcards', onClick: () => setShowGenerate(true) }}
        />
      ) : (
        <motion.div
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
