import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import MarkdownRenderer from './MarkdownRenderer';
import {
  Send,
  Sparkles,
  Bot,
  User,
  PlusCircle,
  Clock,
  Zap,
  Cpu,
  ArrowRight,
  ShieldAlert,
  Info,
  Loader2
} from 'lucide-react';

const SUGGESTIONS = [
  "🚀 Design an enterprise backend architecture for 1M DAU with Spring Boot & MySQL",
  "💾 Explain MySQL Indexing & Query Optimization for 10M rows in MySQL Workbench",
  "🔒 How does Stateless JWT with Spring Security 6 protect our endpoints?",
  "⚡ Compare High-Throughput & Low-Latency Distributed Architectures"
];

export default function ChatView({ user, currentSession, setCurrentSession }) {
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializingSession, setInitializingSession] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize or fetch current active session
  useEffect(() => {
    if (!currentSession) {
      startNewSession();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewSession = async () => {
    try {
      setInitializingSession(true);
      setError(null);
      if (currentSession?.sessionUuid) {
        await api.closeSession(currentSession.sessionUuid).catch(() => {});
      }
      const newSess = await api.createSession();
      setCurrentSession(newSess);
      setMessages([]); // Clears screen for user - Ephemeral user session mode
    } catch (err) {
      setError('Failed to initiate a new session: ' + err.message);
    } finally {
      setInitializingSession(false);
    }
  };

  const handleSend = async (questionText = null) => {
    const textToSend = (questionText || inputQuestion).trim();
    if (!textToSend || loading || !currentSession) return;

    setInputQuestion('');
    setError(null);

    // Optimistically add user question to UI
    const tempUserMsg = {
      id: Date.now(),
      type: 'user',
      questionNumber: messages.length + 1,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const response = await api.askQuestion(currentSession.sessionUuid, textToSend);

      const aiMsg = {
        id: response.id || Date.now() + 1,
        type: 'ai',
        questionNumber: response.questionNumber,
        text: response.responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs: response.responseTimeMs,
        model: response.modelUsed || 'AI Neural Engine',
        tokens: response.tokensEstimated || 150
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError('Chatbot error: ' + err.message);
    } finally {
      setLoading(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 sm:px-6 py-4">
      
      {/* Top Session Bar */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Active Session:</span>
            <span className="font-mono text-brand-600 dark:text-brand-300">
              {currentSession ? currentSession.sessionUuid : 'Connecting...'}
            </span>
          </div>
          
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Private Session (History not shown to user)</span>
          </div>
        </div>

        <button
          onClick={startNewSession}
          disabled={initializingSession || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 transition-all shadow-sm disabled:opacity-50"
          title="Start a fresh chat session"
        >
          {initializingSession ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
          ) : (
            <PlusCircle className="w-3.5 h-3.5 text-brand-500" />
          )}
          <span>New Session</span>
        </button>
      </div>

      {/* Main Conversation Feed */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center shadow-xl shadow-brand-500/20">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
            </div>

            <div className="max-w-md space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome, {user?.fullName || user?.username}!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                Ask me anything. Your session is active and streamed via AI models with backend database persistence.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {SUGGESTIONS.map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(text)}
                  className="p-3 text-left rounded-xl bg-white dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all group flex items-start justify-between gap-2 shadow-sm"
                >
                  <span className="line-clamp-2">{text}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all mt-0.5" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${
                msg.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.type === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-sm transition-all ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white rounded-br-none ml-auto'
                    : 'bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none shadow-sm'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-slate-100 dark:border-white/10 text-[11px] opacity-80">
                  <div className="flex items-center gap-1.5 font-medium">
                    {msg.type === 'user' ? (
                      <>
                        <User className="w-3 h-3" />
                        <span>You (Question #{msg.questionNumber})</span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1 text-brand-600 dark:text-brand-300 font-semibold">
                          <Zap className="w-3 h-3 text-amber-500" /> NovaChat AI
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {msg.model}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px]">{msg.time}</span>
                </div>

                {/* Message Body */}
                {msg.type === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                ) : (
                  <MarkdownRenderer content={msg.text} />
                )}

                {/* AI Footer Badges */}
                {msg.type === 'ai' && (
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Clock className="w-3 h-3" /> {msg.latencyMs} ms
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Cpu className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> ~{msg.tokens} tokens
                    </span>
                  </div>
                )}
              </div>

              {msg.type === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading state indicator */}
        {loading && (
          <div className="flex gap-3 sm:gap-4 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-3 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Generating response...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="my-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Area */}
      <div className="pt-3">
        <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 shadow-md transition-all p-2">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question... (Press Enter to send, Shift+Enter for new line)"
            className="w-full bg-transparent resize-none text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none px-3 pt-1.5 max-h-36 custom-scrollbar"
          />

          <div className="flex items-center justify-between px-3 pt-1 text-xs text-slate-400">
            <span className="text-[11px] hidden sm:inline">
              NovaChat Enterprise AI Workspace
            </span>
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputQuestion.trim() || !currentSession}
              className="ml-auto p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 disabled:hover:bg-brand-600 transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/20"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
