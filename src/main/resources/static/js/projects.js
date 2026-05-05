/**
 * projects.js — Projects page logic
 */
function esc(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
let allProjects = [];

async function loadProjects() {
    try {
        const data = await ProjectsAPI.getAll();
        allProjects = data || [];
    } catch {
        allProjects = DEMO_PROJECTS_JS;
    }
    renderProjects(allProjects);
}

function renderProjects(projects) {
    const grid = document.getElementById('projects-list');
    const empty = document.getElementById('projects-empty');
    if (!grid) return;

    if (!projects.length) {
        grid.style.display = 'none';
        if (empty) empty.style.display = '';
        return;
    }

    grid.style.display = '';
    if (empty) empty.style.display = 'none';

    const COLORS = ['var(--accent)','var(--accent-2)','var(--green)','var(--amber)','var(--red)'];

    grid.innerHTML = projects.map((p, i) => {
        const pct   = p.completionPercent ?? 0;
        const color = COLORS[i % COLORS.length];
        const fillClass = pct >= 70 ? 'green' : pct >= 40 ? '' : 'amber';

        return `
    <div class="card card-pad project-card" data-id="${p.id}" style="cursor:pointer;">
      <div class="flex justify-between items-start mb-3">
        <div style="width:40px;height:40px;border-radius:10px;background:${color}22;display:grid;place-items:center;flex-shrink:0;">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="${color}" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
          </svg>
        </div>
        <div class="flex gap-2 items-center">
          ${p.status === 'COMPLETED' ? '<span class="badge badge-green">Done</span>' :
            p.status === 'ON_HOLD'   ? '<span class="badge badge-amber">On Hold</span>' :
                '<span class="badge badge-blue">Active</span>'}
          <button class="btn btn-ghost btn-icon btn-sm proj-menu" data-id="${p.id}" title="Options">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </button>
        </div>
      </div>

      <div style="font-weight:600;font-size:.95rem;color:var(--text);margin-bottom:5px;">${esc(p.name)}</div>
      <div class="text-sm text-2 mb-4" style="line-height:1.5;min-height:36px;">${esc(p.description || 'No description provided.')}</div>

      <div class="flex justify-between items-center mb-2">
        <span class="text-xs text-muted">Progress</span>
        <span class="text-xs font-mono" style="color:${color};">${pct}%</span>
      </div>
      <div class="progress-bar mb-4">
        <div class="progress-fill ${fillClass}" style="width:${pct}%;${fillClass==='' ? 'background:'+color+';' : ''}"></div>
      </div>

      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 text-xs text-muted">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          ${p.taskCount ?? 0} tasks
        </div>
        <span class="text-xs font-mono text-muted">${formatDate(p.deadline)}</span>
      </div>
    </div>`;
    }).join('');

    // Bind card clicks
    grid.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', e => {
            if (e.target.closest('.proj-menu')) return;
            openProjectDetail(card.dataset.id);
        });
    });

    // Bind menu
    grid.querySelectorAll('.proj-menu').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            showProjectMenu(btn.dataset.id, btn);
        });
    });
}

function openProjectDetail(id) {
    const p = allProjects.find(x => String(x.id) === String(id));
    if (!p) return;
    document.getElementById('detail-name').textContent        = p.name;
    document.getElementById('detail-description').textContent = p.description || '—';
    document.getElementById('detail-status').textContent      = p.status || 'ACTIVE';
    document.getElementById('detail-deadline').textContent    = formatDate(p.deadline);
    document.getElementById('detail-tasks').textContent       = p.taskCount ?? 0;
    document.getElementById('modal-detail-title').textContent = p.name;
    openModal('modal-project-detail');
}

function showProjectMenu(id, anchor) {
    // Remove any existing menu
    document.querySelector('.ctx-menu')?.remove();

    const menu = document.createElement('div');
    menu.className = 'ctx-menu card';
    menu.style.cssText = `position:fixed;z-index:300;min-width:160px;padding:6px;font-size:.84rem;`;

    const rect = anchor.getBoundingClientRect();
    menu.style.top  = rect.bottom + 4 + 'px';
    menu.style.left = rect.left   + 'px';

    menu.innerHTML = `
    <div class="ctx-item" data-action="edit">Edit</div>
    <div class="ctx-item" data-action="tasks">View Tasks</div>
    <div class="ctx-item" data-action="delete" style="color:var(--red);">Delete</div>`;

    menu.querySelectorAll('.ctx-item').forEach(item => {
        item.style.cssText = 'padding:7px 10px;border-radius:6px;cursor:pointer;transition:background .15s;';
        item.addEventListener('mouseenter', () => item.style.background = 'var(--surface-2)');
        item.addEventListener('mouseleave', () => item.style.background = '');
        item.addEventListener('click', () => {
            menu.remove();
            handleProjectAction(id, item.dataset.action);
        });
    });

    document.body.appendChild(menu);
    setTimeout(() => document.addEventListener('click', () => menu.remove(), { once: true }), 10);
}

async function handleProjectAction(id, action) {
    if (action === 'edit') {
        const p = allProjects.find(x => String(x.id) === String(id));
        if (!p) return;
        document.getElementById('edit-proj-id').value          = p.id;
        document.getElementById('edit-proj-name').value        = p.name;
        document.getElementById('edit-proj-description').value = p.description || '';
        document.getElementById('edit-proj-deadline').value    = p.deadline?.slice(0,10) || '';
        openModal('modal-edit-project');
    }

    if (action === 'tasks') {
        window.location.href = `/pages/tasks.html?projectId=${id}`;
    }

    if (action === 'delete') {
        if (!confirm('Delete this project? This cannot be undone.')) return;
        try {
            await ProjectsAPI.delete(id);
            allProjects = allProjects.filter(x => String(x.id) !== String(id));
            renderProjects(allProjects);
            showToast('Project deleted.', 'info');
        } catch (err) {
            showToast(err.message || 'Delete failed.', 'error');
        }
    }
}

// ─── Search & Filter ──────────────────────────────────────────────────────

function filterProjects(query, status) {
    let list = allProjects;
    if (query) {
        const q = query.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    if (status && status !== 'ALL') {
        list = list.filter(p => (p.status || 'ACTIVE') === status);
    }
    renderProjects(list);
}

// ─── Demo Data ────────────────────────────────────────────────────────────

const DEMO_PROJECTS_JS = [
    { id:1, name:'Website Redesign',  description:'Revamp public site, docs and landing pages for Q3 launch.', completionPercent:68, taskCount:12, status:'ACTIVE',    deadline:'2025-07-01' },
    { id:2, name:'Backend API v2',    description:'REST API rewrite with new auth layer and rate limiting.',   completionPercent:41, taskCount:8,  status:'ACTIVE',    deadline:'2025-06-20' },
    { id:3, name:'Mobile App',        description:'React Native rewrite of iOS and Android apps.',            completionPercent:22, taskCount:19, status:'ACTIVE',    deadline:'2025-09-01' },
    { id:4, name:'DevOps Infra',      description:'Migrate CI/CD to GitHub Actions and set up staging.',      completionPercent:85, taskCount:5,  status:'ACTIVE',    deadline:'2025-05-30' },
    { id:5, name:'Analytics Dashboard',description:'Real-time analytics with charts and exports.',            completionPercent:100,taskCount:7,  status:'COMPLETED', deadline:'2025-04-15' },
    { id:6, name:'Email Templates',   description:'Transactional email redesign with new branding.',          completionPercent:55, taskCount:4,  status:'ON_HOLD',   deadline:'2025-08-01' },
];

window.loadProjects   = loadProjects;
window.filterProjects = filterProjects;