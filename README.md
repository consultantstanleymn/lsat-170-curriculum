# LSAT 170 Curriculum

A self-paced, 28-week / 168-day LSAT study plan for a working professional targeting a 168+ score — the number
that turns "admitted" into "admitted with merit money" at DC-area law schools, ahead of a part-time application
to Georgetown Law's Evening JD program (and, realistically, its merit-friendlier peers: GW, American WCL, and
George Mason's Scalia Law), with an eye toward IP/patent law given an MS in CS and software engineering background.

## Live Study Portal
👉 **[http://stanley-n.com/lsat-170-curriculum/](http://stanley-n.com/lsat-170-curriculum/)**

*(Sibling site to [aws-sa-pro-curriculum](https://github.com/consultantstanleymn/aws-sa-pro-curriculum), same account,
same custom domain, same GitHub Pages auto-deploy from `main`.)*

## Why This Plan Exists

Georgetown is a T14 law school — need-based aid is the norm there, and real merit scholarships are rare even for
strong applicants. GW, American WCL, and Scalia Law are all DC-based, all have genuine IP programs, and are far more
likely to award real merit money to an applicant scoring above their 75th percentile. A high LSAT score paired with
a technical graduate degree (USPTO patent-bar eligibility) is exactly the profile those schools compete for — so the
score is the actual cost-reduction lever here, not just an admissions bar to clear.

## The Test, As It Currently Exists

As of August 2024 the LSAT no longer includes Logic Games (Analytical Reasoning) — it was replaced by a third
Logical Reasoning section. The current test is 2 scored LR sections + 1 scored RC section + 1 unscored experimental
section (35 minutes each, 10-minute break after section 2), plus a separate 50-minute Argumentative Writing sample
that gates score release. LR is roughly two-thirds of the score. Any prep material that still teaches Logic Games is
out of date — do not use it.

## Timeline

Targets the **April 2027 LSAT** (Apr 8–10) as the primary sitting, with **June 2027** as a built-in backup, pointing
at **Fall 2028 entry** via rolling applications Sept–Nov 2027 (when merit money is most available). An optional
8-week June Extension Track activates only if the Day 125 go/no-go checkpoint (average of the last 3 PrepTests below
167) calls for it. A diagnostic ≥163 opens a compressed February 2027 / Fall 2027 track as an alternative — see
Day 7's decision rules.

## Curriculum Architecture

| Phase | Weeks | Focus |
|---|---|---|
| 1. Diagnostic + Foundations | 1–3 | Diagnostic PT, argument anatomy, conditional & causal logic, RC structure, first LR question types |
| 2. LR Deep Dive by Question Type | 4–12 | All ~20 LR question types grouped by family, plus weekly RC maintenance |
| 3. RC Deep Dive | 13–17 | RC method, question types, passage types, comparative passages, plus weekly LR maintenance |
| 4. Integration + Timed Sections | 18–21 | Pacing, two-pass strategy, stamina, first 4 full PrepTests, April go/no-go |
| 5. Full PT + Review Cycles | 22–26 | Repeated full PrepTest + review + remediation cycles — where the score moves toward 170 |
| 6. Taper + Test Day | 27–28 | Final PrepTest, method sheets, Argumentative Writing, Prometric logistics, rest protocol |

## Day Archetypes

- **A** (59 days) — LR question-type / logic-skill deep dive: recap, CS Bridge, six subsections, official drill assignment, original practice items.
- **B** (38 days) — RC deep dive: an original passage + questions, plus official drilling.
- **C** (21 days) — weekly synthesis / mixed drill / single timed section, with decision matrices.
- **D** (19 days) — full or multi-section official timed practice. No curriculum questions — LawHub does the work here.
- **E** (22 days) — review / blind review / trap-library / error-log processing. This is where points actually get made.
- **F** (9 days) — strategy, admissions, registration, logistics checkpoints.

## Official Material Policy

This site teaches method, concepts, trap patterns, and pacing strategy, and holds a modest set of curriculum-authored
practice items per page. **It never reproduces official LSAC questions, passages, or answer keys.** Real drilling
happens on [LSAC's LawHub](https://www.lsac.org/lawhub) — every A/B/C/D day gives a specific, LawHub-native drill
assignment (by PrepTest tier and section-type ordinal, never by inventing a question-level claim about a specific
official question).

## Status

12 of 168 days are fully written (Week 1–2: orientation + foundations). The rest are scaffolded in
`data/days.json` with day/week/phase/archetype/title and get filled in incrementally — the same way the companion
[aws-sa-pro-curriculum](https://github.com/consultantstanleymn/aws-sa-pro-curriculum) repo was built out over many
sessions. See `CONTRIBUTING.md` for the page structure and `docs/style-guide.md` for tone/content rules.

## Offline / Local Usage

```bash
git clone https://github.com/consultantstanleymn/lsat-170-curriculum.git
cd lsat-170-curriculum
open index.html
```
