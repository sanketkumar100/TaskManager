/**
 * sidebar.js — Shared nav component
 * Call initSidebar() on every protected page
 */

const SIDEBAR_HTML = `
<div id="sidebar">
  <div class="sidebar-logo">
    <div class="sidebar-logo-icon">TM</div>
    <span class="sidebar-logo-text">TaskManager</span>
  </div>

  <nav class="sidebar-nav">
    <div class="nav-section-label">Main</div>

    <a class="nav-link" data-page="dashboard" href="/pages/dashboard.html">
      <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
      Dashboard
    </a>

    <a class="nav-link" data-page="projects" href="/pages/projects.html">
      <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
      </svg>
      Projects
    </a>

    <a class="nav-link" data-page="tasks" href="/pages/tasks.html">
      <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      </svg>
      Tasks
      <span class="nav-badge" id="task-badge" style="display:none"></span>
    </a>

    <div class="nav-section-label" style="margin-top:8px">Account</div>

    <a class="nav-link" data-page="profile" href="/pages/profile.html">
      <svg class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
      Profile
    </a>
  </nav>

  <div class="sidebar-footer">
    <div class="user-chip" id="sidebar-user">
      <div class="user-avatar" id="sidebar-avatar">?</div>
      <div>
        <div class="user-name" id="sidebar-name">Loading…</div>
        <div class="user-role" id="sidebar-role">—</div>
      </div>
    </div>
    <button class="btn btn-ghost btn-sm w-full mt-2" id="logout-btn" style="justify-content:flex-start;gap:8px;">
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
      </svg>
      Log out
    </button>
  </div>
</div>

<!-- Mobile toggle -->
<button id="sidebar-toggle"
  style="display:none;position:fixed;top:14px;left:14px;z-index:150;background:var(--surface-2);border:1px solid var(--border-2);border-radius:var(--r);padding:7px;color:var(--text);">
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
</button>
`;

function initSidebar() {
    // Require auth
    if (!window.Auth || !Auth.isLoggedIn()) {
        window.location.href = '../index.html';
        return;
    }

    // Inject sidebar before main content
    const shell = document.querySelector('.app-shell') || document.body;
    const temp = document.createElement('div');
    temp.innerHTML = SIDEBAR_HTML;
    shell.insertBefore(temp.firstElementChild, shell.firstChild);
    // Insert toggle button too
    document.body.appendChild(temp.firstElementChild);

    // Populate user info
    const user = Auth.getUser() || {};
    const nameEl   = document.getElementById('sidebar-name');
    const roleEl   = document.getElementById('sidebar-role');
    const avatarEl = document.getElementById('sidebar-avatar');

    if (nameEl) nameEl.textContent = user.name || user.email || 'User';
    if (roleEl) roleEl.textContent = user.role || 'Member';
    if (avatarEl) avatarEl.textContent = initials(user.name || user.email || 'U');

    // Highlight active link
    const page = document.body.dataset.page;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.page === page) link.classList.add('active');
    });

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        Auth.logout();
    });

    // Mobile toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar   = document.getElementById('sidebar');
    const mq = window.matchMedia('(max-width: 768px)');

    function handleMq(e) {
        if (toggleBtn) toggleBtn.style.display = e.matches ? 'block' : 'none';
    }

    mq.addEventListener('change', handleMq);
    handleMq(mq);

    toggleBtn?.addEventListener('click', () => {
        sidebar?.classList.toggle('open');
    });

    // Load pending tasks badge
    loadTaskBadge();
}

async function loadTaskBadge() {
    try {
        const tasks = await TasksAPI.getAll({ status: 'TODO', assignedToMe: true });
        const badge = document.getElementById('task-badge');
        if (badge && tasks?.length) {
            badge.textContent = tasks.length > 99 ? '99+' : tasks.length;
            badge.style.display = '';
        }
    } catch { /* silent */ }
}

window.initSidebar = initSidebar;