// Shared client-side logic: quiz reveal, nav search filter, day tracker (localStorage only, per-browser).
// NOTE: prefixed with "lsat_" (not "sapro_") because this site shares the stanley-n.com
// origin with the AWS SA Pro curriculum — unprefixed keys would collide across sites.
const TOTAL_DAYS = 168;
const DEFAULT_CURRENT_DAY = 1;
const STORAGE_KEY = 'lsat_current_day';

function getCurrentDay() {
  try {
    const v = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    if (v && v >= 1 && v <= TOTAL_DAYS) return v;
  } catch (e) {}
  return DEFAULT_CURRENT_DAY;
}

function setCurrentDay(n) {
  try {
    n = Math.min(Math.max(1, n), TOTAL_DAYS);
    localStorage.setItem(STORAGE_KEY, String(n));
  } catch (e) {}
  return n;
}

function dayHref(n) {
  var inDaysDir = /\/days\//.test(window.location.pathname);
  var prefix = window.LSAT_BASE || (inDaysDir ? '' : 'days/');
  return prefix + 'day-' + String(n).padStart(3, '0') + '.html';
}

function revealAnswer(id, correctIdx) {
  const exp = document.getElementById('exp-' + id);
  if (exp) exp.classList.add('shown');
  document.querySelectorAll('#opts-' + id + ' .scenario-option').forEach((el, i) => {
    if (i === correctIdx) el.classList.add('correct-answer');
  });
}

function filterNav() {
  const input = document.getElementById('navSearch');
  if (!input) return;
  const q = input.value.toLowerCase();
  document.querySelectorAll('.nav-link, .nav-pending').forEach(link => {
    const text = link.textContent.toLowerCase();
    link.style.display = text.includes(q) ? '' : 'none';
  });
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  setSidebarOpen(!sidebar.classList.contains('open'));
}
function toggleTopLinks() {
  const links = document.querySelector('.top-links');
  const btn = document.querySelector('.mobile-nav-toggle');
  if (!links) return;
  const isOpen = links.classList.toggle('open');
  document.body.classList.toggle('top-links-open', isOpen);
  if (btn) btn.setAttribute('aria-expanded', String(isOpen));
}

function renderTracker(containerId, currentPageDay) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (typeof currentPageDay === 'number') {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setCurrentDay(currentPageDay);
    } catch (e) {}
  }

  const day = getCurrentDay();
  const pct = Math.round((day / TOTAL_DAYS) * 100);
  const onTrackedDay = typeof currentPageDay === 'number' && currentPageDay === day;
  const atEnd = day >= TOTAL_DAYS;
  const nextDay = Math.min(day + 1, TOTAL_DAYS);

  let ctaHtml;
  if (onTrackedDay && atEnd) {
    ctaHtml = `<span class="btn" aria-disabled="true">Curriculum complete</span>`;
  } else if (onTrackedDay) {
    ctaHtml = `<a class="btn" id="continueBtn" href="${dayHref(nextDay)}">Continue to Day ${nextDay} &rarr;</a>`;
  } else {
    ctaHtml = `<a class="btn" href="${dayHref(day)}">Continue Studying &rarr;</a>`;
  }

  const navLinks = Array.from(document.querySelectorAll('.nav-link[data-day]'));
  const jumpOptions = navLinks.map(l =>
    `<option value="${l.getAttribute('href')}" data-day="${l.dataset.day}">${l.textContent.trim()}</option>`
  ).join('');
  const jumpHtml = navLinks.length ? `
    <div class="jump-select-wrap">
      <select class="btn btn-outline jump-select" id="jumpSelect" aria-label="Jump to a specific day">
        <option value="" disabled selected>Jump to day&hellip;</option>
        ${jumpOptions}
      </select>
    </div>
  ` : '';

  el.innerHTML = `
    <div class="tracker-progress">
      <strong>Day ${day} of ${TOTAL_DAYS}</strong> — ${pct}% through the 28-week plan
    </div>
    ${ctaHtml}
    ${jumpHtml}
  `;
  if (onTrackedDay && !atEnd) {
    document.getElementById('continueBtn').addEventListener('click', () => setCurrentDay(nextDay));
  }
  const jumpSelect = document.getElementById('jumpSelect');
  if (jumpSelect) {
    jumpSelect.addEventListener('change', () => {
      const opt = jumpSelect.selectedOptions[0];
      if (!opt || !opt.value) return;
      const d = parseInt(opt.dataset.day, 10);
      if (d) setCurrentDay(d);
      window.location.href = opt.value;
    });
  }
  if (typeof currentPageDay === 'number') {
    document.querySelectorAll('.nav-link[data-day]').forEach(l => {
      if (parseInt(l.dataset.day, 10) === currentPageDay) l.classList.add('current');
    });
  }
}

