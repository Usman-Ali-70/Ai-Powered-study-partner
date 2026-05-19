import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ConfirmDialogHost } from '@/components/shared/ConfirmDialog';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'StudyMind AI — Your AI-Powered Study Partner',
    template: '%s · StudyMind AI',
  },
  description:
    'Turn your lecture notes into an interactive study experience: chat with your notes, auto-generated quizzes, flashcards with spaced repetition, and a deadline-aware study planner.',
  keywords: ['AI study', 'flashcards', 'quiz generator', 'study planner', 'spaced repetition'],
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'StudyMind AI',
    description: 'AI-powered study companion — quizzes, flashcards, and a smart planner.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        {children}
        <ConfirmDialogHost />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
            },
          }}
        />
      </body>
    </html>
  );
}
