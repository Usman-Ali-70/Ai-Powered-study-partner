import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Prompts',
  description: 'Browse and use curated AI prompt templates for writing, coding, analysis, creative projects, and business tasks.',
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
