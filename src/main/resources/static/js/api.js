/**
 * api.js — Fetch wrapper + Auth helpers
 * Base URL points to Spring Boot backend
 */

const API_BASE = 'https://taskmanager-production-b489.up.railway.app/';

// ─── Token Storage ──────────────────────────────────────────────────────────

const Auth = {
    getToken()       { return localStorage.getItem('tm_token'); },
    setToken(t)      { localStorage.setItem('tm_token', t); },
    removeToken()    { localStorage.removeItem('tm_token'); },
    getUser()        { const u = localStorage.getItem('tm_user'); return u ? JSON.parse(u) : null; },
    setUser(u)       { localStorage.setItem('tm_user', JSON.stringify(u)); },
    removeUser()     { localStorage.removeItem('tm_user'); },

    isLoggedIn()     { return !!this.getToken(); },

    logout() {
        this.removeToken();
        this.removeUser();
        window.location.href = '../index.html';
    },

    requireAuth() {
        if (!this.isLoggedIn()) window.location.href = '../index.html';
    }
};

// ─── Core Fetch Wrapper ─────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
    const token = Auth.getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers
    });

    // Token expired → redirect to login
    if (res.status === 401) {
        Auth.logout();
        return;
    }

    // Parse JSON if content present
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
        const msg = data?.message || data?.error || `HTTP ${res.status}`;
        throw new Error(msg);
    }

    return data;
}

// ─── Auth Endpoints ─────────────────────────────────────────────────────────

const AuthAPI = {
    async login(email, password) {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        Auth.setToken(data.token);
        Auth.setUser(data.user);
        return data;
    },

    async register(fullName, email, password) {
        const data = await apiFetch('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password })
        });

        Auth.setToken(data.token);
        Auth.setUser(data.user);
        return data;
    },

    logout() { Auth.logout(); }
};

// ─── Projects ───────────────────────────────────────────────────────────────

const ProjectsAPI = {
    getAll()            { return apiFetch('/projects'); },
    getById(id)         { return apiFetch(`/projects/${id}`); },
    create(payload)     { return apiFetch('/projects',        { method: 'POST',   body: JSON.stringify(payload) }); },
    update(id, payload) { return apiFetch(`/projects/${id}`,  { method: 'PUT',    body: JSON.stringify(payload) }); },
    delete(id)          { return apiFetch(`/projects/${id}`,  { method: 'DELETE' }); }
};

// ─── Tasks ──────────────────────────────────────────────────────────────────

const TasksAPI = {
    getAll(params = {}) {
        const q = new URLSearchParams(params).toString();
        return apiFetch(`/tasks${q ? '?' + q : ''}`);
    },
    getById(id)             { return apiFetch(`/tasks/${id}`); },
    getByProject(projectId) { return apiFetch(`/tasks?projectId=${projectId}`); },
    create(payload)         { return apiFetch('/tasks',       { method: 'POST',   body: JSON.stringify(payload) }); },
    update(id, payload)     { return apiFetch(`/tasks/${id}`, { method: 'PUT',    body: JSON.stringify(payload) }); },
    updateStatus(id, status){ return apiFetch(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); },
    delete(id)              { return apiFetch(`/tasks/${id}`, { method: 'DELETE' }); }
};

// ─── Users / Profile ────────────────────────────────────────────────────────

const UsersAPI = {
    getMe()              { return apiFetch('/users/me'); },
    updateMe(payload)    { return apiFetch('/users/me',       { method: 'PUT',    body: JSON.stringify(payload) }); },
    changePassword(body) { return apiFetch('/users/me/password', { method: 'PATCH', body: JSON.stringify(body) }); },
    getAll()             { return apiFetch('/users'); }
};

// ─── Dashboard ──────────────────────────────────────────────────────────────

const DashboardAPI = {
    getStats()     { return apiFetch('/dashboard/stats'); },
    getActivity()  { return apiFetch('/dashboard/activity'); }
};

// ─── Toast Utility ──────────────────────────────────────────────────────────

function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('out');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

// ─── Modal Helpers ──────────────────────────────────────────────────────────

function openModal(id) {
    document.getElementById(id)?.classList.add('open');
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove('open');
}

// Close modal on overlay click
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
    }
});

// ─── Format Helpers ─────────────────────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelative(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)   return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
}

function initials(name = '') {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

// ─── Exports (also available globally) ─────────────────────────────────────

window.Auth         = Auth;
window.AuthAPI      = AuthAPI;
window.ProjectsAPI  = ProjectsAPI;
window.TasksAPI     = TasksAPI;
window.UsersAPI     = UsersAPI;
window.DashboardAPI = DashboardAPI;
window.showToast    = showToast;
window.openModal    = openModal;
window.closeModal   = closeModal;
window.formatDate   = formatDate;
window.formatRelative = formatRelative;
window.initials     = initials;