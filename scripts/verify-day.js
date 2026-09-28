#!/usr/bin/env node
// Structural sanity check for a day page. Usage: node scripts/verify-day.js <dayNumber>
// No external deps — plain Node.js, regex-based (good enough for a hand-authored static site).

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DAYS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'days.json'), 'utf8'));
const TOTAL_DAYS = DAYS.length;

const WORD_FLOOR = { A: 3500, B: 3500, C: 2500, D: 1000, E: 2500, F: 1500 };
const QUIZ_COUNT = { A: 12, B: 7, C: 20, D: 0, E: 15, F: 0 };

const BANNED_PHRASES = [
  "in today's fast-paced world",
  "it's important to note that",
  'in conclusion,',
];

function fail(msg) {
  console.error('FAIL: ' + msg);
  process.exitCode = 1;
}
function warn(msg) {
  console.warn('WARN: ' + msg);
}

function wordCount(text) {
  return (text.match(/\b[\w'-]+\b/g) || []).length;
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

const dayNum = parseInt(process.argv[2], 10);
if (!dayNum || dayNum < 1 || dayNum > TOTAL_DAYS) {
  console.error(`Usage: node scripts/verify-day.js <1-${TOTAL_DAYS}>`);
  process.exit(2);
}

const meta = DAYS.find((d) => d.day === dayNum);
if (!meta) {
  console.error(`Day ${dayNum} not found in data/days.json`);
  process.exit(2);
}

const file = path.join(ROOT, 'days', `day-${String(dayNum).padStart(3, '0')}.html`);
if (!fs.existsSync(file)) {
  fail(`${file} does not exist.`);
  process.exit(1);
}
const html = fs.readFileSync(file, 'utf8');
const arch = meta.archetype;

// --- nav / tracker wiring ---
if (!html.includes(`renderTracker('tracker', ${dayNum})`)) fail('Missing or mismatched renderTracker call.');
if (!html.includes('id="tracker"')) fail('Missing #tracker mount point.');
if (!/class="day-nav"/.test(html)) fail('Missing .day-nav block.');
if (!new RegExp(`markComplete\\(${dayNum},`).test(html)) fail('markComplete call missing or wrong day number.');

// --- word floor ---
const bodyText = stripTags(html);
const words = wordCount(bodyText);
const floor = WORD_FLOOR[arch] ?? 0;
if (words < floor) warn(`Word count ${words} is below the ${floor}-word floor for archetype ${arch}.`);

// --- quiz count ---
const quizMatches = (html.match(/class="scenario-card"/g) || []).length;
const expectedQuiz = QUIZ_COUNT[arch] ?? 0;
if (expectedQuiz > 0 && quizMatches < expectedQuiz) {
  warn(`Found ${quizMatches} scenario items, expected at least ${expectedQuiz} for archetype ${arch}.`);
}
if (arch === 'D' && quizMatches > 0) fail('D-day pages should have no original questions.');

// --- archetype-specific structure ---
if ((arch === 'A' || arch === 'B') && !/id="cs-bridge"/.test(html)) {
  warn('A/B day is missing a #cs-bridge section.');
}
if (arch === 'D') {
  for (const id of ['protocol', 'results', 'scoring']) {
    if (!new RegExp(`id="${id}"`).test(html)) fail(`D-day missing #${id} section.`);
  }
}

// --- originality notice ---
if (quizMatches > 0 && !/curriculum-authored in LSAT style/.test(html)) {
  fail('Page has original items but is missing the originality notice.');
}

// --- copyright / accuracy guards ---
if (/PT ?\d+.{0,20}Q ?\d+/i.test(html)) {
  fail('Found a question-level PrepTest claim (e.g. "PT143 Q14") — not allowed, see docs/style-guide.md.');
}
if (/logic games|analytical reasoning/i.test(html) && !/no longer|removed|retired|used to (be|have)/i.test(html)) {
  warn('Mentions Logic Games/Analytical Reasoning without clearly framing it as no longer on the test.');
}

// --- banned phrases ---
for (const phrase of BANNED_PHRASES) {
  if (html.toLowerCase().includes(phrase)) warn(`Banned phrase found: "${phrase}"`);
}

if (process.exitCode === 1) {
  console.error(`\nDay ${dayNum} FAILED verification.`);
} else {
  console.log(`Day ${dayNum} passed verification (warnings above, if any, are non-blocking).`);
}
