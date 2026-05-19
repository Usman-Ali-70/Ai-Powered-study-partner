-- ============================================
-- StudyMind AI — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- NOTES
-- ==========================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT,
  summary TEXT,
  subject TEXT,
  source_type TEXT DEFAULT 'manual', -- 'manual' | 'pdf'
  file_url TEXT,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Service role bypass for API routes
CREATE POLICY "Service role full access to notes" ON notes
  FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- QUIZZES
-- ==========================================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'AI Generated Quiz',
  subject TEXT,
  difficulty TEXT DEFAULT 'medium',
  questions JSONB NOT NULL DEFAULT '[]',
  total_questions INTEGER DEFAULT 0,
  score INTEGER,
  time_taken_seconds INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quizzes" ON quizzes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quizzes" ON quizzes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes" ON quizzes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quizzes" ON quizzes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to quizzes" ON quizzes
  FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- FLASHCARD DECKS
-- ==========================================
CREATE TABLE IF NOT EXISTS flashcard_decks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'AI Flashcards',
  subject TEXT,
  card_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own decks" ON flashcard_decks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decks" ON flashcard_decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks" ON flashcard_decks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks" ON flashcard_decks
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to flashcard_decks" ON flashcard_decks
  FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- FLASHCARDS (individual cards)
-- ==========================================
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  ease_factor NUMERIC DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own flashcards" ON flashcards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcards" ON flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards" ON flashcards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcards" ON flashcards
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to flashcards" ON flashcards
  FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- STUDY TASKS (Planner)
-- ==========================================
CREATE TABLE IF NOT EXISTS study_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  study_date DATE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  priority TEXT DEFAULT 'medium',
  completed BOOLEAN DEFAULT FALSE,
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON study_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON study_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON study_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON study_tasks
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to study_tasks" ON study_tasks
  FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- INDEXES for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_note_id ON quizzes(note_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id ON flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review);
CREATE INDEX IF NOT EXISTS idx_study_tasks_user_id ON study_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_study_date ON study_tasks(study_date);

-- ==========================================
-- Storage bucket for PDF uploads
-- ==========================================
-- Run this separately or via the Supabase dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('notes', 'notes', false);
