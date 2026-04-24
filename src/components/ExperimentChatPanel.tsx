'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
}

interface ExperimentChatPanelProps {
  experimentName: string;
  experimentTopic?: string;
  currentParams?: Record<string, number>;
  onClose: () => void;
}

export function ExperimentChatPanel({
  experimentName,
  experimentTopic,
  currentParams,
  onClose,
}: ExperimentChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-inject context message on first open
  useEffect(() => {
    const contextMsg = buildContextMessage(experimentName, experimentTopic, currentParams);
    setMessages([{ role: 'assistant', content: contextMsg }]);
    inputRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);

    const userMsg: ChatMessage = { role: 'user', content: text };
    const pendingMsg: ChatMessage = { role: 'assistant', content: '', pending: true };

    setMessages(prev => [...prev, userMsg, pendingMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const systemMsg = {
        role: 'system' as const,
        content: `你是「Eureka」实验教学平台的 AI 教学助手。用户正在学习「${experimentName}」实验${experimentTopic ? `（${experimentTopic}）` : ''}。请用清晰、友好的语言帮助用户理解相关概念和实验原理。回答要简洁，适合中学生理解。`,
      };

      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [systemMsg, ...history],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.content ?? '抱歉，我暂时无法回答这个问题。';

      setMessages(prev => {
        const next = [...prev];
        const lastIdx = next.length - 1;
        if (next[lastIdx]?.pending) {
          next[lastIdx] = { role: 'assistant', content: assistantContent };
        }
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请重试');
      setMessages(prev => prev.filter(m => !m.pending));
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, experimentName, experimentTopic]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <div>
            <p className="font-semibold text-sm">AI 教学助手</p>
            <p className="text-xs opacity-80">{experimentName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors text-xl leading-none"
          aria-label="关闭"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              } ${msg.pending ? 'animate-pulse' : ''}`}
            >
              {msg.pending ? (
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        {error && (
          <div className="text-center text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
            ⚠️ {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="问我任何关于这个实验的问题..."
            rows={2}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="shrink-0 w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="发送"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">Enter 发送 · Shift+Enter 换行</p>
      </div>
    </div>
  );
}

function buildContextMessage(
  name: string,
  topic?: string,
  params?: Record<string, number>,
): string {
  let msg = `你好！我是 AI 教学助手 👋\n\n你正在学习「${name}」实验`;
  if (topic) msg += `，主题是「${topic}」`;
  msg += '。\n\n';

  if (params && Object.keys(params).length > 0) {
    msg += '当前实验参数：\n';
    for (const [k, v] of Object.entries(params)) {
      msg += `• ${k}: ${v}\n`;
    }
    msg += '\n';
  }

  msg += '你可以问我：\n• 这个实验的原理是什么？\n• 为什么会出现这种现象？\n• 这个公式是怎么推导的？\n• 生活中有哪些应用？';
  return msg;
}
