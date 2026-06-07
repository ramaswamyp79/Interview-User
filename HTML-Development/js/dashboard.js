/* ── NAVIGATION ─────────────────────────────────── */


const pageMap = {home:'home',sessions:'sessions',credits:'credits',support:'support',mock:'mock',live:'live',resume:'resume',download:'download',};

function navigate(key) {
  const pageId = pageMap[key] || key;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('page-' + pageId);
  if (pg) pg.classList.add('active');
  const navEl = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (navEl) navEl.classList.add('active');
  document.querySelector('.main').scrollTop = 0;
  if (pageId === 'mock') { startTimer(); }
  else { clearInterval(timerInterval); }
  closeMobileSidebar();
}

document.querySelectorAll('.nav-item[data-page]').forEach(el => {
  el.addEventListener('click', () => navigate(el.dataset.page));
});

/* ── MOBILE SIDEBAR ─────────────────────────────── */


function openMobileSidebar() {
  document.getElementById('sidebar').classList.add('mobile-open');
  document.getElementById('mobileOverlay').classList.add('open');
  document.querySelectorAll('.hamburger').forEach(btn => btn.classList.add('is-open'));
}
function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('mobileOverlay').classList.remove('open');
  document.querySelectorAll('.hamburger').forEach(btn => btn.classList.remove('is-open'));
}

/* SIDEBAR COLLAPSE ───────────────────────────── */


const sidebar = document.getElementById('sidebar');
const mainEl = document.getElementById('main');
document.getElementById('collapseBtn').addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  const isCollapsed = sidebar.classList.contains('collapsed');
  mainEl.style.marginLeft = isCollapsed ? 'var(--sidebar-collapsed-w)' : 'var(--sidebar-w)';
});

/* TOAST ──────────────────────────────────────── */


function showToast(msg, err) {
  const t = document.getElementById('toast');
  const color = err ? '#e05252' : '#00c896';
  const icon = err
    ? `<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"><path d="M4 10l4 4 8-8"/></svg>`;
  t.innerHTML = icon + msg;
  t.style.opacity = '1'; t.style.transform = 'translateY(0)';
  clearTimeout(t._to);
  t._to = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; }, 2500);
}



/* SESSIONS TABLE  ─────────────────────────── */


const allSessions = [
  {company:'Zeta Solutions',position:'Frontend Engineer',status:'active',credits:3,date:'Nov 18, 2025',usage:12},
  {company:'CyberNova',position:'Security Engineer',status:'active',credits:7,date:'Oct 25, 2025',usage:21},
  {company:'BrightLabs',position:'Cloud Engineer',status:'active',credits:14,date:'Oct 11, 2025',usage:47},
  {company:'BlueSky Tech',position:'Backend Engineer',status:'expired',credits:0,date:'Oct 8, 2025',usage:5},
  {company:'Nova Labs',position:'Fullstack Developer',status:'active',credits:8,date:'Sep 28, 2025',usage:27},
  {company:'CodeFlow Digital',position:'Software Engineer',status:'active',credits:12,date:'Sep 14, 2025',usage:44},
  {company:'Axiom Corp',position:'DevOps Engineer',status:'active',credits:5,date:'Sep 2, 2025',usage:18},
  {company:'DataStream',position:'Data Analyst',status:'expired',credits:0,date:'Aug 20, 2025',usage:9},
  {company:'PixelForge',position:'UI/UX Designer',status:'active',credits:10,date:'Aug 5, 2025',usage:33},
  {company:'CloudBase',position:'Solutions Architect',status:'active',credits:6,date:'Jul 28, 2025',usage:22},
  {company:'NeuralWave',position:'ML Engineer',status:'active',credits:9,date:'Jul 14, 2025',usage:56},
  {company:'VaultSec',position:'Cybersecurity Analyst',status:'expired',credits:0,date:'Jun 30, 2025',usage:7},
  {company:'Finova',position:'React Developer',status:'active',credits:4,date:'Jun 15, 2025',usage:14},
  {company:'GridEdge',position:'Embedded Systems Eng',status:'active',credits:11,date:'Jun 1, 2025',usage:38},
  {company:'SkyMesh',position:'Network Engineer',status:'expired',credits:0,date:'May 20, 2025',usage:3},
  {company:'PulseIO',position:'iOS Developer',status:'active',credits:7,date:'May 6, 2025',usage:29},
  {company:'Stratify',position:'Product Manager',status:'active',credits:2,date:'Apr 22, 2025',usage:11},
  {company:'LogiCore',position:'QA Engineer',status:'expired',credits:0,date:'Apr 8, 2025',usage:6},
  {company:'ByteHive',position:'Go Developer',status:'active',credits:15,date:'Mar 25, 2025',usage:61},
  {company:'Omniq',position:'Scrum Master',status:'active',credits:3,date:'Mar 10, 2025',usage:8},
  {company:'Stormatic',position:'Database Admin',status:'expired',credits:0,date:'Feb 26, 2025',usage:4},
  {company:'Reactify',position:'Node.js Developer',status:'active',credits:8,date:'Feb 12, 2025',usage:25},
  {company:'CloudPeak',position:'AWS Architect',status:'active',credits:6,date:'Jan 30, 2025',usage:42},
  {company:'Qwikly',position:'Flutter Developer',status:'expired',credits:0,date:'Jan 16, 2025',usage:2},
  {company:'Mindrift',position:'AI/ML Researcher',status:'active',credits:12,date:'Jan 2, 2025',usage:50},
  {company:'Novetta',position:'Technical Lead',status:'active',credits:5,date:'Dec 18, 2024',usage:16},
  {company:'StackHive',position:'Ruby on Rails Dev',status:'expired',credits:0,date:'Dec 4, 2024',usage:9},
  {company:'Infogrid',position:'Business Analyst',status:'active',credits:7,date:'Nov 20, 2024',usage:20},
  {company:'Terralink',position:'Infrastructure Eng',status:'active',credits:4,date:'Nov 6, 2024',usage:31},
  {company:'Prismatica',position:'Creative Technologist',status:'expired',credits:0,date:'Oct 23, 2024',usage:1},
];
const PAGE_SIZE = 6;
let curPage = 1, sortNewest = true, filtered = [...allSessions];
let pendingDeleteIdx = null;

