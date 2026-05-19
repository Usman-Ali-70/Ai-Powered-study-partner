'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Search, FileText } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase/client';
import { NoteCard } from '@/components/notes/NoteCard';
import { PDFUploader } from '@/components/notes/PDFUploader';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { EmptyState } from '@/components/shared/EmptyState';
import { useRouter, useSearchParams } from 'next/navigation';
import { Note } from '@/types';

export default function NotesPage() {
  const { user, notes, setNotes } = useAppStore();
  const [showUploader, setShowUploader] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [subjectFilter, setSubjectFilter] = useState('');
  const router = useRouter();

  // Sync ?q= updates from the topbar into the local search state
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchNotes = async () => {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setNotes(data);
    };
    fetchNotes();
  }, [user?.id, setNotes]);

  const subjects = [...new Set(notes.map(n => n.subject).filter(Boolean))] as string[];

  const filtered = notes.filter((n) => {
    const matchesSearch = !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = !subjectFilter || n.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const handleUploadComplete = (note: { id: string }) => {
    setShowUploader(false);
    router.push(`/notes/${note.id}`);
  };

  const handleNoteSave = (note: { id: string }) => {
    setShowEditor(false);
    router.push(`/notes/${note.id}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            My Notes
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {notes.length} note{notes.length !== 1 ? 's' : ''} in your library
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
          <button onClick={() => setShowUploader(true)} className="btn-secondary text-sm flex-1 sm:flex-initial">
            <Upload size={16} /> <span className="hidden xs:inline">Upload</span> Document
          </button>
          <button onClick={() => setShowEditor(true)} className="btn-primary text-sm flex-1 sm:flex-initial">
            <Plus size={16} /> New Note
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)', zIndex: 10 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input w-full"
            style={{ paddingLeft: '36px' }}
            placeholder="Search notes..."
          />
        </div>
        {subjects.length > 0 && (
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="input w-auto min-w-[150px]"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      {/* Notes Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={notes.length === 0 ? 'No notes yet' : 'No matching notes'}
          description={
            notes.length === 0
              ? 'Upload a PDF or create notes manually to get started with AI-powered studying.'
              : 'Try adjusting your search or filters.'
          }
          action={
            notes.length === 0
              ? { label: 'Create Your First Note', onClick: () => setShowEditor(true) }
              : undefined
          }
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onChat={() => router.push(`/notes/${note.id}`)}
              onQuiz={() => router.push(`/quiz/generate?noteId=${note.id}`)}
              onFlashcards={() => router.push(`/flashcards?generate=${note.id}`)}
            />
          ))}
        </motion.div>
      )}

      {/* Modals */}
      {showUploader && (
        <PDFUploader
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUploader(false)}
        />
      )}
      {showEditor && (
        <NoteEditor
          onSave={handleNoteSave}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
