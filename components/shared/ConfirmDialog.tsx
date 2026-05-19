'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export type ConfirmVariant = 'default' | 'danger';

export interface ConfirmOptions {
  title: string;
  message?: string;
  /** Label for the confirm button. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Label for the cancel button. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Visual style. "danger" paints the confirm button red. */
  variant?: ConfirmVariant;
  /**
   * If set, the user must type this exact string to enable the confirm button.
   * Useful for destructive actions (e.g. requireType="DELETE").
   */
  requireType?: string;
}

interface InternalState extends ConfirmOptions {
  open: boolean;
  resolve?: (result: boolean) => void;
}

interface ConfirmStore extends InternalState {
  show: (opts: ConfirmOptions) => Promise<boolean>;
  close: (result: boolean) => void;
}

const useConfirmStore = create<ConfirmStore>((set, get) => ({
  open: false,
  title: '',
  message: '',
  show: (opts) =>
    new Promise<boolean>((resolve) => {
      set({
        open: true,
        title: opts.title,
        message: opts.message,
        confirmLabel: opts.confirmLabel,
        cancelLabel: opts.cancelLabel,
        variant: opts.variant ?? 'default',
        requireType: opts.requireType,
        resolve,
      });
    }),
  close: (result) => {
    const { resolve } = get();
    resolve?.(result);
    set({ open: false, resolve: undefined, requireType: undefined });
  },
}));

/** Promise-based confirm. Resolves to true if the user confirms, false otherwise. */
export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().show(opts);
}

/** Mount once at the app root. Renders the active confirm modal, if any. */
export function ConfirmDialogHost() {
  const { open, title, message, confirmLabel, cancelLabel, variant, requireType, close } =
    useConfirmStore();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  // Reset typed text whenever a new dialog opens
  useEffect(() => {
    if (open) {
      setTyped('');
      setBusy(false);
    }
  }, [open]);

  // ESC closes; Enter confirms (when type-to-confirm passes)
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(false);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        if (requireType && typed !== requireType) return;
        e.preventDefault();
        setBusy(true);
        close(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, close, requireType, typed]);

  const isDanger = variant === 'danger';
  const typeOk = !requireType || typed === requireType;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={() => !busy && close(false)}
        >
          <motion.div
            key="confirm-card"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="card w-full max-w-md relative"
            style={{ padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
          >
            <button
              onClick={() => !busy && close(false)}
              className="absolute top-3 right-3 btn-ghost p-1.5"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3 mb-3 pr-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: isDanger
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'var(--accent-glow)',
                  color: isDanger ? 'var(--error)' : 'var(--accent)',
                }}
              >
                {isDanger ? <AlertTriangle size={20} /> : <Trash2 size={20} />}
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  id="confirm-title"
                  className="text-base font-bold leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {title}
                </h3>
                {message && (
                  <p
                    id="confirm-message"
                    className="text-sm mt-1.5 leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {message}
                  </p>
                )}
              </div>
            </div>

            {requireType && (
              <div className="mt-4">
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Type{' '}
                  <span
                    className="font-mono font-bold"
                    style={{ color: 'var(--error)' }}
                  >
                    {requireType}
                  </span>{' '}
                  to confirm
                </label>
                <input
                  autoFocus
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  className="input"
                  placeholder={requireType}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: `1px solid ${typeOk && typed ? 'var(--error)' : 'transparent'}`,
                  }}
                />
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-5">
              <button
                onClick={() => !busy && close(false)}
                disabled={busy}
                className="btn-secondary text-sm"
              >
                {cancelLabel ?? 'Cancel'}
              </button>
              <button
                onClick={() => {
                  if (!typeOk || busy) return;
                  setBusy(true);
                  close(true);
                }}
                disabled={!typeOk || busy}
                className="text-sm inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[10px] font-semibold transition-all"
                style={{
                  background: isDanger
                    ? 'linear-gradient(135deg, var(--error), #c83838)'
                    : 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                  color: 'white',
                  opacity: !typeOk || busy ? 0.5 : 1,
                  cursor: !typeOk || busy ? 'not-allowed' : 'pointer',
                  boxShadow: isDanger
                    ? '0 4px 16px rgba(239, 68, 68, 0.25)'
                    : '0 4px 16px var(--accent-glow)',
                }}
              >
                {busy && <Loader2 size={14} className="animate-spin" />}
                {confirmLabel ?? (isDanger ? 'Delete' : 'Confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
