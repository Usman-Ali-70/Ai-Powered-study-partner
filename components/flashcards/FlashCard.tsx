'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface FlashCardProps {
  front: string;
  back: string;
}

export function FlashCard({ front, back }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="cursor-pointer w-full max-w-xl mx-auto"
      style={{ perspective: '1200px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d', minHeight: '300px' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-8"
          style={{
            backfaceVisibility: 'hidden',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <span className="text-xs font-semibold mb-4 badge" style={{
            background: 'var(--accent-glow)',
            color: 'var(--accent)',
            border: '1px solid rgba(108, 99, 255, 0.2)',
          }}>
            QUESTION
          </span>
          <p
            className="text-xl md:text-2xl font-semibold text-center leading-relaxed"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {front}
          </p>
          <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
            Click or press Space to flip
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-8"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--accent)',
            boxShadow: '0 0 30px var(--accent-glow)',
          }}
        >
          <span className="text-xs font-semibold mb-4 badge" style={{
            background: 'rgba(0, 212, 170, 0.12)',
            color: 'var(--accent-secondary)',
            border: '1px solid rgba(0, 212, 170, 0.2)',
          }}>
            ANSWER
          </span>
          <p
            className="text-lg md:text-xl text-center leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
          >
            {back}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
