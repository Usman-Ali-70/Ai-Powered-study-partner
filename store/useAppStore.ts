import { create } from 'zustand';
import { Note, Quiz, FlashcardDeck, StudyTask, ChatMessage } from '@/types';

interface AppState {
  // User
  user: { id: string; email: string; full_name?: string } | null;
  setUser: (user: AppState['user']) => void;

  // Notes
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Active note chat
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateLastChatMessage: (content: string) => void;

  // Quizzes
  quizzes: Quiz[];
  setQuizzes: (quizzes: Quiz[]) => void;
  addQuiz: (quiz: Quiz) => void;
  deleteQuiz: (id: string) => void;

  // Flashcards
  decks: FlashcardDeck[];
  setDecks: (decks: FlashcardDeck[]) => void;
  addDeck: (deck: FlashcardDeck) => void;
  deleteDeck: (id: string) => void;

  // Study Tasks
  tasks: StudyTask[];
  setTasks: (tasks: StudyTask[]) => void;
  addTasks: (tasks: StudyTask[]) => void;
  toggleTask: (id: string) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  notes: [],
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (id, data) =>
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    })),
  deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

  chatMessages: [],
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) =>
    set((s) => ({ chatMessages: [...s.chatMessages, message] })),
  updateLastChatMessage: (content) =>
    set((s) => {
      const updated = [...s.chatMessages];
      if (updated.length > 0) {
        updated[updated.length - 1] = { ...updated[updated.length - 1], content };
      }
      return { chatMessages: updated };
    }),

  quizzes: [],
  setQuizzes: (quizzes) => set({ quizzes }),
  addQuiz: (quiz) => set((s) => ({ quizzes: [quiz, ...s.quizzes] })),
  deleteQuiz: (id) => set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== id) })),

  decks: [],
  setDecks: (decks) => set({ decks }),
  addDeck: (deck) => set((s) => ({ decks: [deck, ...s.decks] })),
  deleteDeck: (id) => set((s) => ({ decks: s.decks.filter((d) => d.id !== id) })),

  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTasks: (newTasks) => set((s) => ({ tasks: [...s.tasks, ...newTasks] })),
  toggleTask: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
