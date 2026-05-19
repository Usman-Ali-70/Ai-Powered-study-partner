'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  LogOut,
  KeyRound,
  Loader2,
  Sparkles,
  Thermometer,
  Type,
  Clock,
  Trash2,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useChatStore } from '@/store/useChatStore';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, setUser } = useAppStore();
  const { settings, updateSettings, clearAllConversations, conversations } = useChatStore();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const handleSendReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      toast.success('Password reset email sent');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setSendingReset(false);
    }
  };

  const handleClearHistory = () => {
    if (!confirm(`Delete all ${conversations.length} conversations? This cannot be undone.`)) return;
    clearAllConversations();
    toast.success('All conversations cleared');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Manage your account and AI preferences
        </p>
      </div>

      {/* Account */}
      <div className="card mb-6 p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} style={{ color: 'var(--accent)' }} />
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Account
          </h3>
        </div>
        <div className="flex items-start gap-4 mb-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              color: 'white',
              fontFamily: 'var(--font-display)',
            }}
          >
            {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold truncate">
              {user?.full_name || 'No name set'}
            </p>
            <p className="text-xs flex items-center gap-1 mt-1" style={{ color: 'var(--text-muted)' }}>
              <Mail size={12} />
              <span className="truncate">{user?.email || '—'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div className="card mb-6 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={16} style={{ color: 'var(--accent)' }} />
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            AI Settings
          </h3>
        </div>

        {/* Model selector */}
        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: 'var(--accent-secondary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Model</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Flash is faster, Pro is smarter
            </p>
          </div>
          <select
            value={settings.model}
            onChange={(e) => updateSettings({ model: e.target.value as 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768' })}
            className="settings-select"
          >
            <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile)</option>
            <option value="llama-3.1-8b-instant">Llama 3.1 8B (Instant)</option>
            <option value="mixtral-8x7b-32768">Mixtral 8x7B (MoE)</option>
          </select>
        </div>

        {/* Temperature */}
        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center gap-2">
              <Thermometer size={14} style={{ color: 'var(--warning)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Temperature</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Higher = more creative, lower = more precise
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
              className="settings-slider"
            />
            <span className="text-xs font-mono w-8 text-right" style={{ color: 'var(--text-muted)' }}>
              {settings.temperature.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Font size */}
        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <Type size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Chat font size</span>
          </div>
          <select
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: e.target.value as 'sm' | 'base' | 'lg' })}
            className="settings-select"
          >
            <option value="sm">Small</option>
            <option value="base">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>

        {/* Timestamps */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Clock size={14} style={{ color: 'var(--accent-secondary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Show timestamps</span>
          </div>
          <button
            onClick={() => updateSettings({ showTimestamps: !settings.showTimestamps })}
            className={`settings-toggle ${settings.showTimestamps ? 'settings-toggle--on' : ''}`}
          />
        </div>
      </div>

      {/* Security */}
      <div className="card mb-6 p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound size={16} style={{ color: 'var(--accent-secondary)' }} />
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Security
          </h3>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Send a password reset link to your email address.
        </p>
        <button
          onClick={handleSendReset}
          disabled={sendingReset || !user?.email}
          className="btn-secondary text-sm"
        >
          {sendingReset ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              <KeyRound size={14} /> Send password reset
            </>
          )}
        </button>
      </div>

      {/* Danger zone */}
      <div className="card p-6" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <div className="flex items-center gap-2 mb-5">
          <Trash2 size={16} style={{ color: 'var(--error)' }} />
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--error)' }}>
            Danger Zone
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Clear chat history</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Delete all {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleClearHistory}
            disabled={conversations.length === 0}
            className="settings-danger-btn text-sm"
          >
            <Trash2 size={14} className="inline mr-1" /> Clear history
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Sign out</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Your data stays in your account
            </p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="settings-danger-btn text-sm"
          >
            {signingOut ? (
              <>
                <Loader2 size={14} className="inline mr-1 animate-spin" /> Signing out…
              </>
            ) : (
              <>
                <LogOut size={14} className="inline mr-1" /> Sign out
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
