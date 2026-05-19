'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export function Topbar() {
  const { setSidebarOpen, user } = useAppStore();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ⌘K / Ctrl+K → focus the search input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.getElementById('topbar-search') as HTMLInputElement | null;
        el?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) {
      router.push('/notes');
    } else {
      router.push(`/notes?q=${encodeURIComponent(term)}`);
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const initials = (user?.full_name || user?.email || 'U')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between border-b w-full h-16 px-3 sm:px-4"
      style={{
        background: 'rgba(5, 5, 8, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Left side: hamburger + search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 h-full">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} style={{ color: 'var(--text-secondary)' }} />
        </button>

        <form
          onSubmit={submitSearch}
          className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-md"
          style={{
            background: 'var(--bg-card)',
          }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
          <input
            id="topbar-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search notes…"
            className="bg-transparent text-sm flex-1 min-w-0"
            style={{
              color: 'var(--text-primary)',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
            }}
          />
          <kbd
            className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-muted)',
            }}
          >
            ⌘K
          </kbd>
        </form>
      </div>

      {/* Right side: user dropdown */}
      <div 
        className="relative flex items-center gap-3 shrink-0" 
        ref={dropdownRef}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}
      >
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors hover:bg-[var(--bg-elevated)]"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          {/* Avatar with gradient ring */}
          <div
            className="relative rounded-full p-[2px]"
            style={{
              background: 'conic-gradient(from 180deg, var(--accent), var(--accent-secondary), #8b5cf6, var(--accent))',
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                color: 'white',
                border: '2px solid var(--bg-primary)',
              }}
            >
              {initials}
            </div>
          </div>

          {/* Name + email */}
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {displayName}
            </p>
            <p className="text-[11px] leading-tight" style={{ color: 'var(--text-muted)' }}>
              {user?.email || ''}
            </p>
          </div>

          <ChevronDown
            size={14}
            style={{
              color: 'var(--text-muted)',
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
              style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '8px',
                width: '14rem',
                zIndex: 50,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {displayName}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {user?.email}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
                <Link
                  href="#"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <HelpCircle size={16} />
                  <span>Help & Support</span>
                </Link>
              </div>

              {/* Logout */}
              <div className="py-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ color: 'var(--error)' }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
