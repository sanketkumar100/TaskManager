/**
 * tasks.js — Tasks page logic (Kanban + List views)
 */

let allTasks = [];
let currentView = 'kanban'; // 'kanban' | 'list'

const COLUMNS = [
    { key: 'TODO',        label: 'To Do',      color: 'var(--text-3)' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'var(--amber)'  },
    { key: 'DONE',        label: 'Done',        color: 'var(--green)'  },
    { key: 'CANCELLED',   label: 'Cancelled',   color: 'var(--red)'    },
];

async function loadTasks() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('projectId')) params.projectId = urlParams.get('projectId');

    try {
        const data = await TasksAPI.getAll(params);
        allTasks = data || [];
    } catch {
        allTasks = DEMO_TASKS_JS;
    }

    renderView();
    updateTaskCount();
}

function renderView() {
    if (currentView === 'kanban') renderKanban();
    else renderList();
}

// ─── Kanban ───────────────────────────────────────────────────────────────

function renderKanban() {
    const board = document.getElementById('kanban-board');
    const listWrap = document.getElementById('list-wrap');
    if (!board) return;

    board.style.display = '';
    if (listWrap) listWrap.style.display = 'none';

    board.innerHTML = COLUMNS.map(col => {
        const colTasks = allTasks.filter(t => t.status === col.key);
        return `
    <div class="kanban-col" data-status="${col.key}">
      <div class="kanban-col-head">
        <div class="kanban-col-title">
          <span style="width:8px;height:8px;border-radius:50%;background:${col.color};display:inline-block;"></span>
          ${col.label}
        </div>
        <span class="kanban-count">${colTasks.length}</span>
      </div>
      <div class="kanban-cards" id="col-${col.key}">
        ${colTasks.map(t => kanbanCard(t)).join('')}
        ${!colTasks.length ? `<div style="text-align:center;padding:24px;color:var(--text-3);font-size:.8rem;">No tasks</div>` : ''}
      </div>
      <button class="btn btn-ghost btn-sm w-full add-task-col" data-status="${col.key}"
        style="margin:8px;width:calc(100% - 16px);justify-content:center;border:1px dashed var(--border-2);">
        + Add Task
      </button>
    </div>`;
    }).join('');

    // Bind card clicks
    board.querySelectorAll('.k-card').forEach(card => {
        card.addEventListener('click', () => openTaskDetail(card.dataset.id));
    });

    // Add task from column
    board.querySelectorAll('.add-task-col').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('task-status').value = btn.dataset.status;
            openModal('modal-add-task');
        });
    });
}

function kanbanCard(t) {
    return `
  <div class="kanban-card k-card" data-id="${t.id}">
    <div class="kanban-card-title">${esc(t.title)}</div>
    <div class="kanban-card-meta">
      <div class="flex items-center gap-2">
        <span class="priority-dot ${priorityClass(t.priority)}"></span>
        <span class="text-xs text-muted">${t.priority || 'LOW'}</span>
      </div>
      <div class="flex items-center gap-2">
        ${t.dueDate ? `<span class="text-xs font-mono text-muted">${formatDate(t.dueDate)}</span>` : ''}
        ${t.assignee ? `<div class="user-avatar" style="width:22px;height:22px;font-size:.58rem;">${initials(t.assignee.name)}</div>` : ''}
      </div>
    </div>
    ${t.project ? `<div class="mt-2"><span class="badge badge-purple text-xs">${esc(t.project.name)}</span></div>` : ''}
  </div>`;
}

// ─── List View ────────────────────────────────────────────────────────────

