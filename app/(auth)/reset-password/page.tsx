'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Sparkles, Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

const KnowledgeNet = dynamic(
  () => import('@/components/landing/KnowledgeNet').then((m) => m.KnowledgeNet),
  { ssr: false },
);

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/update`,
      });
      if (error) throw error;
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-canvas">
        <KnowledgeNet />
      </div>
      <div className="auth-bg-glow" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="auth-card"
      >
        <Link href="/" className="auth-brand">
          <div className="auth-brand-icon">
            <Sparkles size={20} />
          </div>
          <span className="auth-brand-name">StudyMind AI</span>
        </Link>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(34, 197, 94, 0.1)' }}
            >
              <CheckCircle size={32} style={{ color: 'var(--success)' }} />
            </div>
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-subtitle">
              We sent a password reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              Click the link in the email to reset your password.
            </p>
            <Link href="/login" className="auth-submit" style={{ display: 'inline-flex', textDecoration: 'none' }}>
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </motion.div>
        ) : (
          <>
            <h1 className="auth-title">Reset password</h1>
            <p className="auth-subtitle">
              Enter your email and we&apos;ll send you a reset link
            </p>

            <form onSubmit={handleReset}>
              <div className="auth-field">
                <label>Email</label>
                <div className="auth-input-wrap">
                  <Mail size={16} className="leading" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <p className="auth-foot">
              Remember your password? <Link href="/login">Sign in</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
