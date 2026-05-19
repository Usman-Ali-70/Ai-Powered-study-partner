'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  Sparkles,
  X,
  Loader2,
  Check,
  Clock,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase/client';
import { EmptyState } from '@/components/shared/EmptyState';
import { AIThinkingLoader } from '@/components/shared/LoadingSpinner';
import { SubjectBadge } from '@/components/shared/ConfidenceBadge';
import { getSubjectColor, formatDate } from '@/lib/utils';
import { StudyTask } from '@/types';
import { toast } from 'sonner';
import { authedFetch } from '@/lib/api';
import { confirmDialog } from '@/components/shared/ConfirmDialog';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';

export default function PlannerPage() {
  const { user, tasks, setTasks, toggleTask } = useAppStore();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Form state
  const [subjects, setSubjects] = useState('');
  const [deadlines, setDeadlines] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [sessionLength, setSessionLength] = useState(60);

  useEffect(() => {
    if (!user?.id) return;
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('study_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('study_date', { ascending: true });
      if (data) setTasks(data);
    };
    fetchTasks();
  }, [user?.id, setTasks]);

  const handleGenerate = async () => {
    if (!subjects.trim()) {
      toast.error('Please enter subjects');
      return;
    }
    setGenerating(true);
    setShowGenerateModal(false);

    try {
      const subjectList = subjects.split(',').map((s) => s.trim()).filter(Boolean);
      const deadlineList = deadlines
        .split('\n')
        .map((line) => {
          const parts = line.split(':');
          return { subject: parts[0]?.trim(), date: parts[1]?.trim() };
        })
        .filter((d) => d.subject && d.date);

      const res = await authedFetch('/api/planner/generate', {
        method: 'POST',
        body: JSON.stringify({
          subjects: subjectList,
          deadlines: deadlineList,
          hoursPerDay,
          sessionLength,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      toast.success(`Generated ${data.tasks.length} study tasks!`);
      // Refetch
      const { data: taskData } = await supabase
        .from('study_tasks')
        .select('*')
        .eq('user_id', user!.id)
        .order('study_date', { ascending: true });
      if (taskData) setTasks(taskData);
    } catch {
      toast.error('Failed to generate study plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggle = async (taskId: string) => {
    toggleTask(taskId);
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await supabase
        .from('study_tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId);
    }
  };

  const handleDelete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const ok = await confirmDialog({
      title: 'Remove this study task?',
      message: task
        ? `"${task.title}" will be removed from your study plan.`
        : 'This task will be removed from your study plan.',
      confirmLabel: 'Remove task',
      variant: 'danger',
    });
    if (!ok) return;
    await supabase.from('study_tasks').delete().eq('id', taskId);
    setTasks(tasks.filter((t) => t.id !== taskId));
    toast.success('Task removed');
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((t) => t.study_date === dateStr);
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AIThinkingLoader />
        <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          Creating your personalized study plan...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Study Planner
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Your AI-powered study schedule
          </p>
        </div>
        <button onClick={() => setShowGenerateModal(true)} className="btn-primary text-sm shrink-0">
          <Sparkles size={16} /> Generate AI Plan
        </button>
      </div>

      {/* Week nav */}
      <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="btn-ghost text-xs sm:text-sm"
        >
          ← Prev
        </button>
        <span className="text-xs sm:text-sm font-semibold text-center flex-1 min-w-0">
          {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </span>
        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="btn-ghost text-xs sm:text-sm"
        >
          Next →
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDate(day);
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="card min-h-[200px]"
              style={{
                padding: '12px',
                borderColor: today ? 'var(--accent)' : 'var(--border)',
                background: today ? 'var(--accent-glow)' : 'var(--bg-card)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold"
                  style={{ color: today ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  {format(day, 'EEE')}
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    className="rounded-lg p-2 text-xs border group"
                    style={{
                      background: task.completed ? 'rgba(34,197,94,0.08)' : 'var(--bg-secondary)',
                      borderColor: task.completed ? 'rgba(34,197,94,0.2)' : 'var(--border-subtle)',
                      opacity: task.completed ? 0.7 : 1,
                    }}
                  >
                    <div className="flex items-start gap-1.5">
                      <button
                        onClick={() => handleToggle(task.id)}
                        className="mt-0.5 shrink-0"
                      >
                        <div
                          className="w-4 h-4 rounded border flex items-center justify-center"
                          style={{
                            borderColor: task.completed ? 'var(--success)' : 'var(--border)',
                            background: task.completed ? 'var(--success)' : 'transparent',
                          }}
                        >
                          {task.completed && <Check size={10} className="text-white" />}
                        </div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium leading-tight ${task.completed ? 'line-through' : ''}`}>
                          {task.title}
                        </p>
                        {task.duration_minutes && (
                          <span className="flex items-center gap-0.5 mt-1" style={{ color: 'var(--text-muted)' }}>
                            <Clock size={10} /> {task.duration_minutes}m
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={12} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </div>
                    {task.subject && (
                      <div className="mt-1.5">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-1"
                          style={{ background: getSubjectColor(task.subject) }}
                        />
                        <span style={{ color: 'var(--text-muted)' }}>{task.subject}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="card w-full max-w-lg"
              style={{ padding: '32px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  Generate Study Plan
                </h2>
                <button onClick={() => setShowGenerateModal(false)} className="btn-ghost p-2">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    Subjects (comma-separated)
                  </label>
                  <input
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    className="input"
                    placeholder="Math, Physics, Chemistry"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    Deadlines (one per line: Subject: YYYY-MM-DD)
                  </label>
                  <textarea
                    value={deadlines}
                    onChange={(e) => setDeadlines(e.target.value)}
                    className="input min-h-[80px]"
                    placeholder={'Math: 2026-06-01\nPhysics: 2026-06-05'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                      Hours/Day
                    </label>
                    <input
                      type="number"
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(Number(e.target.value))}
                      className="input"
                      min={1}
                      max={12}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                      Session Length (min)
                    </label>
                    <input
                      type="number"
                      value={sessionLength}
                      onChange={(e) => setSessionLength(Number(e.target.value))}
                      className="input"
                      min={15}
                      max={120}
                    />
                  </div>
                </div>

                <button onClick={handleGenerate} className="btn-primary w-full">
                  <Sparkles size={16} /> Generate Plan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
