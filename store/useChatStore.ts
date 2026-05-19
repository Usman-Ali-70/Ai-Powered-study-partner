import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  liked?: boolean;
  disliked?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMsg[];
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSettings {
  model: 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768';
  temperature: number;
  maxTokens: number;
  fontSize: 'sm' | 'base' | 'lg';
  showTimestamps: boolean;
  theme: 'dark' | 'light' | 'system';
}

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  settings: ChatSettings;

  // Actions
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, msg: ChatMsg) => void;
  updateLastAssistantMessage: (conversationId: string, content: string) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  toggleLike: (conversationId: string, messageId: string) => void;
  toggleDislike: (conversationId: string, messageId: string) => void;
  clearAllConversations: () => void;
  updateSettings: (settings: Partial<ChatSettings>) => void;

  // Bookmarked prompts
  bookmarkedPrompts: string[];
  toggleBookmark: (promptTitle: string) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      settings: {
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        maxTokens: 4096,
        fontSize: 'base',
        showTimestamps: true,
        theme: 'dark',
      },
      bookmarkedPrompts: [],

      createConversation: () => {
        const id = generateId();
        const conv: Conversation = {
          id,
          title: 'New Chat',
          messages: [],
          model: get().settings.model,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({
          conversations: [conv, ...s.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
        })),

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addMessage: (conversationId, msg) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, msg],
                  updatedAt: new Date().toISOString(),
                  // Auto-title from first user message
                  title:
                    c.title === 'New Chat' && msg.role === 'user'
                      ? msg.content.slice(0, 50) + (msg.content.length > 50 ? '…' : '')
                      : c.title,
                }
              : c
          ),
        })),

      updateLastAssistantMessage: (conversationId, content) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const msgs = [...c.messages];
            if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
              msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
            }
            return { ...c, messages: msgs, updatedAt: new Date().toISOString() };
          }),
        })),

      updateConversationTitle: (conversationId, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? { ...c, title } : c
          ),
        })),

      toggleLike: (conversationId, messageId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId
                      ? { ...m, liked: !m.liked, disliked: false }
                      : m
                  ),
                }
              : c
          ),
        })),

      toggleDislike: (conversationId, messageId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId
                      ? { ...m, disliked: !m.disliked, liked: false }
                      : m
                  ),
                }
              : c
          ),
        })),

      clearAllConversations: () =>
        set({ conversations: [], activeConversationId: null }),

      updateSettings: (newSettings) =>
        set((s) => ({ settings: { ...s.settings, ...newSettings } })),

      toggleBookmark: (promptTitle) =>
        set((s) => ({
          bookmarkedPrompts: s.bookmarkedPrompts.includes(promptTitle)
            ? s.bookmarkedPrompts.filter((p) => p !== promptTitle)
            : [...s.bookmarkedPrompts, promptTitle],
        })),
    }),
    {
      name: 'studymind-chat-store',
      version: 1,
    }
  )
);