function markComplete(dayNum, nextHref) {
  setCurrentDay(dayNum + 1);
  window.location.href = nextHref;
}

// --- Reading tools: theme toggle, font-size scale, scroll progress ---
const THEME_KEY = 'lsat_theme';
const SCALE_KEY = 'lsat_reading_scale';
const SCROLL_KEY_PREFIX = 'lsat_scroll_';
const SCALE_STEPS = [90, 100, 110, 120, 130];

function getTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch (e) { return 'dark'; }
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
}
function toggleTheme() {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

function getScale() {
  try {
    const v = parseInt(localStorage.getItem(SCALE_KEY), 10);
    if (SCALE_STEPS.includes(v)) return v;
  } catch (e) {}
  return 100;
}
const tableScrollUpdaters = [];
function applyScale(v) {
  document.documentElement.style.setProperty('--reading-scale', v + '%');
  try { localStorage.setItem(SCALE_KEY, String(v)); } catch (e) {}
  requestAnimationFrame(() => tableScrollUpdaters.forEach(fn => fn()));
}
function stepScale(dir) {
  const cur = getScale();
  const idx = SCALE_STEPS.indexOf(cur);
  const next = SCALE_STEPS[Math.min(Math.max(idx + dir, 0), SCALE_STEPS.length - 1)];
  applyScale(next);
}

function storagePathKey() {
  return SCROLL_KEY_PREFIX + window.location.pathname.replace(/[^a-z0-9_-]+/gi, '_');
}

function getScrollRatio() {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  return max > 0 ? h.scrollTop / max : 0;
}

function updateReadingProgress(bar) {
  bar.style.width = (getScrollRatio() * 100) + '%';
}

function setSidebarOpen(open) {
  const sidebar = document.getElementById('sidebar');
  const btn = document.querySelector('.sidebar-toggle');
  const backdrop = document.querySelector('.sidebar-backdrop');
  if (!sidebar) return;
  sidebar.classList.toggle('open', open);
  document.body.classList.toggle('sidebar-open', open);
  if (btn) btn.setAttribute('aria-expanded', String(open));
  if (backdrop) backdrop.classList.toggle('open', open);
  if (open) {
    const resume = document.querySelector('.resume-reading');
    if (resume) resume.classList.remove('shown');
  }
}

function ensureMobileControls() {
  const topbar = document.querySelector('header.topbar');
  const topLinks = document.querySelector('.top-links');
  if (topbar && topLinks && !document.querySelector('.mobile-nav-toggle')) {
    const menu = document.createElement('button');
    menu.type = 'button';
    menu.className = 'mobile-nav-toggle';
    menu.textContent = 'Menu';
    menu.setAttribute('aria-controls', 'topLinks');
    menu.setAttribute('aria-expanded', 'false');
    menu.addEventListener('click', toggleTopLinks);
    topLinks.id = topLinks.id || 'topLinks';
    topbar.insertBefore(menu, topLinks);
  } else {
    const existing = document.querySelector('.mobile-nav-toggle');
    if (existing) {
      existing.type = 'button';
      existing.setAttribute('aria-expanded', topLinks && topLinks.classList.contains('open') ? 'true' : 'false');
      if (topLinks) {
        topLinks.id = topLinks.id || 'topLinks';
        existing.setAttribute('aria-controls', topLinks.id);
      }
    }
  }

  const sidebar = document.getElementById('sidebar');
  if (sidebar && !document.querySelector('.sidebar-toggle')) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'sidebar-toggle btn btn-outline';
    toggle.textContent = 'Browse sections';
    toggle.setAttribute('aria-controls', 'sidebar');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', toggleSidebar);
    sidebar.parentNode.insertBefore(toggle, sidebar);
  } else {
    const existing = document.querySelector('.sidebar-toggle');
    if (existing) {
      existing.type = 'button';
      existing.setAttribute('aria-controls', 'sidebar');
      existing.setAttribute('aria-expanded', sidebar && sidebar.classList.contains('open') ? 'true' : 'false');
    }
  }

  if (sidebar && !document.querySelector('.sidebar-backdrop')) {
    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'sidebar-backdrop';
    backdrop.setAttribute('aria-label', 'Close navigation');
    backdrop.addEventListener('click', () => setSidebarOpen(false));
    document.body.appendChild(backdrop);
  }

  document.querySelectorAll('.sidebar .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 900px)').matches) setSidebarOpen(false);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    setSidebarOpen(false);
    const links = document.querySelector('.top-links');
    const menu = document.querySelector('.mobile-nav-toggle');
    if (links) links.classList.remove('open');
    document.body.classList.remove('top-links-open');
    if (menu) menu.setAttribute('aria-expanded', 'false');
  });
}

