import React, { useState } from 'react';
import { api } from '../services/api';
import { Shield, Sparkles, User, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Sun, Moon } from 'lucide-react';

export default function AuthView({ onAuthSuccess, theme, toggleTheme }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      if (isRegister) {
        data = await api.register(cleanUsername, email.trim(), cleanPassword, fullName.trim());
      } else {
        data = await api.login(cleanUsername, cleanPassword);
      }
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      
      {/* Background ambient glowing mesh */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 dark:bg-brand-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-brand-600 hover:-rotate-12 transition-transform" />
          )}
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: SaaS Value Proposition */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
            <span>Enterprise Conversational AI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            Conversational Intelligence with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 dark:from-brand-400 dark:via-indigo-300 dark:to-violet-400">Zero Leakage</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            State-of-the-art enterprise conversational platform powered by <strong>Enterprise AI Intelligence</strong> and persisted securely across your <strong>MySQL Database</strong>.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span><strong>Session Privacy:</strong> Customers experience clean, focused, distraction-free sessions.</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span><strong>Unified Database Persistence:</strong> Complete relational history indexed in MySQL Workbench.</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span><strong>Enterprise Security:</strong> Authenticated sessions with stateless JWT & encrypted credentials.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Secure SaaS Login Form */}
        <div className="lg:col-span-6">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden bg-white/95 dark:bg-[#0d121f]/90 transition-colors duration-200">
            
            {/* Header Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900/90 p-1 border border-slate-200 dark:border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  !isRegister
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  isRegister
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRegister ? 'Username' : 'Username or Email'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isRegister ? "your_username" : "Enter username or email"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Customer Account' : 'Sign In to Workspace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {!isRegister && (
                <div className="pt-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                    <span>Quick Fill:</span>
                    <button
                      type="button"
                      onClick={() => { setUsername('admin'); setPassword('Admin@NovaChat2026!'); setError(null); }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium transition-colors border border-amber-500/20 text-[11px]"
                    >
                      👑 Super Admin
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => { setUsername('sarah'); setPassword('User@NovaChat2026!'); setError(null); }}
                      className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-medium transition-colors border border-brand-500/20 text-[11px]"
                    >
                      👤 Customer
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-500">
                Protected by Spring Security 6 • BCrypt • MySQL 8.0 Persistence
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
