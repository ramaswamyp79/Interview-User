 // ── TIMER ──
 
  let seconds = 108;
  const timerEl = document.getElementById('timer-display');
  setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    timerEl.textContent = `00:${m}:${s}`;
  }, 1000);

  // ── QUERY SUBMIT ──
  function handleQuery() {
    const input = document.getElementById('query-input');
    const q = input.value.trim();
    if (!q) return;

    // Add to transcript
    const transcript = document.getElementById('transcript');
    const entry = document.createElement('div');
    entry.className = 't-entry question';
    const now = new Date();
    const time = `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    entry.innerHTML = `
      <div class="t-meta"><span class="t-time">${time}</span><span class="badge-q">Question</span></div>
      <div class="t-text">${q}</div>`;
    transcript.appendChild(entry);
    transcript.scrollTop = transcript.scrollHeight;

    // Add loading card to answers
    const body = document.getElementById('answers-body');
    const card = document.createElement('div');
    card.className = 'answer-card';
    card.innerHTML = `
      <div class="card-header">
        <div class="card-header-left"><span class="q-badge">Question Asked</span><span class="card-time">${time}</span></div>
      </div>
      <div class="card-question">"${q}"</div>
      <div class="card-body">
        <div class="highlight-line" style="color:var(--text-3);font-style:italic;display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--teal);animation:pulse 1s infinite;"></span>
          Generating response…
        </div>
      </div>`;
    body.appendChild(card);
    body.scrollTop = body.scrollHeight;
    input.value = '';
  }

  document.getElementById('query-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleQuery();
  });

  // ── CLEAR ──
  function clearAnswers() {
    document.getElementById('answers-body').innerHTML = '';
  }