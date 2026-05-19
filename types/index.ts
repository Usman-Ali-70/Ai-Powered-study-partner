export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  summary?: string;
  source_type: 'manual' | 'pdf' | 'paste';
  file_url?: string;
  subject?: string;
  tags?: string[];
  word_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id?: string;
  note_id?: string;
  user_id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correct: string;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  userAnswer?: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  note_id?: string;
  title: string;
  subject?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  score?: number;
  total_questions: number;
  time_taken_seconds?: number;
  completed_at?: string;
  created_at: string;
}

export interface FlashcardDeck {
  id: string;
  user_id: string;
  note_id?: string;
  title: string;
  subject?: string;
  card_count: number;
  last_studied?: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  user_id: string;
  front: string;
  back: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  last_quality?: number;
  created_at: string;
}

export interface StudyTask {
  id: string;
  user_id: string;
  title: string;
  subject?: string;
  description?: string;
  due_date?: string;
  study_date?: string;
  duration_minutes?: number;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  ai_generated: boolean;
  created_at: string;
}

export interface AnalyticsInsight {
  weakAreas: string[];
  recommendations: string[];
  studyPriority: 'high' | 'medium' | 'low';
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'true_false' | 'short_answer';