function enhanceTables() {
  document.querySelectorAll('table.data-table').forEach(table => {
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    table.querySelectorAll('tbody tr').forEach(row => {
      Array.from(row.children).forEach((cell, idx) => {
        if (headers[idx]) cell.setAttribute('data-label', headers[idx]);
      });
    });
    const container = table.closest('.table-container');
    if (!container) return;
    const update = () => container.classList.toggle('is-scrollable', table.scrollWidth > container.clientWidth + 2);
    update();
    window.addEventListener('resize', update, { passive: true });
    tableScrollUpdaters.push(update);
  });
}

function initResumeReading() {
  const key = storagePathKey();
  let saved = 0;
  try { saved = parseFloat(localStorage.getItem(key) || '0'); } catch (e) {}

  const canResume = saved > 0.12 && saved < 0.92 && document.documentElement.scrollHeight > window.innerHeight * 1.8;
  let prompt;
  if (canResume) {
    prompt = document.createElement('div');
    prompt.className = 'resume-reading';
    prompt.setAttribute('role', 'status');
    prompt.innerHTML = `
      <span>Resume at ${Math.round(saved * 100)}%</span>
      <button type="button" class="btn btn-green" id="resumeReadingBtn">Resume</button>
      <button type="button" class="resume-dismiss" id="resumeDismissBtn" aria-label="Dismiss resume prompt">&times;</button>
    `;
    document.body.appendChild(prompt);
    requestAnimationFrame(() => prompt.classList.add('shown'));
    window.setTimeout(() => prompt.classList.remove('shown'), 12000);
    document.getElementById('resumeReadingBtn').addEventListener('click', () => {
      const h = document.documentElement;
      window.scrollTo({ top: saved * (h.scrollHeight - h.clientHeight), behavior: 'smooth' });
      prompt.classList.remove('shown');
    });
    document.getElementById('resumeDismissBtn').addEventListener('click', () => prompt.classList.remove('shown'));
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      try { localStorage.setItem(key, String(getScrollRatio())); } catch (e) {}
      if (prompt && getScrollRatio() > 0.15) prompt.classList.remove('shown');
      ticking = false;
    });
  }, { passive: true });
}

function initTocScrollSpy() {
  const tocLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  if (!tocLinks.length) return;
  const sections = tocLinks
    .map(link => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);
  if (!sections.length) return;

  const setActive = (id) => {
    tocLinks.forEach(link => link.classList.toggle('current', link.getAttribute('href') === '#' + id));
  };

  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting);
    if (visible.length) {
      visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      setActive(visible[0].target.id);
    }
  }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
  sections.forEach(s => observer.observe(s));
}

function initBackToTop() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '&#8593;';
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(btn);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      btn.classList.toggle('shown', window.scrollY > window.innerHeight * 1.2);
      ticking = false;
    });
  }, { passive: true });
}

