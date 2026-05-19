'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Brain, Layers, Calendar } from 'lucide-react';

const mobileNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/notes', icon: FileText, label: 'Notes' },
  { href: '/quiz', icon: Brain, label: 'Quiz' },
  { href: '/flashcards', icon: Layers, label: 'Cards' },
  { href: '/planner', icon: Calendar, label: 'Plan' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 border-t lg:hidden"
      style={{
        background: 'rgba(17, 17, 24, 0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
      }}
    >
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 py-1 px-3 transition-colors"
          >
            <item.icon
              size={20}
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
