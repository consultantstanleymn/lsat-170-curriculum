# Contributing / Authoring Notes

This is a personal study repo, but it's structured so a day can be authored independently in any session without
breaking continuity with the days around it.

## Adding or rewriting a day

1. Find the day's row in `data/days.json` — it has `day`, `week`, `phaseNum`, `phase`, `title`, `archetype`, `load`,
   and `detailed` (set this `true` once the page is written).
2. Archetype determines the page shape:
   - **A** (LR deep dive): recap → CS Bridge → 4–6 subsections → official drill assignment → 6–12 original items → preview.
   - **B** (RC deep dive): recap → CS Bridge (optional) → subsections → one original passage + questions → official drill → preview.
   - **C** (synthesis): recap → decision matrices → one official timed section or mixed drill → mixed original items → preview.
   - **D** (full official timed practice): sitting protocol → results-capture form → scoring guide → preview. **No original questions on D days.**
   - **E** (review): blind-review protocol → error-log lab → trap-library entries → trap drill → preview.
   - **F** (strategy/logistics): grounding content only — score math, school list, registration, go/no-go, writing, test day.
3. Every page includes: the topbar, the full sidebar (all 168 days, `nav-link` for written days, `nav-pending` for
   the rest), the `<div id="tracker"></div>` mount point, and `<script>renderTracker('tracker', N);</script>` at the
   bottom, matching the pattern in `days/day-001.html` through `days/day-012.html`.
4. A/B/C/E pages with original items must include the originality notice: *"Practice items on this page are
   curriculum-authored in LSAT style; they are not official LSAC questions."*

## PrepTest reference rules (do not violate these)

1. Reference sections **by type ordinal** ("PT 1xx, LR-2" or "RC-1"), never by raw section number — experimental
   placement makes raw numbers unreliable across different test administrations.
2. Never invent a question-level claim like "PT 1xx LR-1 Q14 is a Flaw question." The correct drill instruction is
   "scan the whole section and work only today's type" — this is itself stem-recognition practice.
3. Never reproduce official LSAC stimuli, questions, or answer keys on this site.
4. `pt` values in any drill assignment should come from `data/preptest-allocation.json`, which is filled in from the
   real LawHub library — don't invent PrepTest numbers.

## Continuity

`data/continuity-ledger.json` holds per-day recap hooks and thread names so days written in different sessions still
read as one connected story. `data/trap-library.json` is the canonical, growing list of trap-answer patterns —
E days add to it; later days cite entries by `id`.

## Personal data

Scores and the error log live in the browser's `localStorage` (`lsat_performance_v1`) via the Performance panel in
`assets/app.js`, with JSON export/import. Never commit real performance data to `data/private/` without checking
it's covered by `.gitignore` — this repo is public.
