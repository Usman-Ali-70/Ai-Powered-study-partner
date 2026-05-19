'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authedFetch } from '@/lib/api';

interface NoteEditorProps {
  onClose: () => void;
  onSave: (note: { id: string; title: string }) => void;
}

export function NoteEditor({ onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }
    setSaving(true);
    try {
      const res = await authedFetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          subject: subject.trim() || null,
          source_type: 'manual',
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      toast.success('Note created!');
      onSave(data.note);
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="card w-full max-w-2xl max-h-[85vh] flex flex-col"
          style={{ padding: '32px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Create Note
            </h2>
            <button onClick={onClose} className="btn-ghost p-2">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-auto">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g. Chapter 5 — Thermodynamics"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Subject (optional)
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input"
                placeholder="e.g. Physics, History, etc."
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input min-h-[200px] resize-y"
                placeholder="Paste or type your lecture notes here..."
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full mt-6"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Note
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
