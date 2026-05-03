/**
 * dashboard.js — Dashboard page logic
 */

async function loadDashboard() {
    // Stats
    try {
        const stats = await DashboardAPI.getStats();
        updateStat('stat-projects',  stats.totalProjects  ?? 0);
        updateStat('stat-tasks',     stats.totalTasks     ?? 0);
        updateStat('stat-done',      stats.completedTasks ?? 0);
        updateStat('stat-overdue',   stats.overdueTasks   ?? 0);
    } catch {
        // Show placeholder values in demo mode
        updateStat('stat-projects', 8);
        updateStat('stat-tasks',    42);
        updateStat('stat-done',     29);
        updateStat('stat-overdue',  3);
    }

    // Recent tasks
    try {
        const tasks = await TasksAPI.getAll({ limit: 8 });
        renderRecentTasks(tasks || []);
    } catch {
        renderRecentTasks(DEMO_TASKS);
    }

    // Recent projects
    try {
        const projects = await ProjectsAPI.getAll();
        renderRecentProjects((projects || []).slice(0, 4));
    } catch {
        renderRecentProjects(DEMO_PROJECTS);
    }
}

function updateStat(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    // Count-up animation
    const target = parseInt(value);
    let current = 0;
    const step = Math.ceil(target / 20);
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(timer);
    }, 40);
}

const STATUS_BADGE = {
    TODO:        '<span class="badge badge-blue">Todo</span>',
    IN_PROGRESS: '<span class="badge badge-amber">In Progress</span>',
    DONE:        '<span class="badge badge-green">Done</span>',
    CANCELLED:   '<span class="badge" style="background:var(--border);color:var(--text-3)">Cancelled</span>',
};

const PRIORITY_CLASS = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };

function renderRecentTasks(tasks) {
    const tbody = document.getElementById('recent-tasks-body');
    if (!tbody) return;

    if (!tasks.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-3);padding:28px;">No tasks yet</td></tr>`;
        return;
    }

    tbody.innerHTML = tasks.map(t => `
    <tr style="cursor:pointer;" onclick="window.location='/pages/tasks.html'">
      <td>
        <div class="flex items-center gap-2">
          <span class="priority-dot ${PRIORITY_CLASS[t.priority] || 'low'}"></span>
          <span style="color:var(--text);font-weight:500;">${esc(t.title)}</span>
        </div>
      </td>
      <td>${t.project?.name ? `<span class="badge badge-purple">${esc(t.project.name)}</span>` : '—'}</td>
      <td>${STATUS_BADGE[t.status] || '—'}</td>
      <td style="font-family:var(--font-mono);font-size:.78rem;">${formatDate(t.dueDate)}</td>
      <td>
        ${t.assignee ? `
          <div class="flex items-center gap-2">
            <div class="user-avatar" style="width:22px;height:22px;font-size:.58rem;">${initials(t.assignee.name)}</div>
            <span class="text-sm text-2">${esc(t.assignee.name)}</span>
          </div>` : '—'}
      </td>
    </tr>
  `).join('');
}

function renderRecentProjects(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    if (!projects.length) {
        grid.innerHTML = `<div style="color:var(--text-3);font-size:.86rem;">No projects yet. <a class="link" href="/pages/projects.html">Create one</a></div>`;
        return;
    }

    const colors = ['var(--accent)', 'var(--accent-2)', 'var(--green)', 'var(--amber)'];

    grid.innerHTML = projects.map((p, i) => {
        const pct = p.completionPercent ?? Math.floor(Math.random() * 85 + 10);
        const color = colors[i % colors.length];
        return `
      <a href="/pages/projects.html" class="card card-pad" style="display:block;text-decoration:none;cursor:pointer;">
        <div class="flex justify-between items-center mb-4">
          <div style="width:38px;height:38px;border-radius:var(--r);background:${color}22;display:grid;place-items:center;">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="${color}" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
            </svg>
          </div>
          <span class="text-xs text-muted font-mono">${pct}%</span>
        </div>
        <div style="font-weight:600;color:var(--text);margin-bottom:4px;">${esc(p.name)}</div>
        <div class="text-sm text-2 mb-4" style="line-height:1.5;">${esc(p.description || 'No description')}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:${color};"></div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-muted">
          <span>${p.taskCount ?? 0} tasks</span>
          <span>${formatDate(p.deadline)}</span>
        </div>
      </a>`;
    }).join('');
}

function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Demo data (fallback when API unreachable) ──────────────────────────────
const DEMO_TASKS = [
    { id:1, title:'Design new landing page', status:'IN_PROGRESS', priority:'HIGH',   dueDate:'2025-06-10', project:{name:'Website Redesign'}, assignee:{name:'Alice Kim'} },
    { id:2, title:'Fix authentication bug',  status:'TODO',        priority:'HIGH',   dueDate:'2025-06-05', project:{name:'Backend API'},     assignee:{name:'Bob Lee'} },
    { id:3, title:'Write API documentation', status:'TODO',        priority:'MEDIUM', dueDate:'2025-06-15', project:{name:'Backend API'},     assignee:{name:'Carol Ng'} },
    { id:4, title:'Deploy to staging',       status:'DONE',        priority:'MEDIUM', dueDate:'2025-05-28', project:{name:'DevOps'},           assignee:{name:'Dave Wu'} },
    { id:5, title:'Onboarding flow review',  status:'IN_PROGRESS', priority:'LOW',    dueDate:'2025-06-20', project:{name:'Mobile App'},      assignee:{name:'Eva Sun'} },
];

const DEMO_PROJECTS = [
    { id:1, name:'Website Redesign',  description:'Revamp public site & docs', completionPercent:68, taskCount:12, deadline:'2025-07-01' },
    { id:2, name:'Backend API',       description:'REST API v2 + auth layer',  completionPercent:41, taskCount:8,  deadline:'2025-06-20' },
    { id:3, name:'Mobile App',        description:'React Native rewrite',       completionPercent:22, taskCount:19, deadline:'2025-09-01' },
    { id:4, name:'DevOps',            description:'CI/CD pipeline & infra',     completionPercent:85, taskCount:5,  deadline:'2025-05-30' },
];

window.loadDashboard = loadDashboard;
window.esc = esc;