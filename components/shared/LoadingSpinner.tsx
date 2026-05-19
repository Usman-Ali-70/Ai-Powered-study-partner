'use client';

import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 24, text }: { size?: number; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className="rounded-full border-2 border-[var(--border)]"
        style={{
          width: size,
          height: size,
          borderTopColor: 'var(--accent)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className="text-sm text-[var(--text-secondary)]">{text}</p>
      )}
    </div>
  );
}

export function AIThinkingLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-purple-600"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-purple-600"
          animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[var(--accent)]"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <p className="text-sm text-[var(--text-secondary)] font-medium">
        AI is thinking...
      </p>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size={32} text="Loading..." />
    </div>
  );
}
