// ── Sidebar collapse ──
const sidebar = document.getElementById('sidebar');
const main = document.getElementById('main');
document.getElementById('collapseBtn').addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  main.style.marginLeft = sidebar.classList.contains('collapsed') ? '64px' : '230px';
});

// ── Mobile sidebar ──
function openMobileSidebar() {
  sidebar.classList.add('mobile-open');
  document.getElementById('mobileOverlay').classList.add('open');
}
function closeMobileSidebar() {
  sidebar.classList.remove('mobile-open');
  document.getElementById('mobileOverlay').classList.remove('open');
}

// ── Toast ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Section edit / save ──
function startEdit(sectionId) {
  document.getElementById('section-' + sectionId).classList.add('section-editing');
}
function saveSection(sectionId) {
  document.getElementById('section-' + sectionId).classList.remove('section-editing');
  // Sync view values from inputs
  const section = document.getElementById('section-' + sectionId);
  section.querySelectorAll('.form-group').forEach(group => {
    const input = group.querySelector('.field-edit input, .field-edit textarea, .field-edit select');
    const view = group.querySelector('.field-view .form-value');
    if (input && view) view.textContent = input.value || input.options?.[input.selectedIndex]?.text || '';
  });
  showToast('Changes saved successfully!');
}

// ── Skills tags ──
function removeTag(btn) {
  btn.closest('.skill-tag').remove();
}
function addTagOnEnter(e) {
  if (e.key !== 'Enter') return;
  const input = e.target;
  const val = input.value.trim();
  if (!val) return;
  const tag = document.createElement('span');
  tag.className = 'skill-tag';
  tag.innerHTML = `${val} <button class="tag-remove" onclick="removeTag(this)">✕</button>`;
  document.getElementById('skillsTags').insertBefore(tag, input);
  input.value = '';
}

// ── Modals ──
function openChangePassword() { document.getElementById('changePwdModal').classList.add('open'); }
function openDeleteModal() { document.getElementById('deleteAccountModal').classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

function confirmDeleteAccount() {
  const val = document.getElementById('deleteConfirmInput').value.trim();
  if (val === 'DELETE') {
    showToast('Account deletion scheduled.');
    closeModal('deleteAccountModal');
  } else {
    document.getElementById('deleteConfirmInput').style.borderColor = '#e05252';
    setTimeout(() => document.getElementById('deleteConfirmInput').style.borderColor = '', 1500);
  }
}

// ── Password strength ──
function checkPwdStrength(val) {
  const segs = ['s1','s2','s3','s4'].map(id => document.getElementById(id));
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const colors = ['#EF4444','#EF4444','#F59E0B','#00c896','#00c896'];
  segs.forEach((s, i) => { s.style.background = i < score ? colors[score] : 'var(--border)'; });
}