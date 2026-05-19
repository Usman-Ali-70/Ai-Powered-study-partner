'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'var(--accent-glow)' }}
      >
        <Icon size={28} color="var(--accent)" />
      </div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h3>
      <p className="text-sm max-w-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
      {action && (
        <button className="btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
