'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

const KnowledgeNet = dynamic(
  () => import('@/components/landing/KnowledgeNet').then((m) => m.KnowledgeNet),
  { ssr: false },
);

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      // 1. Create the account
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (signUpError) throw signUpError;

      // 2. Immediately sign in so we land in /dashboard with a session.
      //    Works only if "Confirm email" is OFF in Supabase Auth settings.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        // Most likely cause: email confirmation is still required.
        // Tell the user clearly and bail.
        toast.error(signInError.message);
        return;
      }

      toast.success('Welcome to StudyMind AI!');
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Signup failed');
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start your AI-powered study journey</p>

        <form onSubmit={handleSignup}>
          <div className="auth-field">
            <label>Full name</label>
            <div className="auth-input-wrap">
              <User size={16} className="leading" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          </div>

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

          <div className="auth-field">
            <label>Password</label>
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

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Creating account...
              </>
            ) : (
              <>
                Create account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="auth-foot">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
