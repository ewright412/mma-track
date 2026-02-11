'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Plus, Brain } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { ChatMessage } from '@/lib/types/coach';
import {
  getConversations,
  createConversation,
  updateConversationMessages,
  getTodayUsage,
} from '@/lib/supabase/coachQueries';
import { CoachMarkdown } from '@/components/coach/CoachMarkdown';

const SUGGESTED_PROMPTS = [
  { text: 'What should I focus on this week?', icon: '🎯' },
  { text: 'Build me a training plan', icon: '📋' },
  { text: 'Analyze my sparring performance', icon: '🥊' },
  { text: 'How do I improve my weakest area?', icon: '📈' },
];

const MAX_DAILY = 30;

export default function CoachPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load existing conversation on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [convRes, usageRes] = await Promise.all([
        getConversations(),
        getTodayUsage(),
      ]);

      setUsageCount(usageRes.data);

      if (convRes.data && convRes.data.length > 0) {
        const latest = convRes.data[0];
        setConversationId(latest.id);
        setMessages(latest.messages || []);
      }
    } catch (err) {
      console.error('Failed to load coach data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleNewConversation() {
    const { data } = await createConversation();
    if (data) {
      setConversationId(data.id);
      setMessages([]);
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return;
    if (usageCount >= MAX_DAILY) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    // Create conversation if needed
    let convId = conversationId;
    if (!convId) {
      const { data } = await createConversation();
      if (data) {
        convId = data.id;
        setConversationId(data.id);
      } else {
        setIsStreaming(false);
        return;
      }
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setIsStreaming(false);
        return;
      }

      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: text.trim(),
          conversationHistory: messages.slice(-20).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error || 'Failed to get response';

        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `Sorry, I couldn't respond right now. ${errorMsg}`,
          timestamp: new Date().toISOString(),
        };
        const withError = [...updatedMessages, errorMessage];
        setMessages(withError);
        if (convId) {
          await updateConversationMessages(convId, withError);
        }
        setIsStreaming(false);
        return;
      }

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) {
        setIsStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages([...updatedMessages, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content: assistantContent,
          };
          return copy;
        });
      }

      // Save to database
      const finalMessages = [
        ...updatedMessages,
        { ...assistantMessage, content: assistantContent },
      ];
      setMessages(finalMessages);
      setUsageCount((c) => c + 1);

      if (convId) {
        await updateConversationMessages(convId, finalMessages);
      }
    } catch (err) {
      console.error('Coach error:', err);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      };
      const withError = [...updatedMessages, errorMessage];
      setMessages(withError);
      if (convId) {
        await updateConversationMessages(convId, withError);
      }
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex flex-col">
        <div className="p-4 border-b border-white/[0.08] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className="h-16 w-64 bg-white/5 rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isAtLimit = usageCount >= MAX_DAILY;

  return (
    <div className="min-h-screen bg-[#0f0f13] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0f0f13]/95 backdrop-blur-sm border-b border-white/[0.08]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Brain size={16} className="text-red-400" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm">AI Coach</h1>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[11px] text-gray-500">Online</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-all duration-150"
          >
            <Plus size={14} />
            New Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 md:pb-4">
        {messages.length === 0 ? (
          <EmptyState onSend={sendMessage} />
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-16 md:bottom-0 bg-[#0f0f13] border-t border-white/[0.08] px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isAtLimit
                    ? 'Daily limit reached — try again tomorrow'
                    : 'Ask your coach anything...'
                }
                disabled={isStreaming || isAtLimit}
                rows={1}
                className="w-full bg-[#1a1a24] border border-white/[0.08] rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500/30 resize-none disabled:opacity-50 transition-colors"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming || isAtLimit}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-600 transition-all duration-150"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[11px] text-gray-600 mt-1.5 text-center">
            {usageCount}/{MAX_DAILY} messages today
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function EmptyState({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <Brain size={32} className="text-red-400" />
      </div>
      <h2 className="text-white font-semibold text-lg mb-1">AI Coach</h2>
      <p className="text-gray-500 text-sm mb-8 text-center max-w-sm">
        Your personal MMA coach with full access to your training data. Ask anything.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt.text}
            onClick={() => onSend(prompt.text)}
            className="bg-[#1a1a24] border border-white/[0.05] rounded-xl p-4 text-left hover:border-red-500/30 transition-all duration-150 group"
          >
            <span className="text-lg mb-2 block">{prompt.icon}</span>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              {prompt.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center mt-1">
            <Brain size={14} className="text-red-400" />
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isUser
              ? 'bg-red-500/20 border border-red-500/30 rounded-br-md'
              : 'bg-[#1a1a24] border border-white/[0.05] rounded-bl-md'
          }`}
        >
          {isUser ? (
            <p className="text-sm text-white">{message.content}</p>
          ) : (
            <div className="text-gray-300">
              <CoachMarkdown content={message.content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-2">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center mt-1">
          <Brain size={14} className="text-red-400" />
        </div>
        <div className="bg-[#1a1a24] border border-white/[0.05] rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
