'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Sparkles,
  MessageSquare,
  Brain,
  Layers,
  Calendar,
  BarChart3,
  ArrowRight,
  Zap,
  Upload,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Repeat,
  Timer,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

const KnowledgeNet = dynamic(
  () => import('@/components/landing/KnowledgeNet').then((m) => m.KnowledgeNet),
  { ssr: false },
);

const FloatingShape = dynamic(
  () => import('@/components/landing/FloatingShape').then((m) => m.FloatingShape),
  { ssr: false },
);

const features = [
  {
    icon: MessageSquare,
    title: 'Chat with your notes',
    description:
      'Upload a PDF or paste your lecture notes — then ask anything. The AI grounds every answer in your own material.',
    color: '#6c63ff',
    shape: 0 as const,
  },
  {
    icon: Brain,
    title: 'Targeted quiz generation',
    description:
      'Pick difficulty, count, and question type. Get an MCQ / T-F / short-answer quiz with per-question explanations.',
    color: '#00d4aa',
    shape: 1 as const,
  },
  {
    icon: Layers,
    title: 'Flashcards with SM-2',
    description:
      'Auto-extract definitions and key concepts into a deck. Spaced repetition reschedules each card by your recall quality.',
    color: '#f59e0b',
    shape: 2 as const,
  },
  {
    icon: Calendar,
    title: 'Deadline-aware planner',
    description:
      'Tell it your subjects and exam dates. It produces a day-by-day plan with revision buffers before each deadline.',
    color: '#ec4899',
    shape: 0 as const,
  },
  {
    icon: BarChart3,
    title: 'Performance analytics',
    description:
      'Score trends, weak topics surfaced from wrong answers, streaks, and a 30-day activity heatmap — all from real history.',
    color: '#3b82f6',
    shape: 1 as const,
  },
  {
    icon: Zap,
    title: 'Auto-summarized PDFs',
    description:
      'Every PDF is parsed and summarised on upload — overview, key concepts, important details, and takeaways.',
    color: '#8b5cf6',
    shape: 2 as const,
  },
];

const steps = [
  {
    step: '01',
    title: 'Drop in your material',
    desc: 'Upload a PDF or paste raw text. Content is extracted, summarised, and indexed for AI use.',
    icon: Upload,
  },
  {
    step: '02',
    title: 'AI structures it',
    desc: 'Quizzes, flashcards, and study plans are generated on demand, grounded in the notes you uploaded.',
    icon: Sparkles,
  },
  {
    step: '03',
    title: 'Study, rate, improve',
    desc: 'Quiz scores and flashcard ratings feed back into analytics and the spaced-repetition schedule.',
    icon: BarChart3,
  },
];

const pillars = [
  {
    icon: Cpu,
    title: 'Grounded in your notes',
    desc: 'Every answer, quiz, and flashcard is generated from the material you upload — not from generic web knowledge.',
  },
  {
    icon: Repeat,
    title: 'Spaced repetition built-in',
    desc: 'Flashcards use the SM-2 algorithm. Cards you find hard come back sooner; easy ones move further out.',
  },
  {
    icon: Timer,
    title: 'Made for exam prep',
    desc: 'The planner respects your deadlines and adds revision buffers automatically before each exam.',
  },
  {
    icon: ShieldCheck,
    title: 'Your data stays yours',
    desc: 'Notes, uploads, and history live in your Supabase row — protected by row-level security.',
  },
];

