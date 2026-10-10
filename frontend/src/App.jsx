import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthView from './components/AuthView';
import ChatView from './components/ChatView';
import AdminDashboardView from './components/AdminDashboardView';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('novachat_theme') || 'dark';
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('novachat_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'admin'
  const [currentSession, setCurrentSession] = useState(null);

  // Sync theme with document HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('novachat_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const saved = localStorage.getItem('novachat_user');
        const parsed = saved ? JSON.parse(saved) : null;
        setUser(parsed);
        if (parsed?.role === 'ROLE_ADMIN') {
          setActiveTab('admin');
        } else {
          setActiveTab('chat');
        }
        setCurrentSession(null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener('auth_change', handleAuthChange);
    return () => window.removeEventListener('auth_change', handleAuthChange);
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'ROLE_ADMIN') {
      setActiveTab('admin');
    } else {
      setActiveTab('chat');
    }
  };

  if (!user) {
    return (
      <AuthView
        theme={theme}
        toggleTheme={toggleTheme}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentSession={currentSession}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1">
        {activeTab === 'chat' ? (
          <ChatView
            user={user}
            currentSession={currentSession}
            setCurrentSession={setCurrentSession}
            theme={theme}
          />
        ) : (
          <AdminDashboardView theme={theme} />
        )}
      </main>
    </div>
  );
}
