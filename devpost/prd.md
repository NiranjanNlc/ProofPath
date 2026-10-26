---
doc: prd
status: approved
---

# ProofPath — Product Requirements

ProofPath is a game-feel learning app for developers stuck in tutorial hell. It exposes a misconception first, diagnoses it, and tests whether the learner can apply the corrected understanding to a new problem.
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

This PRD supersedes `scope.md > The Core Loop` where they differ: there is **no separate lesson step**. The learner "lands on doing", and teaching happens inside diagnosis.

## The Core Journey
Loop: **Surprise → Diagnose → Transfer → Reflect** (source: `scope.md > The Core Loop`).

1. The learner opens ProofPath and sees a surprising ML scenario (for example, a k-fold vs. stratified k-fold situation with a rare "false" case). The app picks the topic; topic and level choice is a later version.
2. They select an answer and submit it.
3. ProofPath records whether the first attempt was correct.
   - **Correct on the first try:** recorded as a first-try achievement.
   - **Incorrect:** the learner gets the misconception diagnosis plus one progressive hint, and can retry.
4. If they answer incorrectly again, ProofPath reveals the correct answer and explains the misconception.
5. The learner proceeds through the remaining challenges.
6. The final transfer challenge presents a different scenario with different surface details, so the original answer can't simply be repeated.
7. The results screen summarizes initial accuracy, misconceptions addressed, retry outcomes, and transfer performance.
8. If the learner leaves midway, ProofPath restores their last saved challenge and completed progress when they return.

## Screens and Layout
Surfaces, kept to what the journey needs:

- **Landing / opening challenge.** Opens straight into the surprise scenario, not a menu. A short greeting and an inviting call to play, and no topic or level picker in the PoC.
- **Challenge screen** (used for the surprise, remaining challenges, and the transfer challenge). Scenario text, a relevant picture, multiple-choice answers, and submit. Shown here are the progress path (see Look and Feel) and the feedback area for the hint, diagnosis, and reveal.
- **Results screen.** Initial accuracy, misconceptions addressed, retry outcomes, and transfer performance, backed by evidence from the learner's own answers.

Movement: landing/opening challenge → challenges → transfer challenge → results. Returning mid-session lands on the last saved challenge.

## Look and Feel
Direction supplied by the learner. The test: could a person plausibly have made this by hand, and does every irregularity follow a rule (same stitch length range, same light direction, same ink set)?

**Overall:** minimalistic, handicraft, gamified, and tempting to play. Handicraft means evidence of a hand: bounded irregularity, a visible material, and a few deliberate choices. It is not a texture filter over a standard UI. Every screen should feel like part of a game, not a quiz application.

**Typography**
- Humanist or soft-serif faces with slight wonk. Hand-lettering for display text only (headings, labels, empty states). Body copy stays a legible text face.
- Repeated letters should not be identical (contextual alternates or glyph variants).
- If pixel type is used, it needs a strict grid, integer scaling, and no anti-aliasing blur.

**Color**
- Pigment logic: warm cream paper instead of #FFF, warm near-black ink instead of #000.
- 3–5 inks (muted madder red, indigo, ochre, moss), overprinted with multiply blending.

**References, and what to take from each**
- Paper: grain, deckled edges, layered cut-paper with one consistent light source and soft contact shadows.
- Stitching: dashed borders as running stitch, cross-stitch grid icons, chain-stitch outlines.
- Hand-drawn maps: wobbly paths, illustrated landmarks, "you are here". The lesson to take is progress as a journey through a place.
- Mario-world overworld maps: nodes connected by paths, tile grids, strict-grid sprites, and a capped palette. Take the grammar (map as progress, tiles, palette limits), not Nintendo's characters or assets.

**Technique**
- Seeded irregularity: each line or stitch differs, but is the same on every render. Low-opacity noise and sparing stop-motion animation (8–12 fps).
- Crisp underneath: grid, contrast, spacing, and touch targets stay rigorous. Handmade character lives in headings, borders, illustration, and empty states, not in inputs or dense data.

**Must not look like**
- Skeuomorphism, handwriting-font body copy, a uniform "sketch filter", Etsy-style kitsch, generic Corporate Memphis or AI watercolor illustration, blurry pixel pastiche, or default-modern tells (pure white/black, uniform 8px cards, glassmorphism, SaaS blue-purple gradients). No accidental sloppiness passed off as charm.

## Features and Behavior

### Surprise challenge
Source: `scope.md > The Unique Kernel`.
- As a developer who knows a concept's definition, I want to face a tricky scenario before any explanation, so that I discover my own misconception.
  - [ ] On opening the app, a scenario with text, a relevant picture, and multiple-choice answers is shown before any lesson text.
  - [ ] I can pick exactly one answer and submit it.
  - [ ] The app records whether the first attempt was correct.
  - [ ] A correct first attempt is recorded and shown as a first-try achievement.