function renderList() {
    const board = document.getElementById('kanban-board');
    const listWrap = document.getElementById('list-wrap');
    if (!listWrap) return;

    if (board) board.style.display = 'none';
    listWrap.style.display = '';

    const tbody = document.getElementById('tasks-tbody');
    if (!tbody) return;

    if (!allTasks.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-3);padding:32px;">No tasks found.</td></tr>`;
        return;
    }

    tbody.innerHTML = allTasks.map(t => `
    <tr class="task-row" data-id="${t.id}" style="cursor:pointer;">
      <td>
        <div class="flex items-center gap-2">
          <span class="priority-dot ${priorityClass(t.priority)}"></span>
          <span style="color:var(--text);font-weight:500;">${esc(t.title)}</span>
        </div>
      </td>
      <td>${t.project?.name ? `<span class="badge badge-purple">${esc(t.project.name)}</span>` : '—'}</td>
      <td>${statusBadge(t.status)}</td>
      <td>
        <select class="form-control" style="padding:4px 8px;font-size:.78rem;width:auto;"
          data-id="${t.id}" onchange="quickUpdateStatus('${t.id}', this.value)" onclick="event.stopPropagation()">
          ${COLUMNS.map(c => `<option value="${c.key}" ${t.status===c.key?'selected':''}>${c.label}</option>`).join('')}
        </select>
      </td>
      <td><span class="badge badge-${priorityColor(t.priority)}">${t.priority || '—'}</span></td>
      <td class="font-mono text-xs">${formatDate(t.dueDate)}</td>
      <td>
        ${t.assignee ? `<div class="flex items-center gap-2">
          <div class="user-avatar" style="width:22px;height:22px;font-size:.58rem;">${initials(t.assignee.name)}</div>
          <span class="text-sm text-2">${esc(t.assignee.name)}</span>
        </div>` : '—'}
      </td>
    </tr>`).join('');

    tbody.querySelectorAll('.task-row').forEach(row => {
        row.addEventListener('click', e => {
            if (e.target.tagName === 'SELECT') return;
            openTaskDetail(row.dataset.id);
        });
    });
}

async function quickUpdateStatus(id, status) {
    try {
        await TasksAPI.updateStatus(id, status);
        const task = allTasks.find(t => String(t.id) === String(id));
        if (task) { task.status = status; renderView(); }
        showToast('Status updated.', 'success');
    } catch (err) {
        showToast(err.message || 'Update failed.', 'error');
    }
}

// ─── Task Detail Modal ────────────────────────────────────────────────────

function openTaskDetail(id) {
    const t = allTasks.find(x => String(x.id) === String(id));
    if (!t) return;

    document.getElementById('detail-task-title').textContent    = t.title;
    document.getElementById('detail-task-status').innerHTML     = statusBadge(t.status);
    document.getElementById('detail-task-priority').innerHTML   = `<span class="badge badge-${priorityColor(t.priority)}">${t.priority || '—'}</span>`;
    document.getElementById('detail-task-project').textContent  = t.project?.name || '—';
    document.getElementById('detail-task-due').textContent      = formatDate(t.dueDate);
    document.getElementById('detail-task-assignee').textContent = t.assignee?.name || '—';
    document.getElementById('detail-task-desc').textContent     = t.description || 'No description.';

    document.getElementById('btn-edit-task').onclick = () => { closeModal('modal-task-detail'); openEditTask(t); };
    document.getElementById('btn-delete-task').onclick = () => deleteTask(id);

    openModal('modal-task-detail');
}

function openEditTask(t) {
    document.getElementById('edit-task-id').value          = t.id;
    document.getElementById('edit-task-title').value       = t.title;
    document.getElementById('edit-task-description').value = t.description || '';
    document.getElementById('edit-task-status').value      = t.status;
    document.getElementById('edit-task-priority').value    = t.priority || 'MEDIUM';
    document.getElementById('edit-task-due').value         = t.dueDate?.slice(0,10) || '';
    openModal('modal-edit-task');
}

async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
        await TasksAPI.delete(id);
        allTasks = allTasks.filter(t => String(t.id) !== String(id));
        closeModal('modal-task-detail');
        renderView();
        updateTaskCount();
        showToast('Task deleted.', 'info');
    } catch (err) {
        showToast(err.message || 'Delete failed.', 'error');
    }
}

// ─── Add Task ─────────────────────────────────────────────────────────────

async function submitAddTask() {
    const title    = document.getElementById('task-title').value.trim();
    const desc     = document.getElementById('task-description').value.trim();
    const status   = document.getElementById('task-status').value;
    const priority = document.getElementById('task-priority').value;
    const dueDate  = document.getElementById('task-due').value;

    if (!title) { showToast('Title is required.', 'error'); return; }

    try {
        const newTask = await TasksAPI.create({ title, description: desc, status, priority, dueDate: dueDate || null });
        allTasks.unshift(newTask);
        closeModal('modal-add-task');
        renderView();
        updateTaskCount();
        showToast('Task created!', 'success');
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
    } catch (err) {
        // Demo fallback
        const fake = { id: Date.now(), title, description: desc, status, priority, dueDate: dueDate || null };
        allTasks.unshift(fake);
        closeModal('modal-add-task');
        renderView();
        updateTaskCount();
        showToast('Task added (demo mode).', 'info');
    }
}