const faqs = [
  {
    q: 'What file types are supported?',
    a: 'PDFs (text content) for upload, and pasted raw text for manual notes. Scanned-image PDFs need OCR support, which is not part of the current pipeline.',
  },
  {
    q: 'How is my data secured?',
    a: 'Auth runs on Supabase. Every database row is scoped to your user id via row-level security, and uploads land in a per-user storage path.',
  },
  {
    q: 'Does the AI memorise my notes for other users?',
    a: 'No. The model receives your notes only inside an individual API call. We do not train on your content.',
  },
  {
    q: 'Can I retake a quiz?',
    a: 'Yes — quizzes are saved per attempt. You can generate fresh quizzes from the same note as often as you want.',
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-glow-left" />
      <div className="landing-glow-right" />

      <nav className="landing-nav">
        <div className="landing-container">
          <div className="landing-nav-inner">
            <Link href="/" className="landing-logo">
              <div className="landing-logo-icon">
                <Sparkles size={18} />
              </div>
              <span>StudyMind AI</span>
            </Link>
            <div className="landing-nav-links">
              <Link href="#features" className="landing-nav-link">Features</Link>
              <Link href="#how-it-works" className="landing-nav-link">How it works</Link>
              <Link href="#faq" className="landing-nav-link">FAQ</Link>
              <Link href="/login" className="landing-nav-link">Log in</Link>
              <Link href="/signup" className="landing-cta-btn">
                Get started
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-canvas">
          <KnowledgeNet />
        </div>

        <div className="landing-container landing-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="landing-hero-text"
          >
            <motion.div
              className="landing-badge"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <Sparkles size={14} />
              <span>Your AI-powered study companion</span>
            </motion.div>

            <h1 className="landing-h1">
              Turn your notes into{' '}
              <span className="landing-gradient-text">a structured study system.</span>
            </h1>

            <p className="landing-hero-sub">
              Upload a PDF or paste lecture notes. StudyMind AI generates quizzes, flashcards,
              and a deadline-aware study plan — all grounded in your own material.
            </p>

            <div className="landing-hero-actions">
              <Link href="/signup" className="landing-cta-btn landing-cta-lg">
                <Sparkles size={18} />
                Start free
              </Link>
              <Link href="#features" className="landing-secondary-btn">
                See features
              </Link>
            </div>

            <p className="landing-hero-hint">
              Move your mouse · scroll the page · the network reacts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pillars strip */}
      <section className="landing-section landing-pillars-section">
        <div className="landing-container">
          <motion.div
            className="landing-pillars-grid"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {pillars.map((p) => (
              <motion.div key={p.title} className="landing-pillar" variants={itemVariants}>
                <div className="landing-pillar-icon">
                  <p.icon size={18} />
                </div>
                <div>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="landing-section-label">Features</span>
            <h2 className="landing-h2">
              Everything to{' '}
              <span className="landing-gradient-text">study smarter</span>
            </h2>
            <p className="landing-section-desc">
              Six tools, one workflow — from raw notes to graded recall.
            </p>
          </motion.div>

          <motion.div
            className="landing-features-grid"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                className="landing-feature-card"
                variants={itemVariants}
              >
                <div className="landing-feature-top">
                  <div
                    className="landing-feature-icon"
                    style={{
                      background: `${feature.color}12`,
                      borderColor: `${feature.color}25`,
                    }}
                  >
                    <feature.icon size={22} style={{ color: feature.color }} />
                  </div>
                  <div className="landing-feature-shape" aria-hidden>
                    <FloatingShape variant={feature.shape} color={feature.color} size={72} />
                  </div>
                </div>
                <h3 className="landing-feature-title">{feature.title}</h3>
                <p className="landing-feature-desc">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="landing-section">
        <div className="landing-container" style={{ maxWidth: '920px' }}>
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="landing-section-label">Workflow</span>
            <h2 className="landing-h2">How it works</h2>
          </motion.div>

          <div className="landing-steps">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                className="landing-step-card"
                initial={{ opacity: 0, x: i % 2 === 0 ? -28 : 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="landing-step-number">{item.step}</div>
                <div className="landing-step-content">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
                <item.icon size={22} className="landing-step-arrow" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* "What you get" deep-dive cards */}
      <section className="landing-section">
        <div className="landing-container">
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="landing-section-label">Deep dive</span>
            <h2 className="landing-h2">What you get out of every upload</h2>
          </motion.div>

          <div className="landing-deepdive-grid">
            <motion.div
              className="landing-deepdive-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3>Instant summary</h3>
              <ul>
                <li><CheckCircle2 size={14} /> Overview in 2-3 sentences</li>
                <li><CheckCircle2 size={14} /> Key concepts as a bullet list</li>
                <li><CheckCircle2 size={14} /> Critical facts &amp; formulas</li>
                <li><CheckCircle2 size={14} /> 3-5 takeaways to remember</li>
              </ul>
            </motion.div>
            <motion.div
              className="landing-deepdive-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
            >
              <h3>Tutor-style chat</h3>
              <ul>
                <li><CheckCircle2 size={14} /> Streaming markdown answers</li>
                <li><CheckCircle2 size={14} /> Bound to your note&apos;s scope</li>
                <li><CheckCircle2 size={14} /> Explains, contrasts, gives examples</li>
                <li><CheckCircle2 size={14} /> Says &ldquo;not in notes&rdquo; when relevant</li>
              </ul>
            </motion.div>
            <motion.div
              className="landing-deepdive-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
            >
              <h3>Active recall set</h3>
              <ul>
                <li><CheckCircle2 size={14} /> MCQ, T-F, short-answer quiz</li>
                <li><CheckCircle2 size={14} /> Per-question explanation</li>
                <li><CheckCircle2 size={14} /> Flashcard deck with SM-2 schedule</li>
                <li><CheckCircle2 size={14} /> Weak-area analysis after each quiz</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="landing-section">
        <div className="landing-container" style={{ maxWidth: '820px' }}>
          <motion.div
            className="landing-section-header"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="landing-section-label">FAQ</span>
            <h2 className="landing-h2">Common questions</h2>
          </motion.div>

          <div className="landing-faq">
            {faqs.map((f, i) => (
              <motion.details
                key={f.q}
                className="landing-faq-item"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <summary>
                  <HelpCircle size={16} />
                  <span>{f.q}</span>
                  <ChevronRight size={16} className="chev" />
                </summary>
                <p>{f.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-section">
        <div className="landing-container" style={{ maxWidth: '820px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="landing-cta-card"
          >
            <h2 className="landing-h2" style={{ marginBottom: '12px' }}>
              Ready to study smarter?
            </h2>
            <p className="landing-section-desc" style={{ marginBottom: '32px' }}>
              Free to start. No credit card. Your notes stay in your account.
            </p>
            <Link href="/signup" className="landing-cta-btn landing-cta-lg">
              <Sparkles size={18} />
              Create your account
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-inner">
            <div className="landing-logo" style={{ gap: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '14px' }}>StudyMind AI</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              © {new Date().getFullYear()} StudyMind AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