function filterTable() {
  const s = document.getElementById('searchInput').value.toLowerCase();
  const c = document.getElementById('companyFilter').value;
  const st = document.getElementById('statusFilter').value;
  filtered = allSessions.filter(r =>
    (!s || r.company.toLowerCase().includes(s) || r.position.toLowerCase().includes(s)) &&
    (!c || r.company === c) &&
    (!st || r.status === st)
  );
  sortRows(); curPage = 1; renderTable();
}

function sortRows() {
  filtered.sort((a, b) => {
    const da = new Date(a.date), db = new Date(b.date);
    return sortNewest ? db - da : da - db;
  });
}

function toggleSort() {
  sortNewest = !sortNewest;
  document.getElementById('sortLabel').textContent = sortNewest ? 'Newest' : 'Oldest';
  sortRows(); renderTable();
}

function renderTable() {
  const start = (curPage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = rows.map((r, i) => `
    <tr>
      <td class="col-sno">${start+i+1}</td>
      <td class="col-company">${r.company}</td>
      <td class="col-pos">${r.position}</td>
      <td><div class="status-cell"><span class="badge badge-${r.status}">${r.status==='active'?'Active':'Expired'}</span><span class="credits-txt">${r.credits} credits</span></div></td>
      <td class="col-date">${r.date}</td>
      <td class="col-usage">${r.usage} usages</td>
      <td><div class="action-cell">
        <button class="action-btn" title="View" onclick="openViewSession(${start+i})"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4C5 4 2 10 2 10s3 6 8 6 8-6 8-6-3-6-8-6z"/><circle cx="10" cy="10" r="2.5"/></svg></button>
        <button class="action-btn" title="Edit" onclick="openEditSession(${start+i})"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2.5a2.121 2.121 0 013 3L6 17l-4 1 1-4L14.5 2.5z"/></svg></button>
        <button class="action-btn del" title="Delete" onclick="openDeleteConfirm(${start+i})"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 6 16 6"/><path d="M7 6V4h6v2M8 9v6M12 9v6"/><rect x="5" y="6" width="10" height="11" rx="1"/></svg></button>
      </div></td>
    </tr>
  `).join('');
  const total = filtered.length, end = Math.min(start+PAGE_SIZE, total);
  document.getElementById('showingText').textContent = total===0 ? 'No results' : `Showing ${start+1}–${end} of ${total}`;
  renderPagination(total);
}

function renderPagination(total) {
  const tp = Math.ceil(total/PAGE_SIZE);
  const pg = document.getElementById('pagination');
  let h = `<button class="page-btn" onclick="goPage(${curPage-1})" ${curPage===1?'disabled':''}>Prev</button>`;
  for(let i=1;i<=tp;i++){
    if(tp<=7 || i===1 || i===tp || (i>=curPage-1 && i<=curPage+1))
      h += `<button class="page-btn ${i===curPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
    else if(i===curPage-2 || i===curPage+2)
      h += `<span style="color:var(--text-light);padding:0 2px">…</span>`;
  }
  h += `<button class="page-btn" onclick="goPage(${curPage+1})" ${curPage===tp||tp===0?'disabled':''}>Next</button>`;
  pg.innerHTML = h;
}

function goPage(n) {
  const tp = Math.ceil(filtered.length/PAGE_SIZE);
  if(n<1||n>tp) return; curPage=n; renderTable();
}

/* ── VIEW SESSION MODAL ─────────────────────────────── */

const sessionJobDescriptions = {
  'Frontend Engineer': 'We are looking for a Frontend Engineer to join our team. The ideal candidate should have strong problem-solving skills and experience with modern development practices and cloud infrastructure.',
  'Security Engineer': 'We are seeking a Security Engineer to protect our digital infrastructure. You will be responsible for implementing security measures and responding to threats.',
  'Cloud Engineer': 'Join our cloud team to design and maintain scalable cloud solutions on AWS and Azure. Experience with containerization and IaC required.',
  'Backend Engineer': 'We need a skilled Backend Engineer to develop robust APIs and services. Proficiency in Node.js, Python, or Go is a plus.',
  'Fullstack Developer': 'Looking for a Fullstack Developer to work across the stack. Experience with React, Node.js and databases required.',
  'Software Engineer': 'We are hiring a Software Engineer to build and maintain high-quality software products. Strong fundamentals and collaboration skills are key.',
};

function openViewSession(idx) {
  const r = filtered[idx];
  if (!r) return;
  document.getElementById('vsCompany').textContent = r.company;
  document.getElementById('vsPosition').textContent = r.position;
  document.getElementById('vsStatusBadge').className = 'badge badge-' + r.status;
  document.getElementById('vsStatusBadge').innerHTML = `<span></span>${r.status === 'active' ? 'Active' : 'Expired'}`;
  document.getElementById('vsCompanyVal').textContent = r.company;
  document.getElementById('vsPositionVal').textContent = r.position;
  document.getElementById('vsCreditsLeft').textContent = r.credits;
  document.getElementById('vsAIUsage').textContent = r.usage;
  document.getElementById('vsCreatedAt').textContent = r.date;
  document.getElementById('vsJobDesc').textContent = sessionJobDescriptions[r.position] || `We are looking for a ${r.position} to join our team at ${r.company}. The ideal candidate should have strong problem-solving skills and experience with modern development practices and cloud infrastructure.`;
  document.getElementById('viewSessionModal').classList.add('open');
}

function closeViewSession() {
  document.getElementById('viewSessionModal').classList.remove('open');
}

/* ── DELETE CONFIRM ─────────────────────────────── */


function openDeleteConfirm(idx) {
  pendingDeleteIdx = idx;
  const item = filtered[idx];
  document.getElementById('deleteItemName').textContent = `"${item ? item.company + ' - ' + item.position : 'this item'}"`;
  document.getElementById('deleteConfirmModal').classList.add('open');
}

function closeDeleteConfirm() {
  document.getElementById('deleteConfirmModal').classList.remove('open');
  pendingDeleteIdx = null;
}

function confirmDelete() {
  if (pendingDeleteIdx !== null) {
    filtered.splice(pendingDeleteIdx, 1);
    if(curPage>Math.ceil(filtered.length/PAGE_SIZE)&&curPage>1) curPage--;
    renderTable(); showToast('Session deleted.');
  }
  closeDeleteConfirm();
}

/* ── EDIT SESSION ───────────────────────────────── */


let editCurrentStep = 1;
const EDIT_TOTAL = 4;
let editingSession = null;

const editPanels = [
  () => `
    <div class="ms-info-box"><div class="ms-info-title">Company & Role Details</div><div class="ms-info-desc">Update the company name and job role for this session.</div></div>
    <div class="form-group"><label class="form-label">Company <span class="form-req">*</span></label><input class="form-input" id="edit-company" type="text" value="${editingSession?.company||''}"/></div>
    <div class="form-group"><label class="form-label">Position <span class="form-req">*</span></label><input class="form-input" id="edit-position" type="text" value="${editingSession?.position||''}"/></div>
    <div class="form-group"><label class="form-label">Job Description</label><textarea class="form-input" id="edit-jd" placeholder="Paste the job description here..." style="min-height:90px;resize:vertical">Looking for a ${editingSession?.position||''} to join ${editingSession?.company||''}.</textarea></div>
  `,
  () => `
    <div class="ms-info-box"><div class="ms-info-title">Language & AI Settings</div><div class="ms-info-desc">Update the language and AI model for this session.</div></div>
    <div class="form-group"><label class="form-label">Interview Language</label><div class="select-wrap" style="width:100%"><select class="form-input filter-select"><option>English</option><option>Hindi</option><option>Tamil</option></select><svg class="chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 8l5 5 5-5"/></svg></div></div>
    <div class="form-group"><label class="form-label">AI Model</label><div class="ai-model-grid"><label class="ai-model-opt selected"><input type="radio" name="edit-model" checked/><div class="ai-model-icon">🤖</div><div class="ai-model-name">GPT-4.1</div><div class="ai-model-desc">Best quality</div></label><label class="ai-model-opt"><input type="radio" name="edit-model"/><div class="ai-model-icon">⚡</div><div class="ai-model-name">Claude</div><div class="ai-model-desc">Fast & smart</div></label></div></div>
  `,
  () => `
    <div class="ms-info-box"><div class="ms-info-title">Resume / CV</div><div class="ms-info-desc">Select or upload the resume to use for this session.</div></div>
    <div class="resume-drop-zone" onclick="showToast('Resume upload feature active!')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <div class="rdz-title">Drop your resume here</div><div class="rdz-sub">PDF, DOCX, or TXT • Max 10MB</div>
      <button class="rdz-btn" type="button">Browse files</button>
    </div>
  `,
  () => `
    <div class="ms-info-box"><div class="ms-info-title">Session Duration</div><div class="ms-info-desc">Adjust the session duration for this interview.</div></div>
    <div class="duration-grid">
      <label class="duration-opt selected"><input type="radio" name="edit-dur" value="30" checked/><div class="dur-val">30</div><div class="dur-unit">minutes</div><div class="dur-badge">½ credit</div></label>
      <label class="duration-opt"><input type="radio" name="edit-dur" value="60"/><div class="dur-val">60</div><div class="dur-unit">minutes</div><div class="dur-badge">1 credit</div></label>
    </div>
  `
];

function openEditSession(idx) {
  editingSession = filtered[idx] || allSessions[0];
  editCurrentStep = 1;
  renderEditStep();
  document.getElementById('editSessionModal').classList.add('open');
}

function closeEditSession() {
  document.getElementById('editSessionModal').classList.remove('open');
}

function renderEditStep() {
  document.querySelectorAll('.edit-tab').forEach((t, i) => {
    t.classList.toggle('active', i+1 === editCurrentStep);
  });
  document.getElementById('editBody').innerHTML = editPanels[editCurrentStep-1]();
  document.getElementById('editStepLabel').textContent = `Update interview details and preferences. Step ${editCurrentStep} of ${EDIT_TOTAL}`;
  const prevBtn = document.getElementById('editPrevBtn');
  const nextBtn = document.getElementById('editNextBtn');
  if (prevBtn) prevBtn.style.display = editCurrentStep > 1 ? 'flex' : 'none';
  if (nextBtn) {
    nextBtn.innerHTML = editCurrentStep === EDIT_TOTAL
      ? `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><path d="M4 10l4 4 8-8"/></svg> Save Changes`
      : `Next <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><path d="M7 5l5 5-5 5"/></svg>`;
  }
  // Re-wire model opts
  document.querySelectorAll('.ai-model-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.ai-model-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
  document.querySelectorAll('.duration-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.duration-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });
}

function editGoStep(dir) {
  if (editCurrentStep === EDIT_TOTAL && dir === 1) {
    const co = document.getElementById('edit-company');
    const po = document.getElementById('edit-position');
    if (co && editingSession) editingSession.company = co.value || editingSession.company;
    if (po && editingSession) editingSession.position = po.value || editingSession.position;
    renderTable();
    closeEditSession();
    showToast('Session updated successfully!');
    return;
  }
  const next = editCurrentStep + dir;
  if (next < 1 || next > EDIT_TOTAL) return;
  editCurrentStep = next;
  renderEditStep();
}

// Init sessions table
sortRows(); renderTable();



/* CV / RESUME TABLE  ─────────────────────────── */


let allResumes = [
  {title:'Frontend Engineer CV', date:'Nov 18, 2025'},
  {title:'Backend Engineer Resume', date:'Oct 9, 2025'},
  {title:'Fullstack Resume – Priya', date:'Sep 26, 2025'},
  {title:'Data Scientist CV', date:'Aug 3, 2025'},
  {title:'DevOps Resume', date:'Jul 12, 2025'},
  {title:'Product Manager CV', date:'Jun 21, 2025'},
  {title:'QA Engineer Resume', date:'May 5, 2025'},
  {title:'Cloud Architect CV', date:'Apr 14, 2025'},
  {title:'ML Engineer Resume', date:'Mar 20, 2025'},
  {title:'React Developer CV', date:'Feb 8, 2025'},
];
let filteredResumes = [...allResumes];
let resumePage = 1, resumeSortNewest = true;
const RESUME_PAGE_SIZE = 6;
let pendingDeleteResumeIdx = null;

function filterResumes() {
  const s = document.getElementById('resumeSearchInput').value.toLowerCase();
  filteredResumes = allResumes.filter(r => !s || r.title.toLowerCase().includes(s));
  resumePage = 1;
  renderResumeTable();
}

function clearResumeSearch() {
  document.getElementById('resumeSearchInput').value = '';
  filterResumes();
}

function toggleResumeSort() {
  resumeSortNewest = !resumeSortNewest;
  document.getElementById('resumeSortLabel').textContent = resumeSortNewest ? 'Newest' : 'Oldest';
  filteredResumes.sort((a, b) => {
    const da = new Date(a.date), db = new Date(b.date);
    return resumeSortNewest ? db - da : da - db;
  });
  renderResumeTable();
}

function renderResumeTable() {
  const start = (resumePage - 1) * RESUME_PAGE_SIZE;
  const rows = filteredResumes.slice(start, start + RESUME_PAGE_SIZE);
  const tbody = document.getElementById('resumeTableBody');
  tbody.innerHTML = rows.map((r, i) => `
    <tr>
      <td style="padding-left:16px"><input type="checkbox" style="cursor:pointer"/></td>
      <td class="col-sno">${start+i+1}</td>
      <td style="font-weight:500">${r.title}</td>
      <td style="color:var(--text-mid)">${r.date}</td>
      <td><div class="action-cell">
        <button class="action-btn" title="View" onclick="openResumeView(${start+i})"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4C5 4 2 10 2 10s3 6 8 6 8-6 8-6-3-6-8-6z"/><circle cx="10" cy="10" r="2.5"/></svg></button>
        <button class="action-btn del" title="Delete" onclick="openResumeDelete(${start+i})"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 6 16 6"/><path d="M7 6V4h6v2M8 9v6M12 9v6"/><rect x="5" y="6" width="10" height="11" rx="1"/></svg></button>
      </div></td>
    </tr>
  `).join('');
  const total = filteredResumes.length, end = Math.min(start+RESUME_PAGE_SIZE, total);
  document.getElementById('resumeShowingText').textContent = total===0 ? 'No results' : `Showing ${start+1}–${end} of ${total}`;
  renderResumePagination(total);
}

function renderResumePagination(total) {
  const tp = Math.ceil(total/RESUME_PAGE_SIZE);
  const pg = document.getElementById('resumePagination');
  let h = `<button class="page-btn" onclick="goResumePage(${resumePage-1})" ${resumePage===1?'disabled':''}>Prev</button>`;
  for(let i=1;i<=tp;i++){
    h += `<button class="page-btn ${i===resumePage?'active':''}" onclick="goResumePage(${i})">${i}</button>`;
  }
  h += `<button class="page-btn" onclick="goResumePage(${resumePage+1})" ${resumePage===tp||tp===0?'disabled':''}>Next</button>`;
  pg.innerHTML = h;
}

function goResumePage(n) {
  const tp = Math.ceil(filteredResumes.length/RESUME_PAGE_SIZE);
  if(n<1||n>tp) return; resumePage=n; renderResumeTable();
}

function toggleSelectAllResumes(cb) {
  document.querySelectorAll('#resumeTableBody input[type="checkbox"]').forEach(c => c.checked = cb.checked);
}

function openResumeView(idx) {
  const r = filteredResumes[idx];
  if (r) document.getElementById('resumeViewTitle').textContent = r.title;
  document.getElementById('resumeViewModal').classList.add('open');
}

function closeResumeView() {
  document.getElementById('resumeViewModal').classList.remove('open');
}

function openResumeDelete(idx) {
  pendingDeleteResumeIdx = idx;
  const r = filteredResumes[idx];
  document.getElementById('deleteItemName').textContent = `"${r ? r.title : 'this resume'}"`;
  document.getElementById('deleteConfirmModal').classList.add('open');
  // Override confirm to delete resume
  window._deleteMode = 'resume';
}

function openUploadResume() {
  document.getElementById('resumeUploadModal').classList.add('open');
  // Simulate progress
  let prog = 0;
  const inner = document.getElementById('uploadProgressInner');
  if (inner) inner.style.width = '0%';
  const interval = setInterval(() => {
    prog = Math.min(prog + 8, 100);
    if (inner) inner.style.width = prog + '%';
    if (prog >= 100) { clearInterval(interval); }
  }, 100);
}

function closeUploadModal() {
  document.getElementById('resumeUploadModal').classList.remove('open');
  // Add a new resume to the list
  const newResume = {title: 'New Resume ' + (allResumes.length + 1), date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})};
  allResumes.unshift(newResume);
  filteredResumes = [...allResumes];
  renderResumeTable();
  showToast('Resume uploaded successfully!');
}

renderResumeTable();

/* ── CONFIRM DELETE (shared) ─────────────────────── */


// Override confirmDelete to handle both modes
const _origConfirmDelete = confirmDelete;
window.confirmDelete = function() {
  if (window._deleteMode === 'resume') {
    if (pendingDeleteResumeIdx !== null) {
      filteredResumes.splice(pendingDeleteResumeIdx, 1);
      allResumes = filteredResumes;
      renderResumeTable();
      showToast('Resume deleted.');
    }
    document.getElementById('deleteConfirmModal').classList.remove('open');
    pendingDeleteResumeIdx = null;
    window._deleteMode = null;
  } else {
    _origConfirmDelete();
  }
};


/* EMAIL SUPPORT  ───────────────────────── */

function onSubjectChange() {
  const sel = document.getElementById('subjectSel');
  const tip = document.getElementById('formTip');
  tip.style.display = sel.value === 'Interview & Scoring' ? 'block' : 'none';
}


/* MOCK INTERVIEW  ─────────────────────────── */


const questions = [
  {text:'Tell me about a time when you had to deal with a difficult team member. How did you handle the situation?',done:true},
  {text:'How would you optimize a React app for performance? Walk me through your approach.',done:true},
  {text:'If you were given a project with an unrealistic deadline, how would you handle the situation?',done:false},
  {text:'Explain the concept of closures in JavaScript and provide a practical example.',done:false},
];
let curQ=0, isRecording=false, timerSecs=23*60+45, timerInterval=null;

function renderQList() {
  document.getElementById('qList').innerHTML = questions.map((q,i)=>`
    <div class="q-item ${i===curQ?'q-active':''}" onclick="goQ(${i})">
      <div class="q-num ${i===curQ?'qn-active':q.done?'qn-done':'qn-pending'}">${i+1}</div>
      <div class="q-item-text">${q.text.slice(0,58)}${q.text.length>58?'…':''}</div>
    </div>
  `).join('');
}

function goQ(i) {
  curQ=i;
  document.getElementById('questionText').textContent=questions[i].text;
  document.getElementById('qLabel').textContent=`Question ${i+1} of ${questions.length}`;
  renderQList(); updateStats(); stopRecording();
}
function nextQ(){if(curQ<questions.length-1){questions[curQ].done=true;goQ(curQ+1);}else showToast('All questions completed! 🎉')}
function prevQ(){if(curQ>0)goQ(curQ-1);}
function updateStats(){
  const ans=questions.filter(q=>q.done).length;
  document.getElementById('statAns').textContent=ans;
  document.getElementById('statRem').textContent=questions.length-ans;
}

function toggleRecord(){isRecording=!isRecording;isRecording?startRec():stopRecording();}
function startRec(){
  isRecording=true;
  document.getElementById('micBtn').classList.add('recording');
  document.getElementById('recordBtn').classList.add('rec-active');
  document.getElementById('recordBtnTxt').textContent='Stop Recording';
  document.getElementById('recordHint').textContent='Recording… speak clearly';
}
function stopRecording(){
  isRecording=false;
  document.getElementById('micBtn').classList.remove('recording');
  document.getElementById('recordBtn').classList.remove('rec-active');
  document.getElementById('recordBtnTxt').textContent='Start Recording';
  document.getElementById('recordHint').textContent='Click to start recording your answer';
}

function startTimer(){
  clearInterval(timerInterval);
  timerInterval=setInterval(()=>{
    if(timerSecs>0){timerSecs--;updateTimerDisp();}
    else{clearInterval(timerInterval);showToast('Time is up!');}
  },1000);
}
function updateTimerDisp(){
  const m=Math.floor(timerSecs/60).toString().padStart(2,'0');
  const s=(timerSecs%60).toString().padStart(2,'0');
  document.getElementById('timerNum').textContent=`${m}:${s}`;
  const pct=(timerSecs/(30*60))*100;
  const bar=document.getElementById('timerBar');
  bar.style.width=pct+'%';
  bar.style.background=timerSecs<300?'#e05252':'var(--teal)';
}
function restartTimer(){timerSecs=30*60;updateTimerDisp();startTimer();showToast('Timer restarted!');}

function switchTab(name,el){
  document.querySelectorAll('.tabs .tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-'+name).classList.add('active');
}

renderQList(); updateStats();



/*  LIVE INTERVIEW  ─────────────────────────── */


let liveTimerSecs = 108;
let liveTimerInterval = null;
let liveMicActive = false;
let liveShareActive = true;

function startLiveTimer() {
  clearInterval(liveTimerInterval);
  liveTimerInterval = setInterval(() => {
    liveTimerSecs++;
    const h = Math.floor(liveTimerSecs/3600).toString().padStart(2,'0');
    const m = Math.floor((liveTimerSecs%3600)/60).toString().padStart(2,'0');
    const s = (liveTimerSecs%60).toString().padStart(2,'0');
    const el = document.getElementById('liveTimerNum');
    if (el) el.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

function toggleLiveMic() {
  liveMicActive = !liveMicActive;
  const btn = document.getElementById('liveMicBtn');
  if (btn) btn.classList.toggle('active-btn', liveMicActive);
  showToast(liveMicActive ? 'Microphone active' : 'Microphone muted');
}

function toggleLiveShare() {
  liveShareActive = !liveShareActive;
  const area = document.getElementById('liveShareArea');
  const btn = document.getElementById('liveShareBtn');
  if (area) area.style.opacity = liveShareActive ? '1' : '0.5';
  if (btn) btn.classList.toggle('active-btn', liveShareActive);
  showToast(liveShareActive ? 'Screen sharing started' : 'Screen sharing stopped');
}

function sendLiveQuery() {
  const inp = document.getElementById('transcriptQuery');
  if (!inp || !inp.value.trim()) return;
  const text = inp.value.trim();
  inp.value = '';
  const body = document.getElementById('transcriptBody');
  if (body) {
    const entry = document.createElement('div');
    entry.className = 'transcript-entry';
    entry.innerHTML = `<div class="te-meta"><span class="te-time">Now</span><span class="te-role you">You</span></div><div class="te-text">${text}</div>`;
    body.appendChild(entry);
    body.scrollTop = body.scrollHeight;
  }
  showToast('Query sent to AI...');
}

function clearAIAnswers() {
  const body = document.getElementById('aiAnswersBody');
  if (body) body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-light);font-size:.85rem">AI answers cleared.</div>';
  showToast('Cleared.');
}

function toggleTranscriptExpand() {
  const panel = document.querySelector('.live-transcript-panel');
  if (!panel) return;
  const expanded = panel.style.flex === '1 1 100%';
  panel.style.flex = expanded ? '' : '1 1 100%';
}

// Wire live page activation
const origNavigate = navigate;
window.navigate = function(key) {
  origNavigate(key);
  if ((pageMap[key]||key) === 'live') {
    liveTimerSecs = 108;
    startLiveTimer();
  } else {
    clearInterval(liveTimerInterval);
  }
};



/*  CREATE SESSION MODAL _________________________ */


let csCurrentStep = 1;
const CS_TOTAL = 6;
let csSelectedResume = 'Software_Engineer_Resume_2024.pdf';

function openCreateSession() {
  csCurrentStep = 1;
  renderCSStep();
  document.getElementById('createSessionModal').classList.add('open');
}

function closeCreateSession() {
  document.getElementById('createSessionModal').classList.remove('open');
}

function renderCSStep() {
  // Update tabs
  document.querySelectorAll('.cs-tab').forEach((t, i) => {
    const step = i + 1;
    t.classList.toggle('active', step === csCurrentStep);
    t.classList.toggle('done', step < csCurrentStep);
  });

  // Update panels
  document.querySelectorAll('.cs-panel').forEach((p, i) => {
    p.classList.toggle('active', i + 1 === csCurrentStep);
  });

  // Update subtitle
  const remaining = CS_TOTAL - csCurrentStep + 1;
  const subtitleEl = document.getElementById('csSubtitle');
  if (subtitleEl) {
    subtitleEl.textContent = remaining === 1
      ? 'Set up your AI-powered interview in 1 easy step'
      : `Set up your AI-powered interview in ${remaining} easy steps`;
  }

  // Update Prev button
  const prevBtn = document.getElementById('csPrevBtn');
  if (prevBtn) prevBtn.style.display = csCurrentStep > 1 ? 'flex' : 'none';

  // Update Next/Start button
  const nextBtn = document.getElementById('csNextBtn');
  if (nextBtn) {
    if (csCurrentStep === CS_TOTAL) {
      nextBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:15px;height:15px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Start Interview`;
    } else {
      nextBtn.innerHTML = `Next <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:14px;height:14px"><path d="M7 5l5 5-5 5"/></svg>`;
    }
  }

  // If entering step 6, populate summary
  if (csCurrentStep === CS_TOTAL) {
    csPopulateSummary();
  }
}

