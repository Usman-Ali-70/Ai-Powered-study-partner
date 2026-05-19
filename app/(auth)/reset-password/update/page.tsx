'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

const KnowledgeNet = dynamic(
  () => import('@/components/landing/KnowledgeNet').then((m) => m.KnowledgeNet),
  { ssr: false },
);

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User arrived via recovery link — form is ready
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success('Password updated successfully!');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
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

        {done ? (
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
            <h1 className="auth-title">Password updated!</h1>
            <p className="auth-subtitle">Redirecting you to the dashboard...</p>
          </motion.div>
        ) : (
          <>
            <h1 className="auth-title">Set new password</h1>
            <p className="auth-subtitle">Enter your new password below</p>

            <form onSubmit={handleUpdate}>
              <div className="auth-field">
                <label>New Password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} className="leading" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="trailing"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label>Confirm Password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} className="leading" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
