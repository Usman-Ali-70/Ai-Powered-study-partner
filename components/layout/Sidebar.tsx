'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  FileText,
  Brain,
  Layers,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  Sparkles,
  LogOut,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase/client';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { href: '/explore', icon: Compass, label: 'Explore Prompts' },
  { href: '/notes', icon: FileText, label: 'My Notes' },
  { href: '/quiz', icon: Brain, label: 'Quizzes' },
  { href: '/flashcards', icon: Layers, label: 'Flashcards' },
  { href: '/planner', icon: Calendar, label: 'Study Planner' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, user } = useAppStore();
  const router = useRouter();

  // Auto-open on desktop, auto-close on mobile
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  const handleLogout = async () => {
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
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-[280px] lg:w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 pb-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-[0_8px_24px_var(--accent-glow)] bg-gradient-to-br from-[var(--accent)] to-[#8b5cf6]">
              <Sparkles size={18} />
            </div>
            <span className="font-display font-bold text-[22px] tracking-tight">StudyMind</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors lg:hidden"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[14.5px] transition-colors ${
                  isActive 
                    ? 'text-[var(--text-primary)] font-semibold' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[rgba(108,99,255,0.15)] to-[rgba(108,99,255,0.04)] shadow-[inset_0_0_0_1px_rgba(108,99,255,0.2)] pointer-events-none"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <item.icon size={18} className={`shrink-0 z-10 relative ${isActive ? 'text-[var(--accent-secondary)]' : ''}`} />
                <span className="z-10 relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom user section */}
        <div className="p-4 border-t border-[var(--border)] mt-auto">
          <div className="flex items-center gap-2.5 px-1 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#8b5cf6] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-[var(--text-primary)] truncate">{displayName}</p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13.5px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--error)] transition-colors cursor-pointer border-none bg-transparent">
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
