import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Chat',
  description: 'Chat with StudyMind AI — get instant answers, code help, study explanations, and more powered by Google Gemini.',
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
