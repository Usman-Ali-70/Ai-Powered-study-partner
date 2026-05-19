'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Upload,
  Brain,
  Layers,
  FileText,
  Calendar,
  Flame,
  Clock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase/client';
import { formatRelativeTime } from '@/lib/utils';
import { Note, Quiz, StudyTask } from '@/types';
import { format } from 'date-fns';

const quickActions = [
  { href: '/notes', icon: Upload, label: 'Upload PDF', color: '#6c63ff' },
  { href: '/quiz/generate', icon: Brain, label: 'New quiz', color: '#00d4aa' },
  { href: '/flashcards', icon: Layers, label: 'Study cards', color: '#f59e0b' },
  { href: '/planner', icon: Calendar, label: 'Plan studies', color: '#ec4899' },
];

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function DashboardPage() {
  const { user, notes, setNotes, quizzes, setQuizzes, decks, setDecks } = useAppStore();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [todayTasks, setTodayTasks] = useState<StudyTask[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<StudyTask[]>([]);
  const [streak, setStreak] = useState(0);
  const [dueCards, setDueCards] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');

      const [notesRes, quizRes, deckRes, dueCardRes, taskRes] = await Promise.all([
        supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('quizzes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('flashcard_decks').select('*').eq('user_id', user.id),
        supabase
          .from('flashcards')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .lte('next_review', new Date().toISOString()),
        supabase
          .from('study_tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('study_date', { ascending: true })
          .limit(50),
      ]);

      if (notesRes.data) {
        setNotes(notesRes.data);
        setRecentNotes(notesRes.data.slice(0, 3));
      }
      if (quizRes.data) {
        setQuizzes(quizRes.data);
        setRecentQuizzes(quizRes.data.slice(0, 3));
      }
      if (deckRes.data) setDecks(deckRes.data);
      setDueCards(dueCardRes.count ?? 0);

      if (taskRes.data) {
        const tasks = taskRes.data as StudyTask[];
        setTodayTasks(tasks.filter((t) => t.study_date === today && !t.completed));
        setOverdueTasks(
          tasks.filter(
            (t) => t.study_date && t.study_date < today && !t.completed,
          ),
        );

        // Streak: count consecutive days ending today with at least one completed task
        const completedDays = new Set(
          tasks.filter((t) => t.completed && t.study_date).map((t) => t.study_date as string),
        );
        let s = 0;
        const day = new Date();
        for (let i = 0; i < 60; i++) {
          const key = format(day, 'yyyy-MM-dd');
          if (completedDays.has(key)) {
            s++;
            day.setDate(day.getDate() - 1);
          } else if (i === 0) {
            // Today not done yet — peek at yesterday
            day.setDate(day.getDate() - 1);
          } else break;
        }
        setStreak(s);
      }

      setLoading(false);
    };
    fetchData();
  }, [user?.id, setNotes, setQuizzes, setDecks]);

  const completedQuizCount = quizzes.filter(
    (q) => q.score !== undefined && q.score !== null,
  ).length;

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      {/* Welcome */}
      <motion.div variants={item} className="mb-8">
        <h1
          className="text-2xl md:text-3xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}{' '}
          <span className="welcome-wave" role="img" aria-label="wave">👋</span>
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Here&apos;s your study overview for today
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
      >
        {[
          { icon: Flame, label: 'Day streak', value: streak, color: '#f59e0b', suffix: streak === 1 ? 'day' : 'days' },
          { icon: Layers, label: 'Cards due', value: dueCards, color: '#6c63ff', suffix: '' },
          { icon: FileText, label: 'Notes', value: notes.length, color: '#00d4aa', suffix: '' },
          { icon: Brain, label: 'Quizzes taken', value: completedQuizCount, color: '#ec4899', suffix: '' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="stat-tile"
            style={{ '--tile-color': stat.color } as React.CSSProperties}
            whileHover={{ y: -2 }}
          >
            <div className="stat-tile-icon">
              <stat.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="stat-tile-label truncate">{stat.label}</p>
              <p className="stat-tile-value">
                {stat.value}
                {stat.suffix && <span className="stat-tile-suffix">{stat.suffix}</span>}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-base sm:text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Quick actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <div
                className="action-tile"
                style={{ '--tile-color': action.color } as React.CSSProperties}
              >
                <div className="action-tile-icon">
                  <action.icon size={22} />
                </div>
                <span className="action-tile-label">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 max-w-full overflow-hidden">
        {/* Recent notes */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Recent notes
            </h2>
            <Link
              href="/notes"
              className="text-xs font-medium flex items-center gap-1 hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {recentNotes.length === 0 ? (
            <div className="card text-center py-10">
              <div className="empty-state-ring">
                <FileText size={26} style={{ color: 'var(--accent)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {loading ? 'Loading…' : 'No notes yet. Upload a PDF or create one manually.'}
              </p>
              {!loading && (
                <Link href="/notes" className="btn-primary mt-4 text-sm inline-flex">
                  <Upload size={16} /> Add notes
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <Link key={note.id} href={`/notes/${note.id}`}>
                  <div className="card flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'var(--accent-glow)' }}
                      >
                        <FileText size={18} style={{ color: 'var(--accent)' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{note.title}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {note.subject && `${note.subject} · `}
                          {note.word_count ? `${note.word_count} words · ` : ''}
                          {formatRelativeTime(note.created_at)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      style={{ color: 'var(--text-muted)' }}
                      className="opacity-0 group-hover:opacity-100 transition shrink-0"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Side column */}
        <motion.div variants={item} className="space-y-6">
          {/* Today's focus — real data */}
          <div className="card" style={{ borderColor: 'rgba(108, 99, 255, 0.3)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} style={{ color: 'var(--accent)' }} />
              <span
                className="text-xs font-bold"
                style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
              >
                Today&apos;s focus
              </span>
            </div>
            {dueCards === 0 && todayTasks.length === 0 && overdueTasks.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                You&apos;re all caught up. Generate a quiz or plan your next study block.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {overdueTasks.length > 0 && (
                  <li className="flex items-start gap-2">
                    <AlertCircle size={14} style={{ color: 'var(--error)' }} className="mt-0.5 shrink-0" />
                    <Link href="/planner" className="hover:underline">
                      <span style={{ color: 'var(--error)' }} className="font-semibold">
                        {overdueTasks.length}
                      </span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>
                        overdue {overdueTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </Link>
                  </li>
                )}
                {todayTasks.length > 0 && (
                  <li className="flex items-start gap-2">
                    <Calendar size={14} style={{ color: 'var(--accent)' }} className="mt-0.5 shrink-0" />
                    <Link href="/planner" className="hover:underline">
                      <span style={{ color: 'var(--accent)' }} className="font-semibold">
                        {todayTasks.length}
                      </span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {todayTasks.length === 1 ? 'task' : 'tasks'} scheduled today
                      </span>
                    </Link>
                  </li>
                )}
                {dueCards > 0 && (
                  <li className="flex items-start gap-2">
                    <Layers size={14} style={{ color: 'var(--accent-secondary)' }} className="mt-0.5 shrink-0" />
                    <Link href="/flashcards" className="hover:underline">
                      <span style={{ color: 'var(--accent-secondary)' }} className="font-semibold">
                        {dueCards}
                      </span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>
                        flashcard{dueCards === 1 ? '' : 's'} due for review
                      </span>
                    </Link>
                  </li>
                )}
                {streak > 0 && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} style={{ color: 'var(--success)' }} className="mt-0.5 shrink-0" />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Streak: <span style={{ color: 'var(--success)' }} className="font-semibold">{streak}</span> {streak === 1 ? 'day' : 'days'}
                    </span>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Recent quizzes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Recent quizzes
              </h3>
              <Link href="/quiz" className="text-xs" style={{ color: 'var(--accent)' }}>
                View all
              </Link>
            </div>
            {recentQuizzes.length === 0 ? (
              <div className="card text-center py-6">
                <div className="empty-state-ring" style={{ width: 52, height: 52, marginBottom: 8 }}>
                  <Brain size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No quizzes yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentQuizzes.map((quiz) => {
                  const hasScore =
                    quiz.score !== null && quiz.score !== undefined && quiz.total_questions > 0;
                  const pct = hasScore ? Math.round((quiz.score! / quiz.total_questions) * 100) : null;
                  return (
                    <Link key={quiz.id} href={`/quiz/${quiz.id}`}>
                      <div className="card py-3 px-4 cursor-pointer">
                        <p className="text-sm font-medium truncate">{quiz.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {pct !== null && (
                            <span
                              className="text-xs font-bold"
                              style={{
                                color: pct >= 70 ? 'var(--success)' : 'var(--warning)',
                              }}
                            >
                              <TrendingUp size={12} className="inline mr-1" />
                              {pct}%
                            </span>
                          )}
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            <Clock size={10} className="inline mr-1" />
                            {formatRelativeTime(quiz.created_at)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
