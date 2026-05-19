'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  PenTool,
  Code2,
  BarChart3,
  Palette,
  Briefcase,
  BookOpen,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { toast } from 'sonner';

const categories = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'study', label: 'Study', icon: BookOpen },
];

const prompts = [
  // Writing
  { title: 'Essay Outline', category: 'writing', description: 'Generate a structured essay outline with thesis, body paragraphs, and conclusion.', prompt: 'Create a detailed essay outline about the following topic. Include a thesis statement, 3-4 body paragraphs with supporting points, and a conclusion: ' },
  { title: 'Email Composer', category: 'writing', description: 'Draft professional emails for any context.', prompt: 'Help me write a professional email for the following situation: ' },
  { title: 'Blog Post Writer', category: 'writing', description: 'Write engaging blog posts with SEO-friendly structure.', prompt: 'Write an engaging blog post about the following topic. Include an attention-grabbing intro, subheadings, and a call-to-action: ' },
  { title: 'Grammar Checker', category: 'writing', description: 'Fix grammar, punctuation, and improve clarity.', prompt: 'Please review and fix any grammar, punctuation, and clarity issues in the following text. Explain each correction: ' },

  // Code
  { title: 'Code Generator', category: 'code', description: 'Generate clean, commented code in any language.', prompt: 'Write clean, well-commented code for the following task. Include error handling: ' },
  { title: 'Bug Fixer', category: 'code', description: 'Debug and fix code issues with explanations.', prompt: 'Debug the following code. Explain what\'s wrong and provide the fixed version: ' },
  { title: 'Code Reviewer', category: 'code', description: 'Get a thorough code review with improvement suggestions.', prompt: 'Review the following code for best practices, performance, security, and readability. Suggest improvements: ' },
  { title: 'API Design', category: 'code', description: 'Design RESTful API endpoints with documentation.', prompt: 'Design a RESTful API for the following use case. Include endpoints, methods, request/response schemas, and status codes: ' },
  { title: 'Regex Builder', category: 'code', description: 'Build and explain regular expressions.', prompt: 'Create a regular expression that matches the following pattern. Explain each part of the regex: ' },

  // Analysis
  { title: 'Data Analyzer', category: 'analysis', description: 'Analyze datasets and extract insights.', prompt: 'Analyze the following data and provide key insights, trends, and actionable recommendations: ' },
  { title: 'Compare & Contrast', category: 'analysis', description: 'Deep comparison of two topics or technologies.', prompt: 'Provide a comprehensive comparison between the following two items. Include pros, cons, use cases, and a recommendation: ' },
  { title: 'SWOT Analysis', category: 'analysis', description: 'Generate a SWOT analysis for any subject.', prompt: 'Perform a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for: ' },

  // Creative
  { title: 'Story Writer', category: 'creative', description: 'Create compelling stories with vivid characters.', prompt: 'Write a creative short story with vivid descriptions and engaging characters about: ' },
  { title: 'Brainstorm Ideas', category: 'creative', description: 'Generate creative ideas for any project.', prompt: 'Brainstorm 10 creative and unique ideas for: ' },
  { title: 'Poem Generator', category: 'creative', description: 'Compose poems in various styles.', prompt: 'Write a beautiful poem about the following topic. Use vivid imagery and metaphors: ' },

  // Business
  { title: 'Business Plan', category: 'business', description: 'Create a structured business plan outline.', prompt: 'Create a detailed business plan outline for the following business idea, including market analysis, revenue model, and growth strategy: ' },
  { title: 'Marketing Copy', category: 'business', description: 'Write persuasive marketing and ad copy.', prompt: 'Write compelling marketing copy for the following product/service. Include a headline, subheadline, and call-to-action: ' },
  { title: 'Meeting Summary', category: 'business', description: 'Summarize meeting notes into action items.', prompt: 'Summarize the following meeting notes into key decisions, action items with owners, and next steps: ' },

  // Study
  { title: 'Concept Explainer', category: 'study', description: 'Break down complex topics into simple explanations.', prompt: 'Explain the following concept in simple terms. Use analogies and examples a beginner would understand: ' },
  { title: 'Flash Card Creator', category: 'study', description: 'Generate flashcards from any content.', prompt: 'Create 15 study flashcards (question and answer format) from the following content: ' },
  { title: 'Practice Questions', category: 'study', description: 'Generate practice exam questions with answers.', prompt: 'Generate 10 practice exam questions with detailed answers for the following topic: ' },
  { title: 'Study Schedule', category: 'study', description: 'Create an optimized study schedule.', prompt: 'Create an optimized study schedule for the following subjects and exam dates. Include breaks and revision days: ' },
];

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function ExplorePage() {
  const router = useRouter();
  const { bookmarkedPrompts, toggleBookmark, createConversation, setActiveConversation } = useChatStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const handleUsePrompt = (prompt: string) => {
    const convId = createConversation();
    setActiveConversation(convId);
    // Navigate to chat with pre-filled prompt via URL
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
    toast.success('Prompt loaded! Type your details and press Enter.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Sparkles size={24} className="inline mr-2" style={{ color: 'var(--accent)' }} />
          Explore Prompts
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Curated AI prompt templates — click to use in chat
        </p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)', zIndex: 10 }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full"
          style={{ paddingLeft: '36px' }}
          placeholder="Search prompts..."
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id 
                ? 'bg-[var(--accent-glow)] text-[var(--accent)] shadow-[inset_0_0_0_1px_var(--accent)]' 
                : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
            }`}
          >
            <cat.icon size={14} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Prompts grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p style={{ color: 'var(--text-muted)' }}>No prompts match your search.</p>
        </div>
      ) : (
        <motion.div
          className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4"
          variants={container}
          initial="hidden"
          animate="visible"
          key={activeCategory + search}
        >
          {filtered.map((p) => {
            const isBookmarked = bookmarkedPrompts.includes(p.title);
            return (
              <motion.div
                key={p.title}
                className="flex flex-col bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 h-full transition-all hover:border-[rgba(108,99,255,0.4)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
                variants={item}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-display text-base font-bold text-[var(--text-primary)] leading-snug">{p.title}</h3>
                  <button
                    onClick={() => toggleBookmark(p.title)}
                    className={`p-1 rounded-md bg-transparent border-none cursor-pointer transition-all ${
                      isBookmarked ? 'text-[var(--warning)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                    }`}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </button>
                </div>
                <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed mb-6 flex-1">{p.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-glow)] px-2.5 py-1 rounded-md">{p.category}</span>
                  <button
                    onClick={() => handleUsePrompt(p.prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-bold border-none cursor-pointer transition-all hover:scale-105 hover:bg-white"
                  >
                    Use Prompt <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
