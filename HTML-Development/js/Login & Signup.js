// ─── Password visibility toggle ───────────────────────────────
function toggleEye(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  btn.style.color = isHidden ? 'var(--green)' : '';
}

// ─── Resume drag & drop ───────────────────────────────────────
(function () {
  const dz = document.getElementById('dropzone');
  if (!dz) return;

  dz.addEventListener('dragover', e => {
    e.preventDefault();
    dz.classList.add('drag-active');
  });

  dz.addEventListener('dragleave', () => dz.classList.remove('drag-active'));

  dz.addEventListener('drop', e => {
    e.preventDefault();
    dz.classList.remove('drag-active');
    const file = e.dataTransfer.files[0];
    if (file) updateDropzoneLabel(file.name);
  });
})();

function handleResume(input) {
  if (input.files[0]) updateDropzoneLabel(input.files[0].name);
}

function updateDropzoneLabel(name) {
  const label = document.getElementById('dropzone-label');
  if (label) label.textContent = name;
}
