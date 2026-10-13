import React from 'react';
import { Bot, Shield, LogOut, Sparkles, User as UserIcon, Database, Sun, Moon } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ user, activeTab, setActiveTab, currentSession, theme, toggleTheme }) {
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#090d16]/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 shadow-md shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                NovaChat <span className="text-brand-600 dark:text-brand-400 font-extrabold">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                Enterprise Edition
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><Database className="w-3 h-3 text-emerald-500" /> MySQL Workbench</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Bot className="w-3 h-3 text-brand-500" /> AI Neural Engine</span>
            </div>
          </div>
        </div>

        {/* Navigation Switcher (For Admin to toggle Chat vs Control Center) */}
        {isAdmin && (
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'chat'
                  ? 'bg-brand-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Chatbot</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'admin'
                  ? 'bg-brand-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-500 dark:text-amber-300" />
              <span>Admin Center</span>
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full border border-amber-500/20">
                Sole Admin
              </span>
            </button>
          </div>
        )}

        {/* Right side controls: Theme Toggle, Session, Profile */}
        <div className="flex items-center gap-3">
          
          {/* Light / Dark Mode Toggle Switch */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-brand-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {currentSession && activeTab === 'chat' && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{currentSession.sessionUuid.slice(0, 10)}...</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.fullName || user?.username}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
                {isAdmin ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                    <Shield className="w-3 h-3" /> Super Admin
                  </span>
                ) : (
                  <span className="text-brand-600 dark:text-brand-300 flex items-center gap-0.5">
                    <UserIcon className="w-3 h-3" /> Customer
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => api.logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all shadow-sm ml-1"
              title="Sign Out / Back to Login"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