function csPopulateSummary() {
  const company = document.getElementById('cs-company')?.value || '—';
  const role = document.getElementById('cs-role')?.value || '—';
  const langEl = document.getElementById('cs-language');
  const langText = langEl?.options[langEl.selectedIndex]?.text || 'English';
  const modelSelected = document.querySelector('.cs-model-opt.selected .cs-model-name');
  const model = modelSelected?.textContent || 'GPT-4.1';
  const durSelected = document.querySelector('.cs-dur-opt.selected');
  const dur = durSelected ? durSelected.textContent.trim() + 'utes' : '45 minutes';
  const transcriptOn = document.getElementById('cs-transcript')?.checked;

  document.getElementById('sumCompany').textContent = company || '—';
  document.getElementById('sumPosition').textContent = role || '—';
  document.getElementById('sumLanguage').textContent = langText;
  document.getElementById('sumModel').textContent = model;
  document.getElementById('sumDuration').textContent = dur;
  document.getElementById('sumTranscript').textContent = transcriptOn ? 'Enabled' : 'Disabled';
}

function csGoStep(dir) {
  if (csCurrentStep === CS_TOTAL && dir === 1) {
    // Validate step 1 fields
    const company = document.getElementById('cs-company')?.value?.trim() || 'New Company';
    const role = document.getElementById('cs-role')?.value?.trim() || 'New Role';
    closeCreateSession();
    allSessions.unshift({
      company,
      position: role,
      status: 'active',
      credits: 5,
      date: new Date().toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}),
      usage: 0
    });
    filtered = [...allSessions];
    sortRows();
    renderTable();
    showToast('Session created! Starting Live Interview...');
    setTimeout(() => window.navigate('live'), 800);
    return;
  }
  const next = csCurrentStep + dir;
  if (next < 1 || next > CS_TOTAL) return;
  csCurrentStep = next;
  renderCSStep();
}

