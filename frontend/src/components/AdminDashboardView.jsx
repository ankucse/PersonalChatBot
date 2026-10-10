import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import MarkdownRenderer from './MarkdownRenderer';
import {
  Shield,
  Users,
  MessageSquare,
  Activity,
  Zap,
  Clock,
  Search,
  RefreshCw,
  Database,
  CheckCircle,
  X,
  Download,
  Bot,
  ChevronRight,
  Server,
  Layers,
  Cpu
} from 'lucide-react';

export default function AdminDashboardView() {
  const [subTab, setSubTab] = useState('sessions'); // 'sessions' | 'users' | 'settings'
  const [metrics, setMetrics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected session for full audit inspection modal
  const [selectedSessionUuid, setSelectedSessionUuid] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setRefreshing(true);
      const [metricsData, sessionsData, usersData, configData] = await Promise.all([
        api.getAdminMetrics().catch(() => null),
        api.getAdminSessions().catch(() => []),
        api.getAdminUsers().catch(() => []),
        api.getAdminConfig().catch(() => null),
      ]);
      setMetrics(metricsData);
      setSessions(sessionsData || []);
      setUsers(usersData || []);
      setConfig(configData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleInspectSession = async (sessionUuid) => {
    setSelectedSessionUuid(sessionUuid);
    setLoadingDetail(true);
    setSessionDetail(null);
    try {
      const detail = await api.getAdminSessionDetail(sessionUuid);
      setSessionDetail(detail);
    } catch (err) {
      console.error("Failed to load session details", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.username?.toLowerCase().includes(q) ||
      s.userEmail?.toLowerCase().includes(q) ||
      s.sessionUuid?.toLowerCase().includes(q) ||
      s.title?.toLowerCase().includes(q)
    );
  });

  const exportSessionJson = () => {
    if (!sessionDetail) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessionDetail, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `session-audit-${sessionDetail.sessionUuid}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Enterprise Admin Control Center
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Sole Super Admin governance: Audit customer sessions, inspect full question logs, and monitor MySQL backend activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* KPI SaaS Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Users</span>
            <Users className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics?.totalUsers ?? '...'}</div>
          <div className="text-[11px] text-slate-500 mt-1">1 Sole Admin</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Sessions</span>
            <MessageSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics?.totalSessions ?? '...'}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">{metrics?.activeSessions ?? 0} active</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Questions</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics?.totalQuestions ?? '...'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Stored in MySQL</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Questions Today</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics?.questionsToday ?? '...'}</div>
          <div className="text-[11px] text-slate-500 mt-1">24h rolling</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Avg AI Latency</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{metrics?.averageResponseTimeMs ?? '...'} ms</div>
          <div className="text-[11px] text-slate-500 mt-1">AI Core Engine</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Tokens Used</span>
            <Bot className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{metrics?.totalEstimatedTokens ?? '...'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Est. Generation</div>
        </div>

      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            subTab === 'sessions'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Sessions & Questions Auditor ({sessions.length})</span>
        </button>

        <button
          onClick={() => setSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            subTab === 'users'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Users ({users.length})</span>
        </button>

        <button
          onClick={() => setSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            subTab === 'settings'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>AI Engine & Backend Architecture</span>
        </button>
      </div>

      {/* SubTab 1: Sessions & Question Auditor */}
      {subTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, email, or session..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 shadow-sm"
              />
            </div>
            <div className="text-xs text-slate-500">
              Showing {filteredSessions.length} of {sessions.length} sessions
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 bg-white dark:bg-slate-900/50">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30 text-brand-500" />
              <p className="text-sm font-medium">No sessions matching query</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d121f] shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Session ID</th>
                    <th className="py-3.5 px-4">Started At</th>
                    <th className="py-3.5 px-4 text-center">Questions</th>
                    <th className="py-3.5 px-4">Initial Question Preview</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {filteredSessions.map((s) => (
                    <tr key={s.sessionUuid} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{s.userFullName || s.username}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{s.userEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-brand-600 dark:text-brand-300">
                        {s.sessionUuid.slice(0, 14)}...
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(s.startedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-bold bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                          {s.totalQuestions}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400 italic">
                        {s.firstQuestionExcerpt ? `"${s.firstQuestionExcerpt}"` : <span className="text-slate-400">No questions yet</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {s.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold">
                            CLOSED
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleInspectSession(s.sessionUuid)}
                          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition-all shadow-sm flex items-center gap-1 ml-auto"
                        >
                          <span>Inspect Questions</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SubTab 2: Registered Users */}
      {subTab === 'users' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d121f] shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4 text-center">Total Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{u.fullName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-brand-600 dark:text-brand-300">{u.username}</td>
                    <td className="py-3.5 px-4">
                      {u.role === 'ROLE_ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 font-bold text-[10px]">
                          <Shield className="w-3 h-3 text-amber-500" /> Sole Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px]">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                      {u.sessionCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: AI Engine & Backend Architecture Status */}
      {subTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* AI Engine Status */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-brand-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Enterprise AI Engine</h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                <CheckCircle className="w-3 h-3" /> Fully Configured on Server
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              AI orchestration is handled centrally on the backend application server. Customers interact with a seamless conversational interface without handling keys.
            </p>

            <div className="space-y-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Active Model:</span>
                <span className="font-semibold text-brand-600 dark:text-brand-300">{config?.geminiModel || 'NovaChat AI v2.5'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Tokens:</span>
                <span className="text-slate-800 dark:text-slate-200">{config?.maxTokens || 2048}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Temperature:</span>
                <span className="text-slate-800 dark:text-slate-200">{config?.temperature || 0.7}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Server Management:</span>
                <span className="text-emerald-600 dark:text-emerald-400">application.yml / Environment</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              🔒 <strong>Server-Side Security:</strong> The backend securely manages all model interactions. No API keys or internal configurations are ever transmitted to or requested from customers.
            </div>
          </div>

          {/* MySQL Database Configuration */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">MySQL Workbench & Backend Persistence</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every chat question asked by any customer across all sessions is persistently recorded in the MySQL relational schema for compliance and administrative inspection.
            </p>

            <div className="space-y-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Database:</span>
                <span className="text-emerald-600 dark:text-emerald-400">novachat_db (Port 3306)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Driver:</span>
                <span className="text-slate-800 dark:text-slate-200">com.mysql.cj.jdbc.Driver</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dialect:</span>
                <span className="text-slate-800 dark:text-slate-200">org.hibernate.dialect.MySQLDialect</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Audit Tables:</span>
                <span className="text-brand-600 dark:text-brand-300">app_users, chat_sessions, chat_questions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Question Storage:</span>
                <span className="text-cyan-600 dark:text-cyan-400">LONGTEXT</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              💡 <strong>MySQL Workbench Querying:</strong> View questions live in MySQL Workbench with:
              <code className="block mt-1 p-2 rounded bg-slate-100 dark:bg-slate-950 font-mono text-brand-600 dark:text-brand-300 border border-slate-200 dark:border-slate-800">
                SELECT * FROM novachat_db.chat_questions ORDER BY asked_at DESC;
              </code>
            </div>
          </div>

        </div>
      )}

      {/* Full Session Audit Inspection Modal */}
      {selectedSessionUuid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-[#090d16] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Session Audit Inspector</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                    {selectedSessionUuid}
                  </span>
                </div>
                {sessionDetail && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Customer: <strong className="text-slate-900 dark:text-white">{sessionDetail.userFullName}</strong> ({sessionDetail.userEmail}) • {sessionDetail.totalQuestions} Questions asked
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportSessionJson}
                  disabled={!sessionDetail}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700"
                  title="Export session to JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export Audit</span>
                </button>
                <button
                  onClick={() => setSelectedSessionUuid(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: List of All Questions in Session */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
              {loadingDetail ? (
                <div className="py-20 text-center text-slate-500 text-sm">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  Loading question audit trail from MySQL Workbench DB...
                </div>
              ) : sessionDetail?.questions?.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No questions were asked in this session.
                </div>
              ) : (
                sessionDetail?.questions?.map((q) => (
                  <div key={q.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
                    
                    {/* Question Header */}
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-300 font-bold text-[11px]">
                          Question #{q.questionNumber}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {new Date(q.askedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span className="text-yellow-600 dark:text-yellow-400">⚡ {q.responseTimeMs} ms</span>
                        <span>•</span>
                        <span className="text-cyan-600 dark:text-cyan-400">~{q.tokensEstimated} tokens</span>
                        <span>•</span>
                        <span className="text-slate-500">{q.modelUsed}</span>
                      </div>
                    </div>

                    {/* Question Text Prompt */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Customer Prompt Asked:
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
                        {q.questionText}
                      </p>
                    </div>

                    {/* AI Answer */}
                    <div>
                      <div className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5" /> AI Answer Stored:
                      </div>
                      <div className="bg-white dark:bg-[#0b0f19] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                        <MarkdownRenderer content={q.responseText} />
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-right">
              <button
                onClick={() => setSelectedSessionUuid(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-all"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