### Diagnose, hint, and retry
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`.
- As a learner who answered wrong, I want to know why that option was tempting, so that I correct my reasoning and don't just memorize an answer.
  - [ ] After a wrong first answer, the app explains the specific misconception behind the choice I made, and shows one progressive hint.
  - [ ] I can retry the same challenge once after the hint.
  - [ ] If the retry is correct, it is recorded as corrected, not as a first-try success.
  - [ ] If the retry is also wrong, the correct answer is revealed with an explanation of the misconception and why the other options don't fit.

### Remaining challenges and transfer challenge
Source: `scope.md > What "Working" Looks Like`.
- As a learner, I want a genuinely new problem at the end, so that I know I can apply the idea and not just recognize the earlier question.
  - [ ] After the surprise challenge, I move through the remaining challenges.
  - [ ] The final challenge is a transfer challenge: a different scenario with different surface details, not a re-skin of an earlier question with the same answer.
  - [ ] The transfer result is recorded separately from the earlier attempts.

### Combined scoring and results screen
- As a learner, I want to see evidence of what I got and what I fixed, so that I trust the result.
  - [ ] The results screen shows initial accuracy, misconceptions addressed, retry outcomes, and transfer performance.
  - [ ] The figures match what I actually did in the session, with no placeholder numbers.
  - [ ] The score is shown transparently as a combination of these parts (exact weighting: see Open Questions).

### Saved progress
- As a learner who leaves midway, I want to come back where I stopped.
  - [ ] If I close or leave mid-session and return, I land on my last saved challenge with my completed progress intact.
  - [ ] A first-time visit with nothing saved starts at the opening surprise challenge.

### Game-feel progress path
Source: `scope.md > POC Boundary` (the Mario layer is visual only).
- [ ] A visible map or path shows how many challenges are done and where I am.
- [ ] It is visual progression only: no lives, no unlock gates, no score economy.

## States and Boundaries
- **First use:** opens directly into the surprise challenge. No setup, no sign-in.
- **Correct on first try:** recorded as a first-try achievement, then I continue to the next challenge.
- **Wrong once:** misconception diagnosis plus one progressive hint, then one retry.
- **Wrong twice:** the correct answer is revealed with the misconception explained, and I continue. The miss is reflected in the results.
- **Returning mid-session:** the last saved challenge and completed progress are restored.
- **Finished session:** the results screen is shown.
- **Content source:** challenges come from hardcoded content for one or two topics, kept separate from the app so live AI generation can replace it later (see `scope.md > Later`).

## Product Decisions
- No separate short lesson; the learner "lands on doing" — teaching happens through diagnosis, because the product competes on detecting confusion, not on explaining concepts.
- Opening with a surprising question before teaching — so the explanation lands on a real mistake.
- A first-try correct answer is recorded as an achievement, not a skipped step.
- One hint, one retry, then reveal and explain — keeps the loop short and the evidence clear.
- The transfer challenge must differ in surface details, so it tests application and not memory.
- Priorities: combined scoring, hint-and-retry feedback, a genuinely new transfer scenario, and an evidence-based results screen.
- Topic and level choice is a later version; the PoC uses app-chosen hardcoded topics.
- Handicraft look: evidence of a hand, with rule-bound irregularity, crisp underneath.
- Mario-style layer is visual only in the PoC.
- Content is separate from the app, for a clean swap to live AI generation later.

## What We're Building
- Opening surprise challenge and the Surprise → Diagnose → Transfer → Reflect loop.
- Hint-and-retry feedback with misconception diagnosis and a reveal after a second miss.
- A final transfer challenge with different surface details.
- Combined scoring and an evidence-based results screen.
- Saved and restored progress.
- Visual progress path in the handicraft style.
- One or two hardcoded topics, kept separate from the app code.

## Deferred From the POC
- Topic and level selection by the learner: needs a broader content set and a choice UI.
- Live AI-generated challenges: needs generation, quality checks, and API setup.
- Real game mechanics (lives, unlocks, scoring economy): the visual layer is enough to show the feel.
- Accounts and cross-device progress: saved progress is enough for the demo.

## Possible Later Enhancements
- Spaced-repetition revisits of corrected misconceptions.
- Streaks and achievements beyond the first-try achievement.
- More topics beyond ML evaluation.

## Non-Goals
- Not a lesson or tutorial platform: the product does not compete on explaining concepts.
- No copied Nintendo characters or assets.
- No generic quiz-app styling.

## Open Questions
Resolve before `4-spec` unless noted.
- **How many challenges are in a session?** You said "the remaining challenges" and a final transfer challenge, but not how many. Working assumption: a small fixed number (for example three or four in total), with the last one being the transfer challenge.
- **Scoring weights.** The results screen shows several parts, but we haven't fixed how they combine into one score (for example how much a first-try correct answer counts vs. a corrected one vs. transfer). Needs a decision before `4-spec`.
- **Primary visual material.** Your brief lists paper, stitching, hand-drawn map, and Mario-world overworld. Do you want one dominant material, or a blend (for example a hand-drawn overworld map with stitched borders)? Can be settled at design time, but is worth deciding here.
- **Progress storage across devices** is not needed for the PoC; can wait.
