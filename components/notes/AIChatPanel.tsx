'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '@/types';
import { authedFetch } from '@/lib/api';

interface AIChatPanelProps {
  noteId: string;
  noteContent: string;
}

export function AIChatPanel({ noteId, noteContent }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setStreaming(true);

    try {
      const res = await authedFetch(`/api/notes/${noteId}/chat`, {
        method: 'POST',
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          noteContent,
        }),
      });

      if (!res.ok) throw new Error('Chat failed');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let aiMsg = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiMsg += decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: aiMsg };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <Sparkles size={16} style={{ color: 'var(--accent)' }} />
        <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          AI Tutor
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--accent-glow)' }}
            >
              <Sparkles size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <h4 className="text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              Chat with your notes
            </h4>
            <p className="text-xs max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
              Ask questions about your lecture notes and get AI-powered explanations
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1"
                style={{ background: 'var(--accent-glow)' }}
              >
                <Sparkles size={14} style={{ color: 'var(--accent)' }} />
              </div>
            )}
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={{
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, var(--accent), #8b5cf6)'
                  : 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              }}
            >
              <div
                className={streaming && i === messages.length - 1 && msg.role === 'assistant' ? 'typing-cursor' : ''}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {msg.content}
              </div>
            </div>
            {msg.role === 'user' && (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <User size={14} style={{ color: 'var(--text-secondary)' }} />
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="input flex-1"
            placeholder="Ask about your notes..."
            disabled={streaming}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="btn-primary p-3"
          >
            {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