// --- Performance panel: local error log / PT score tracker (localStorage + JSON export/import) ---
const PERF_KEY = 'lsat_performance_v1';

function loadPerf() {
  try {
    const raw = localStorage.getItem(PERF_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { errorLog: [], timedSections: [], pts: [] };
}
function savePerf(data) {
  try { localStorage.setItem(PERF_KEY, JSON.stringify(data)); } catch (e) {}
}
function exportPerf() {
  const data = loadPerf();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lsat-performance-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}
function importPerfFile(fileInput) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      savePerf(data);
      window.location.reload();
    } catch (e) {
      alert('Could not parse that file as performance JSON.');
    }
  };
  reader.readAsText(file);
}
function addPtResult(form) {
  const data = loadPerf();
  data.pts.push({
    date: new Date().toISOString().slice(0, 10),
    pt: form.pt.value,
    scaled: Number(form.scaled.value) || null,
    notes: form.notes.value,
  });
  savePerf(data);
  form.reset();
  renderPerfPanel();
}
function renderPerfPanel() {
  const el = document.getElementById('perfPanel');
  if (!el) return;
  const data = loadPerf();
  const rows = data.pts.slice(-8).reverse().map(p =>
    `<tr><td>${p.date}</td><td>${p.pt || '—'}</td><td>${p.scaled ?? '—'}</td><td>${p.notes || ''}</td></tr>`
  ).join('');
  el.innerHTML = `
    <div class="card">
      <h3 class="sub-heading">Log a PrepTest score</h3>
      <form id="ptForm" onsubmit="event.preventDefault(); addPtResult(this);">
        <input name="pt" placeholder="PT number (e.g. 143)" required>
        <input name="scaled" type="number" min="120" max="180" placeholder="Scaled score">
        <input name="notes" placeholder="Notes (conditions, fatigue, etc.)">
        <button type="submit" class="btn btn-green">Save</button>
      </form>
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Date</th><th>PT</th><th>Scaled</th><th>Notes</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4">No PT scores logged yet.</td></tr>'}</tbody>
        </table>
      </div>
      <p>
        <button type="button" class="btn btn-outline" onclick="exportPerf()">Export JSON</button>
        <label class="btn btn-outline" style="cursor:pointer;">Import JSON
          <input type="file" accept="application/json" style="display:none" onchange="importPerfFile(this)">
        </label>
      </p>
      <p class="text-muted">Performance data lives only in this browser's localStorage. Export regularly if you study from more than one device.</p>
    </div>
  `;
}

function initSectionReveal() {
  const sections = document.querySelectorAll('.doc-section');
  if (!sections.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  sections.forEach((s) => s.classList.add('reveal-init'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
  sections.forEach((s) => obs.observe(s));
}

function initReadingTools() {
  applyTheme(getTheme());
  applyScale(getScale());
  ensureMobileControls();
  enhanceTables();
  initSectionReveal();
  initResumeReading();
  initTocScrollSpy();
  initBackToTop();
  renderPerfPanel();
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.id = 'readingProgressBar';
  document.body.appendChild(bar);
  updateReadingProgress(bar);
  window.addEventListener('scroll', () => {
    updateReadingProgress(bar);
  }, { passive: true });
  window.addEventListener('resize', () => updateReadingProgress(bar));

  const widget = document.createElement('div');
  widget.className = 'reading-tools';
  widget.innerHTML = `
    <button type="button" id="fontDownBtn" title="Smaller text" aria-label="Decrease text size">A&minus;</button>
    <button type="button" id="fontUpBtn" title="Larger text" aria-label="Increase text size">A&plus;</button>
    <span class="divider"></span>
    <button type="button" id="themeToggleBtn" title="Toggle light/dark" aria-label="Toggle theme">&#9788;</button>
  `;
  document.body.appendChild(widget);
  document.getElementById('fontDownBtn').addEventListener('click', () => stepScale(-1));
  document.getElementById('fontUpBtn').addEventListener('click', () => stepScale(1));
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReadingTools);
} else {
  initReadingTools();
}
