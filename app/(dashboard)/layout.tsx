'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase/client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { setUser, sidebarOpen } = useAppStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
        });
        setReady(true);
      } catch {
        router.push('/login');
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [router, setUser]);

  if (!ready) {
    return (
      <div className="dash-loading">
        <div className="dash-loading-icon" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dash-root">
      <div className="dashboard-aurora" aria-hidden />
      <Sidebar />

      <div className={`dash-main ${sidebarOpen ? 'dash-main--shifted' : ''}`}>
        <Topbar />
        <main className="dash-content">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
