 /* ── Timer ── */
  let secs = 108;
  const timerEl = document.getElementById('timer');
  function fmtTime(s) {
    const h = String(Math.floor(s/3600)).padStart(2,'0');
    const m = String(Math.floor((s%3600)/60)).padStart(2,'0');
    const sc = String(s%60).padStart(2,'0');
    return `${h}<span class="timer-colon">:</span>${m}<span class="timer-colon">:</span>${sc}`;
  }
  setInterval(() => { secs++; timerEl.innerHTML = fmtTime(secs); }, 1000);

  /* ── Query ── */
  function submitQuery() {
    const inp = document.getElementById('queryInput');
    const txt = inp.value.trim();
    if (!txt) return;
    addMsg('You', txt);
    inp.value = '';
  }
  document.getElementById('queryBtn').addEventListener('click', submitQuery);
  document.getElementById('queryInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitQuery();
  });

  function addMsg(role, text) {
    const feed = document.getElementById('transcriptFeed');
    const ts = new Date();
    const mm = String(ts.getMinutes()).padStart(2,'0');
    const ss = String(ts.getSeconds()).padStart(2,'0');
    const isYou = role === 'You';
    const div = document.createElement('div');
    div.className = 'msg ' + (isYou ? 'you' : 'interviewer');
    div.innerHTML = `
      <div class="msg-meta">
        <span class="msg-ts">00:${mm}</span>
        <span class="role-tag ${isYou ? 'role-you' : 'role-interviewer'}">${role}</span>
      </div>
      <div class="msg-bubble">${text}</div>`;
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;
  }

  /* ── Stop sharing ── */
  document.getElementById('stopBtn').addEventListener('click', function() {
    const sharing = document.querySelector('.sharing-pill');
    if (this.textContent.trim() === 'Stop Sharing') {
      this.textContent = 'Start Sharing';
      sharing.style.background = '#374151';
      sharing.innerHTML = '<span class="dot" style="background:#6b7280"></span> PAUSED';
      document.getElementById('screenLabel').textContent = 'Screen sharing paused';
      document.getElementById('screenSub').textContent = '';
    } else {
      this.textContent = 'Stop Sharing';
      sharing.style.background = 'var(--green)';
      sharing.innerHTML = '<span class="dot"></span> SHARING';
      document.getElementById('screenLabel').textContent = 'Screen sharing active';
      document.getElementById('screenSub').textContent = 'Sharing: meet.google.com';
    }
  });

  /* ── Clear answers ── */
  document.getElementById('clearBtn').addEventListener('click', () => {
    const feed = document.getElementById('answersFeed');
    feed.innerHTML = `
      <div style="text-align:center;padding:48px 0;color:var(--text-dim);font-size:12.5px;">
        <i class="fa-solid fa-bolt" style="font-size:28px;color:var(--indigo);opacity:.3;display:block;margin-bottom:10px;"></i>
        No answers yet. Start speaking or type a query.
      </div>`;
  });

  /* ── End session ── */
  document.getElementById('endBtn').addEventListener('click', () => {
    if (confirm('End this interview session?')) window.location.reload();
  });

  /* ── Sidebar: arrow click toggles collapsed ↔ expanded ── */
  const sidebar = document.getElementById('sidebar');
  const sbArrow = document.getElementById('sbArrow');

  sbArrow.addEventListener('click', () => {
    sidebar.classList.toggle('expanded');
  });

  /* ── Nav item active state ── */
  document.querySelectorAll('.sb-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });