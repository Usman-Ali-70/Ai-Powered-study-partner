'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  User,
  Plus,
  Trash2,
  MessageSquare,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ChevronLeft,
  Bot,
  Zap,
  Code2,
  BookOpen,
  Lightbulb,
  PenTool,
} from 'lucide-react';
import { useChatStore, type ChatMsg } from '@/store/useChatStore';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/lib/utils';

const quickPrompts = [
  { icon: Code2, label: 'Write code', prompt: 'Write a function that ' },
  { icon: BookOpen, label: 'Explain concept', prompt: 'Explain the concept of ' },
  { icon: Lightbulb, label: 'Study tips', prompt: 'Give me effective study tips for ' },
  { icon: PenTool, label: 'Help me write', prompt: 'Help me write a ' },
];

function generateMsgId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function ChatContent() {
  const {
    conversations,
    activeConversationId,
    settings,
    createConversation,
    deleteConversation,
    setActiveConversation,
    addMessage,
    updateLastAssistantMessage,
    toggleLike,
    toggleDislike,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchParams = useSearchParams();

  // Load prefilled prompt if present in URL
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam) {
      setInput(promptParam);
      // Clean up the URL search param so refreshing the page doesn't re-populate it
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [searchParams]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages ?? [];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = useCallback(async (overrideInput?: string) => {
    const text = (overrideInput ?? input).trim();
    if (!text || streaming) return;

    setError(null);
    let convId = activeConversationId;
    if (!convId) {
      convId = createConversation();
    }

    const userMsg: ChatMsg = {
      id: generateMsgId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    addMessage(convId, userMsg);
    setInput('');
    setStreaming(true);

    // Get all messages for context
    const currentConv = useChatStore.getState().conversations.find((c) => c.id === convId);
    const allMessages = currentConv ? currentConv.messages : [userMsg];

    const assistantMsg: ChatMsg = {
      id: generateMsgId(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };
    addMessage(convId, assistantMsg);

    try {
      abortControllerRef.current = new AbortController();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          model: settings.model,
          temperature: settings.temperature,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value);
        updateLastAssistantMessage(convId!, accumulated);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const errorMsg = err instanceof Error ? err.message : 'Failed to get response';
      setError(errorMsg);
      updateLastAssistantMessage(
        convId!,
        'Sorry, I encountered an error. Please try again.'
      );
      toast.error(errorMsg);
    } finally {
      setStreaming(false);
      abortControllerRef.current = null;
      textareaRef.current?.focus();
    }
  }, [input, streaming, activeConversationId, settings, createConversation, addMessage, updateLastAssistantMessage]);

  const handleRetry = () => {
    if (!activeConversation || messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove last assistant msg from state by updating it
      handleSend(lastUserMsg.content);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    createConversation();
    setInput('');
    setError(null);
  };

  return (
    <div className="absolute inset-0 flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border)] shrink-0 overflow-hidden md:static fixed top-16 left-0 bottom-0 z-40 md:w-auto w-[280px]"
          >
            <div className="flex items-center gap-2 h-14 px-3 border-b border-[var(--border)] shrink-0">
              <button onClick={handleNewChat} className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-primary)] font-body text-[13px] font-semibold hover:border-[var(--accent)] hover:bg-[var(--accent-glow)] hover:text-[var(--accent)] transition-all">
                <Plus size={15} />
                <span>New Chat</span>
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all flex items-center shrink-0"
                title="Close sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
                  <MessageSquare size={20} style={{ color: 'var(--text-muted)' }} />
                  <p className="text-xs text-[var(--text-muted)]">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2.5 p-3 rounded-xl cursor-pointer transition-all mb-0.5 ${
                      conv.id === activeConversationId 
                        ? 'bg-gradient-to-r from-[rgba(108,99,255,0.15)] to-[rgba(108,99,255,0.04)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_rgba(108,99,255,0.2)]' 
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                    }`}
                    onClick={() => setActiveConversation(conv.id)}
                  >
                    <MessageSquare size={14} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-inherit truncate">
                        {conv.title}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {formatRelativeTime(conv.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="p-1.5 rounded-md text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:bg-[rgba(239,68,68,0.15)] hover:text-[var(--error)] transition-all"
                      title="Delete conversation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[11px] font-semibold text-[var(--accent)] font-mono w-fit">
                <Zap size={12} />
                <span>{settings.model.includes('llama') ? settings.model : 'Llama 3.3 (Groq)'}</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)] relative">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--border)] bg-[rgba(5,5,8,0.85)] backdrop-blur-md z-10">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 mr-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all flex items-center"
            >
              <MessageSquare size={18} />
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <Bot size={18} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-semibold truncate font-display">
              {activeConversation ? activeConversation.title : 'StudyMind AI Chat'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[11px] font-semibold text-[var(--accent)] font-mono w-fit">
            <Zap size={12} />
            <span>{settings.model.includes('llama') ? 'Llama 3.3' : 'Groq AI'}</span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-[480px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] text-[var(--accent)] flex items-center justify-center mx-auto mb-5">
                  <Sparkles size={32} />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">How can I help you today?</h2>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
                  Ask me anything — code, concepts, study tips, or creative writing.
                  Powered by Groq Ultra-Fast Inference.
                </p>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  {quickPrompts.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => {
                        setInput(qp.prompt);
                        textareaRef.current?.focus();
                      }}
                      className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-[13px] font-medium text-left hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)] hover:-translate-y-0.5 transition-all"
                    >
                      <qp.icon size={16} />
                      <span>{qp.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-w-[800px] mx-auto">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-4 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)]' 
                      : 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-secondary)] text-white'
                  }`}>
                    {msg.role === 'assistant' ? <Sparkles size={16} /> : <User size={16} />}
                  </div>

                  {/* Content */}
                  <div className={`relative max-w-[90%] md:max-w-[80%] p-4 rounded-2xl text-[14.5px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] rounded-tr-sm' 
                      : 'bg-transparent text-[var(--text-primary)] py-1'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <>
                        {msg.content ? (
                          <MarkdownRenderer content={msg.content} />
                        ) : (
                          streaming && i === messages.length - 1 && <TypingIndicator />
                        )}
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {/* Actions bar */}
                    {msg.role === 'assistant' && msg.content && !(streaming && i === messages.length - 1) && (
                      <div className="flex items-center gap-1.5 mt-3">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="flex items-center justify-center w-7 h-7 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all"
                          title="Copy"
                        >
                          {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                        <button
                          onClick={() => activeConversationId && toggleLike(activeConversationId, msg.id)}
                          className={`flex items-center justify-center w-7 h-7 rounded-md transition-all ${
                            msg.liked ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                          }`}
                          title="Good response"
                        >
                          <ThumbsUp size={13} />
                        </button>
                        <button
                          onClick={() => activeConversationId && toggleDislike(activeConversationId, msg.id)}
                          className={`flex items-center justify-center w-7 h-7 rounded-md transition-all ${
                            msg.disliked ? 'text-[var(--error)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                          }`}
                          title="Poor response"
                        >
                          <ThumbsDown size={13} />
                        </button>
                      </div>
                    )}

                    {/* Timestamp */}
                    {settings.showTimestamps && msg.timestamp && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-2 text-right font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Error retry */}
              {error && !streaming && (
                <div className="flex justify-center mt-2">
                  <button onClick={handleRetry} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[var(--error)] text-xs font-semibold hover:bg-[rgba(239,68,68,0.15)] transition-all">
                    <RotateCcw size={14} />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-[var(--bg-primary)] from-80% to-transparent">
          <div className="max-w-[800px] mx-auto relative bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[20px] p-3 px-4 flex flex-col focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_var(--accent-glow)] transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="w-full bg-transparent border-none outline-none text-[var(--text-primary)] font-body text-[14.5px] resize-none max-h-[200px] p-0 mb-2 leading-relaxed placeholder:text-[var(--text-muted)] focus:ring-0 focus:outline-none focus:border-none focus:shadow-none"
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              rows={1}
              disabled={streaming}
            />
            <div className="flex items-center justify-end gap-3">
              <span className="text-[11px] font-mono text-[var(--text-muted)]">{input.length}</span>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || streaming}
                className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-[var(--accent)] text-white disabled:bg-[var(--bg-card)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed hover:not(:disabled):bg-[var(--accent-hover)] hover:not(:disabled):scale-105 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-[var(--text-muted)] mt-3">
            StudyMind AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="dash-loading">
        <div className="dash-loading-icon" />
        <p>Loading Chat...</p>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