/* Resume tab toggle */
function csResTab(mode) {
  const existBtn = document.getElementById('csResTabExist');
  const uploadBtn = document.getElementById('csResTabUpload');
  const existPanel = document.getElementById('csResExistPanel');
  const uploadPanel = document.getElementById('csResUploadPanel');
  if (mode === 'exist') {
    existBtn.classList.add('active');
    uploadBtn.classList.remove('active');
    existPanel.style.display = 'block';
    uploadPanel.style.display = 'none';
  } else {
    uploadBtn.classList.add('active');
    existBtn.classList.remove('active');
    existPanel.style.display = 'none';
    uploadPanel.style.display = 'block';
  }
}

/* Select resume from list */
function csSelectResume(el, name) {
  document.querySelectorAll('.cs-resume-item').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
  csSelectedResume = name;
}

/* AI model selection */
document.querySelectorAll('.cs-model-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.cs-model-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
  });
});

/* Duration selection */
document.querySelectorAll('.cs-dur-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.cs-dur-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
  });
});

/* Connection method */
function csSelectConn(el) {
  document.querySelectorAll('.cs-connect-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

function handleResumeFile(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById('resumeFileName').textContent = file.name;
  document.getElementById('resumeDropZone').style.display = 'none';
  document.getElementById('resumeUploaded').style.display = 'flex';
  showToast('Resume uploaded!');
}

function clearResume() {
  document.getElementById('resumeDropZone').style.display = 'flex';
  document.getElementById('resumeUploaded').style.display = 'none';
  document.getElementById('resumeFileInput').value = '';
}

function selectConnect(el, type) {
  document.querySelectorAll('.connect-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

/* ── MODAL OUTSIDE CLICK ─────────────────────────── */


function closeModalOutside(e, id) {
  if (e.target === document.getElementById(id)) {
    document.getElementById(id).classList.remove('open');
  }
}
/* ═══════════════════════════════════
   MOCK INTERVIEW v2 — JS
   ═══════════════════════════════════ */

(function() {
  /* ── Timer ── */
  let mi2Secs = 108;
  function mi2FmtTime(s) {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sc = String(s % 60).padStart(2, '0');
    return h + '<span class="mi2-colon">:</span>' + m + '<span class="mi2-colon">:</span>' + sc;
  }
  setInterval(function() {
    mi2Secs++;
    const el = document.getElementById('mi2Timer');
    if (el) el.innerHTML = mi2FmtTime(mi2Secs);
  }, 1000);

  /* ── Query submit ── */
  function mi2Submit() {
    const inp = document.getElementById('mi2QueryInput');
    if (!inp) return;
    const txt = inp.value.trim();
    if (!txt) return;
    const feed = document.getElementById('mi2TranscriptFeed');
    if (feed) {
      const ts = new Date();
      const mm = String(ts.getMinutes()).padStart(2, '0');
      const ss = String(ts.getSeconds()).padStart(2, '0');
      const div = document.createElement('div');
      div.className = 'mi2-msg mi2-you';
      div.innerHTML =
        '<div class="mi2-msg-meta">' +
          '<span class="mi2-msg-ts">00:' + mm + '</span>' +
          '<span class="mi2-role-tag mi2-role-a">You</span>' +
        '</div>' +
        '<div class="mi2-msg-bubble">' + txt + '</div>';
      feed.appendChild(div);
      feed.scrollTop = feed.scrollHeight;
    }
    inp.value = '';
  }

  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'mi2QueryBtn') mi2Submit();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'mi2QueryInput') mi2Submit();
  });

  /* ── Stop sharing toggle ── */
  document.addEventListener('click', function(e) {
    if (!e.target || e.target.id !== 'mi2StopBtn') return;
    const btn = e.target;
    const pill = btn.closest('.mi2-screen-area') ? btn.closest('.mi2-screen-area').querySelector('.mi2-sharing-pill') : null;
    const lbl = document.getElementById('mi2ScreenLabel');
    const sub = document.getElementById('mi2ScreenSub');
    if (btn.textContent.trim() === 'Stop Sharing') {
      btn.textContent = 'Start Sharing';
      if (pill) { pill.style.background = '#374151'; pill.innerHTML = '<span class="mi2-dot" style="background:#6b7280"></span> PAUSED'; }
      if (lbl) lbl.textContent = 'Screen sharing paused';
      if (sub) sub.textContent = '';
    } else {
      btn.textContent = 'Stop Sharing';
      if (pill) { pill.style.background = ''; pill.innerHTML = '<span class="mi2-dot"></span> SHARING'; }
      if (lbl) lbl.textContent = 'Screen sharing active';
      if (sub) sub.textContent = 'Sharing: meet.google.com';
    }
  });

  /* ── Clear answers ── */
  document.addEventListener('click', function(e) {
    if (!e.target || e.target.id !== 'mi2ClearBtn') return;
    const feed = document.getElementById('mi2AnswersFeed');
    if (feed) {
      feed.innerHTML =
        '<div style="text-align:center;padding:48px 0;color:#3d4258;font-size:12.5px;">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" style="width:28px;height:28px;opacity:.3;display:block;margin:0 auto 10px"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
          'No answers yet. Start speaking or type a query.' +
        '</div>';
    }
  });
})();
