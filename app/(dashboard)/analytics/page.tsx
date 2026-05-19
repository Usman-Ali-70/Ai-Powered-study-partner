'use client';

import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  TrendingUp,
  Brain,
  Flame,
  Target,
  FileText,
  Layers,
  Sparkles,
  Check,
  Clock,
  Activity,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase/client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { formatRelativeTime } from '@/lib/utils';

interface QuizScore {
  date: string;
  score: number;
  subject: string;
}

interface DayHours {
  day: string;
  date: string;
  hours: number;
}

interface SubjectStat {
  name: string;
  Tasks: number;
  Quizzes: number;
  Notes: number;
  Decks: number;
  total: number;
}

interface ActivityItem {
  id: string;
  type: 'note' | 'quiz' | 'task' | 'deck';
  title: string;
  detail: string;
  timestamp: Date;
}

export default function AnalyticsPage() {
  const { user } = useAppStore();
  
  // Metrics state
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [studyHoursData, setStudyHoursData] = useState<DayHours[]>([]);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [totalStudyHours, setTotalStudyHours] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);
  const [totalDecks, setTotalDecks] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  
  // Advanced breakdown & logs
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectStat[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!user?.id) return;

    try {
      const [
        quizzesRes,
        tasksRes,
        notesRes,
        decksRes,
        flashcardsRes
      ] = await Promise.all([
        supabase
          .from('quizzes')
          .select('id, score, total_questions, subject, created_at, completed_at, title')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('study_tasks')
          .select('id, study_date, duration_minutes, completed, subject, title, created_at')
          .eq('user_id', user.id),
        supabase
          .from('notes')
          .select('id, title, subject, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('flashcard_decks')
          .select('id, title, card_count, subject, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('flashcards')
          .select('repetitions, deck_id')
          .eq('user_id', user.id),
      ]);

      // 1. Quizzes
      if (quizzesRes.data) {
        const completedQuizzesList = quizzesRes.data.filter((q) => q.score !== null && q.score !== undefined);
        const scores = completedQuizzesList
          .filter((q) => q.total_questions > 0)
          .map((q) => ({
            date: format(new Date(q.completed_at || q.created_at), 'MMM d'),
            score: Math.round((q.score / q.total_questions) * 100),
            subject: q.subject || 'General',
          }));
        setQuizScores(scores);
        setCompletedQuizzes(completedQuizzesList.length);
        if (scores.length > 0) {
          setAvgScore(Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length));
        } else {
          setAvgScore(0);
        }
      }

      // 2. Study Tasks, Hours, Streak
      if (tasksRes.data) {
        const completedTasks = tasksRes.data.filter((t) => t.completed);
        setCompletedTasksCount(completedTasks.length);

        const minutesByDate: Record<string, number> = {};
        const countByDate: Record<string, number> = {};
        let totalMinutes = 0;
        
        for (const t of completedTasks) {
          if (!t.study_date) continue;
          const m = t.duration_minutes ?? 0;
          minutesByDate[t.study_date] = (minutesByDate[t.study_date] ?? 0) + m;
          countByDate[t.study_date] = (countByDate[t.study_date] ?? 0) + 1;
          totalMinutes += m;
        }
        setTotalStudyHours(Math.round(totalMinutes / 60));
        setHeatmapData(countByDate);

        // 14-day study hours bar chart
        const bars: DayHours[] = Array.from({ length: 14 }, (_, i) => {
          const d = subDays(new Date(), 13 - i);
          const key = format(d, 'yyyy-MM-dd');
          return {
            day: format(d, 'EEE'),
            date: key,
            hours: +(((minutesByDate[key] ?? 0) / 60).toFixed(2)),
          };
        });
        setStudyHoursData(bars);

        // Streak: consecutive days back from today
        let s = 0;
        const day = new Date();
        for (let i = 0; i < 60; i++) {
          const key = format(day, 'yyyy-MM-dd');
          if ((countByDate[key] ?? 0) > 0) {
            s++;
            day.setDate(day.getDate() - 1);
          } else if (i === 0) {
            // Peek at yesterday
            day.setDate(day.getDate() - 1);
          } else break;
        }
        setStreak(s);
      }

      // 3. Notes
      if (notesRes.data) {
        setTotalNotes(notesRes.data.length);
      }

      // 4. Decks & Cards count
      if (decksRes.data) {
        setTotalDecks(decksRes.data.length);
        const sumCards = decksRes.data.reduce((acc, d) => acc + (d.card_count || 0), 0);
        setTotalCards(sumCards);
      }

      // 5. Reviews
      if (flashcardsRes.data) {
        const sumReviews = flashcardsRes.data.reduce((acc, c) => acc + (c.repetitions || 0), 0);
        setTotalReviews(sumReviews);
      }

      // 6. Subject Focus Breakdown
      const counts: Record<string, { tasks: number; quizzes: number; notes: number; decks: number }> = {};
      const getSubj = (s: string | null | undefined) => {
        if (!s) return 'General';
        const trimmed = s.trim();
        return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase() : 'General';
      };

      if (tasksRes.data) {
        tasksRes.data.forEach((t) => {
          const subj = getSubj(t.subject);
          if (!counts[subj]) counts[subj] = { tasks: 0, quizzes: 0, notes: 0, decks: 0 };
          if (t.completed) counts[subj].tasks++;
        });
      }
      if (quizzesRes.data) {
        quizzesRes.data.forEach((q) => {
          const subj = getSubj(q.subject);
          if (!counts[subj]) counts[subj] = { tasks: 0, quizzes: 0, notes: 0, decks: 0 };
          if (q.score !== null && q.score !== undefined) counts[subj].quizzes++;
        });
      }
      if (notesRes.data) {
        notesRes.data.forEach((n) => {
          const subj = getSubj(n.subject);
          if (!counts[subj]) counts[subj] = { tasks: 0, quizzes: 0, notes: 0, decks: 0 };
          counts[subj].notes++;
        });
      }
      if (decksRes.data) {
        decksRes.data.forEach((d) => {
          const subj = getSubj(d.subject);
          if (!counts[subj]) counts[subj] = { tasks: 0, quizzes: 0, notes: 0, decks: 0 };
          counts[subj].decks++;
        });
      }

      const breakdown = Object.entries(counts).map(([name, countsObj]) => ({
        name,
        Tasks: countsObj.tasks,
        Quizzes: countsObj.quizzes,
        Notes: countsObj.notes,
        Decks: countsObj.decks,
        total: countsObj.tasks + countsObj.quizzes + countsObj.notes + countsObj.decks,
      })).sort((a, b) => b.total - a.total).slice(0, 6);

      setSubjectBreakdown(breakdown);

      // 7. Recent Real-Time Activity timeline
      const activities: ActivityItem[] = [];
      if (notesRes.data) {
        notesRes.data.slice(0, 4).forEach((n) => {
          activities.push({
            id: `note-${n.id}`,
            type: 'note',
            title: `Uploaded/Created Note: ${n.title}`,
            detail: n.subject ? `Subject: ${n.subject}` : 'No subject set',
            timestamp: new Date(n.created_at),
          });
        });
      }
      if (quizzesRes.data) {
        quizzesRes.data.filter((q) => q.score !== null).slice(0, 4).forEach((q) => {
          activities.push({
            id: `quiz-${q.id}`,
            type: 'quiz',
            title: `Completed Quiz: ${q.title}`,
            detail: `Scored ${Math.round((q.score! / q.total_questions) * 100)}% (${q.score}/${q.total_questions})`,
            timestamp: new Date(q.completed_at || q.created_at),
          });
        });
      }
      if (tasksRes.data) {
        tasksRes.data.filter((t) => t.completed).slice(0, 4).forEach((t) => {
          activities.push({
            id: `task-${t.id}`,
            type: 'task',
            title: `Finished Study Task: ${t.title}`,
            detail: t.duration_minutes ? `Studied for ${t.duration_minutes} mins` : 'Completed',
            timestamp: new Date(t.created_at || t.study_date),
          });
        });
      }
      if (decksRes.data) {
        decksRes.data.slice(0, 4).forEach((d) => {
          activities.push({
            id: `deck-${d.id}`,
            type: 'deck',
            title: `Generated Flashcard Deck: ${d.title}`,
            detail: `${d.card_count} flashcards created`,
            timestamp: new Date(d.created_at),
          });
        });
      }

      const sorted = activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 8);
      setRecentActivities(sorted);

    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    
    // Initial fetch
    fetchAnalytics();

    // Setup real-time updates listener across all workspace tables
    const channel = supabase
      .channel('analytics-db-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quizzes' },
        () => fetchAnalytics()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_tasks' },
        () => fetchAnalytics()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        () => fetchAnalytics()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'flashcards' },
        () => fetchAnalytics()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'flashcard_decks' },
        () => fetchAnalytics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // 30-day heatmap grid
  const heatmapDays = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(new Date(), 29 - i);
    const key = format(d, 'yyyy-MM-dd');
    const count = heatmapData[key] ?? 0;
    return { date: key, day: format(d, 'd'), count };
  });

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="dash-loading-icon"></div>
        <p className="text-sm mt-4 animate-pulse" style={{ color: 'var(--text-muted)' }}>
          Syncing realtime database performance…
        </p>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Analytics Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Real performance metrics synced live from your database
          </p>
        </div>
        
        {/* Realtime Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center px-3.5 py-1.5 rounded-full text-xs font-semibold border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          Live Sync Active
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
      >
        {[
          { icon: TrendingUp, label: 'Avg quiz score', value: `${avgScore}%`, color: 'var(--accent-secondary)' },
          { icon: Brain, label: 'Quizzes taken', value: `${completedQuizzes}`, color: 'var(--accent)' },
          { icon: Flame, label: 'Study streak', value: `${streak}d`, color: '#f59e0b' },
          { icon: Target, label: 'Total hours', value: `${totalStudyHours}h`, color: '#ec4899' },
          { icon: FileText, label: 'Notes Uploaded', value: `${totalNotes}`, color: '#8b5cf6' },
          { icon: Layers, label: 'Cards Created', value: `${totalCards}`, color: '#10b981', suffix: `(${totalDecks} Decks)` },
          { icon: Sparkles, label: 'Cards Studied', value: `${totalReviews}`, color: '#f59e0b' },
          { icon: Check, label: 'Tasks Completed', value: `${completedTasksCount}`, color: '#00d4aa' },
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
                {stat.suffix && <span className="stat-tile-suffix truncate">{stat.suffix}</span>}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <motion.div variants={item} className="card">
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Quiz scores over time
          </h3>
          {quizScores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Brain className="w-10 h-10 mb-2 opacity-35" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Complete quizzes to see your progress
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={quizScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  dot={{ fill: 'var(--accent)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div variants={item} className="card">
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Study hours (last 14 days)
          </h3>
          {studyHoursData.every((d) => d.hours === 0) ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-10 h-10 mb-2 opacity-35" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Complete planned study tasks to see real hours here
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={studyHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(v) => [`${Number(v)}h`, 'Hours'] as [string, string]}
                />
                <Bar dataKey="hours" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Secondary Row: Subject focus and Heatmap */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        
        {/* Subject Focus breakdown */}
        <motion.div variants={item} className="card lg:col-span-2">
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Subject focus & breakdown
          </h3>
          {subjectBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-[200px]">
              <Target className="w-8 h-8 mb-2 opacity-35" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Add notes, decks, or tasks to see subject distribution
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectBreakdown} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="Notes" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="Quizzes" stackId="a" fill="var(--accent)" />
                <Bar dataKey="Decks" stackId="a" fill="#10b981" />
                <Bar dataKey="Tasks" stackId="a" fill="var(--accent-secondary)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* 30-day activity heatmap */}
        <motion.div variants={item} className="card">
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            30-day activity
          </h3>
          <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start">
            {heatmapDays.map((d) => (
              <div
                key={d.date}
                className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-medium"
                style={{
                  background:
                    d.count === 0
                      ? 'var(--bg-elevated)'
                      : d.count === 1
                        ? 'rgba(108, 99, 255, 0.2)'
                        : d.count === 2
                          ? 'rgba(108, 99, 255, 0.4)'
                          : 'rgba(108, 99, 255, 0.7)',
                  color: d.count > 0 ? 'white' : 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
                title={`${d.date}: ${d.count} completed ${d.count === 1 ? 'task' : 'tasks'}`}
              >
                {d.day}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span>Less active</span>
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded bg-bg-elevated border border-border-subtle"></span>
              <span className="w-2.5 h-2.5 rounded bg-[rgba(108,99,255,0.2)]"></span>
              <span className="w-2.5 h-2.5 rounded bg-[rgba(108,99,255,0.4)]"></span>
              <span className="w-2.5 h-2.5 rounded bg-[rgba(108,99,255,0.7)]"></span>
            </div>
            <span>More active</span>
          </div>
        </motion.div>
      </div>

      {/* Live Study Activity Feed */}
      <motion.div variants={item} className="card mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={18} style={{ color: 'var(--accent)' }} />
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Real-time activity log
          </h3>
        </div>
        {recentActivities.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
            No activities recorded. Try generating a quiz, adding notes, or completing planner tasks!
          </p>
        ) : (
          <div className="relative pl-6 border-l border-border space-y-6">
            {recentActivities.map((act) => {
              let icon = FileText;
              let iconColor = 'var(--accent)';
              let bg = 'rgba(108, 99, 255, 0.1)';
              
              if (act.type === 'quiz') {
                icon = Brain;
                iconColor = 'var(--accent-secondary)';
                bg = 'rgba(0, 212, 170, 0.1)';
              } else if (act.type === 'task') {
                icon = Check;
                iconColor = '#10b981';
                bg = 'rgba(16, 185, 129, 0.1)';
              } else if (act.type === 'deck') {
                icon = Layers;
                iconColor = '#f59e0b';
                bg = 'rgba(245, 158, 11, 0.1)';
              }

              const IconComponent = icon;

              return (
                <div key={act.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Bullet */}
                  <span className="absolute -left-[35px] w-4 h-4 rounded-full flex items-center justify-center bg-bg-card border border-border">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: iconColor }}></span>
                  </span>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg, color: iconColor }}>
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight">{act.title}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{act.detail}</p>
                    </div>
                  </div>

                  <span className="text-xs shrink-0 self-start sm:self-center font-medium opacity-65" style={{ color: 'var(--text-muted)' }}>
                    {formatRelativeTime(act.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
