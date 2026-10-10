const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('novachat_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('novachat_token');
    localStorage.removeItem('novachat_user');
    window.dispatchEvent(new Event('auth_change'));
    throw new Error('Session expired or unauthorized. Please sign in again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || data.error || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Authentication
  async login(usernameOrEmail, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('novachat_token', data.token);
      localStorage.setItem('novachat_user', JSON.stringify(data));
      window.dispatchEvent(new Event('auth_change'));
    }
    return data;
  },

  async register(username, email, password, fullName) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, fullName }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('novachat_token', data.token);
      localStorage.setItem('novachat_user', JSON.stringify(data));
      window.dispatchEvent(new Event('auth_change'));
    }
    return data;
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  logout() {
    localStorage.removeItem('novachat_token');
    localStorage.removeItem('novachat_user');
    window.dispatchEvent(new Event('auth_change'));
  },

  // Chat APIs (User & Admin)
  async createSession() {
    const res = await fetch(`${API_BASE}/chat/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  async askQuestion(sessionUuid, question) {
    const res = await fetch(`${API_BASE}/chat/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ sessionUuid, question }),
    });
    return handleResponse(res);
  },

  async closeSession(sessionUuid) {
    const res = await fetch(`${API_BASE}/chat/session/${sessionUuid}/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(res);
  },

  // Admin APIs (Admin Only)
  async getAdminMetrics() {
    const res = await fetch(`${API_BASE}/admin/metrics`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getAdminSessions() {
    const res = await fetch(`${API_BASE}/admin/sessions`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getAdminSessionDetail(sessionUuid) {
    const res = await fetch(`${API_BASE}/admin/sessions/${sessionUuid}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getAdminConfig() {
    const res = await fetch(`${API_BASE}/admin/config`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateGeminiKey(apiKey) {
    const res = await fetch(`${API_BASE}/admin/config/key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ apiKey }),
    });
    return handleResponse(res);
  },

  async updateGeminiModel(model) {
    const res = await fetch(`${API_BASE}/admin/config/model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ model }),
    });
    return handleResponse(res);
  },
};