async function submitEditTask() {
    const id       = document.getElementById('edit-task-id').value;
    const title    = document.getElementById('edit-task-title').value.trim();
    const desc     = document.getElementById('edit-task-description').value.trim();
    const status   = document.getElementById('edit-task-status').value;
    const priority = document.getElementById('edit-task-priority').value;
    const dueDate  = document.getElementById('edit-task-due').value;

    if (!title) { showToast('Title is required.', 'error'); return; }

    try {
        const updated = await TasksAPI.update(id, { title, description: desc, status, priority, dueDate: dueDate || null });
        const idx = allTasks.findIndex(t => String(t.id) === String(id));
        if (idx !== -1) allTasks[idx] = { ...allTasks[idx], ...updated };
    } catch {
        const idx = allTasks.findIndex(t => String(t.id) === String(id));
        if (idx !== -1) allTasks[idx] = { ...allTasks[idx], title, description: desc, status, priority, dueDate };
    }

    closeModal('modal-edit-task');
    renderView();
    showToast('Task updated.', 'success');
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function priorityClass(p) { return p === 'HIGH' ? 'high' : p === 'MEDIUM' ? 'medium' : 'low'; }
function priorityColor(p) { return p === 'HIGH' ? 'red' : p === 'MEDIUM' ? 'amber' : 'green'; }

function statusBadge(s) {
    const map = {
        TODO:        '<span class="badge badge-blue">To Do</span>',
        IN_PROGRESS: '<span class="badge badge-amber">In Progress</span>',
        DONE:        '<span class="badge badge-green">Done</span>',
        CANCELLED:   '<span class="badge" style="background:var(--border);color:var(--text-3)">Cancelled</span>',
    };
    return map[s] || `<span class="badge">${s || '—'}</span>`;
}

function updateTaskCount() {
    const el = document.getElementById('task-total-count');
    if (el) el.textContent = `${allTasks.length} task${allTasks.length !== 1 ? 's' : ''}`;
}

function switchView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
    renderView();
}

function filterTasks(query, status, priority) {
    let list = allTasks;
    if (query)    { const q = query.toLowerCase(); list = list.filter(t => t.title.toLowerCase().includes(q)); }
    if (status && status !== 'ALL')   list = list.filter(t => t.status === status);
    if (priority && priority !== 'ALL') list = list.filter(t => t.priority === priority);

    const old = allTasks;
    allTasks = list;
    renderView();
    allTasks = old;
}

// ─── Demo Data ────────────────────────────────────────────────────────────

const DEMO_TASKS_JS = [
    { id:1,  title:'Design new landing page',       description:'Create Figma mockups and implement HTML/CSS.', status:'IN_PROGRESS', priority:'HIGH',   dueDate:'2025-06-10', project:{name:'Website Redesign'}, assignee:{name:'Alice Kim'} },
    { id:2,  title:'Fix authentication bug',        description:'JWT refresh token expires too early.',          status:'TODO',        priority:'HIGH',   dueDate:'2025-06-05', project:{name:'Backend API'},     assignee:{name:'Bob Lee'} },
    { id:3,  title:'Write API documentation',       description:'Document all REST endpoints with examples.',    status:'TODO',        priority:'MEDIUM', dueDate:'2025-06-15', project:{name:'Backend API'},     assignee:{name:'Carol Ng'} },
    { id:4,  title:'Deploy to staging',             description:'Deploy build to staging and run smoke tests.', status:'DONE',        priority:'MEDIUM', dueDate:'2025-05-28', project:{name:'DevOps Infra'},    assignee:{name:'Dave Wu'} },
    { id:5,  title:'Onboarding flow review',        description:'UX review of the new user onboarding.',        status:'IN_PROGRESS', priority:'LOW',    dueDate:'2025-06-20', project:{name:'Mobile App'},      assignee:{name:'Eva Sun'} },
    { id:6,  title:'Set up error monitoring',       description:'Integrate Sentry into production build.',      status:'TODO',        priority:'MEDIUM', dueDate:'2025-06-18', project:{name:'DevOps Infra'},    assignee:{name:'Bob Lee'} },
    { id:7,  title:'Push notification service',     description:'FCM integration for Android and iOS.',         status:'TODO',        priority:'HIGH',   dueDate:'2025-07-01', project:{name:'Mobile App'},      assignee:{name:'Alice Kim'} },
    { id:8,  title:'Database migration script',     description:'Migrate legacy tables to new schema.',         status:'CANCELLED',   priority:'LOW',    dueDate:'2025-05-15', project:{name:'Backend API'},     assignee:{name:'Carol Ng'} },
];

window.loadTasks       = loadTasks;
window.switchView      = switchView;
window.filterTasks     = filterTasks;
window.submitAddTask   = submitAddTask;
window.submitEditTask  = submitEditTask;
window.quickUpdateStatus = quickUpdateStatus;