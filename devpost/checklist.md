---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. You can play the surprise challenge: wrong answer, diagnosis, hint, retry, reveal**
  Becomes usable: A running app that opens straight into challenge 1 ("Pick the split"). Pick an answer and submit: right first time shows a first-try achievement; wrong shows that option's misconception plus one hint and one retry; wrong again reveals the answer and why the others don't fit. Nothing is saved yet; only challenge 1 exists.
  Why now: This is the unique kernel (detect why the learner is confused). It is built first and end to end, with the scaffold and the layer boundaries bootstrapped inside it, so every later slice has the right structure to land in.
  PRD ref: `prd.md > Surprise challenge`, `prd.md > Diagnose, hint, and retry`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Domain: types and session rules`, `spec.md > Content: port, schema, and the k-fold topic`, `spec.md > UI: Challenge screen`, `spec.md > File Structure`, `spec.md > Stack`
  Build: Scaffold Vite + React + strict TypeScript, install and pin dependencies (verify current versions and the Fontsource fonts first, as the spec flags), add ESLint layer-boundary rules, Vitest and Zod. Add domain types and the session reducer (attempts, outcomes), the content port, schema and static provider with challenge 1 authored, the composition root, and a Challenge screen with option list, feedback panel and keyboard A–D + Enter. Apply the palette and font tokens from `Look and Feel`.
  Verify (mechanical): `npm run typecheck`, `npm run lint` and `npm test` pass (reducer tests cover first-try, corrected, revealed and the one-retry limit; content test validates challenge 1); `npm run dev` starts with no errors.
  Learner check: Open `http://localhost:5173`. Answer challenge 1 wrong, read the diagnosis and hint, retry, then clear it and try wrong twice to see the reveal. Say whether the diagnosis explains why the wrong option was tempting.
  Commit: `Add playable surprise challenge with diagnose, hint, retry and reveal`

- [x] **2. You can play all five challenges, ending on the transfer challenge**
  Becomes usable: Continue after each challenge through five challenges; the last is a transfer challenge with different surface details. Finishing reaches a placeholder "session finished" state.
  Why now: The full journey proves the kernel's second half (can the learner apply the idea to something new). The content is the highest risk, so it is written and reviewed now, before polish.
  PRD ref: `prd.md > Remaining challenges and transfer challenge`, `prd.md > The Core Journey`
  Spec ref: `spec.md > Content: port, schema, and the k-fold topic`, `spec.md > Domain: types and session rules`
  Build: Author challenges 2–5 (Find the leak, Question the metric, Protect the test set, Same idea new case) with misconceptions, hints and reveals; enforce the schema rules (exactly 5, only the last is transfer, shared concept tag); add `ADVANCE` and the `finished` status; add a simple hand-authored illustration per challenge.
  Verify (mechanical): Content test passes against all five challenges; reducer tests cover advance rules and finish; `npm run typecheck`, `lint`, `test` pass; play through all five in the dev server.
  Learner check: Play all five challenges. Read each one and say whether the ML is correct, whether the wrong options are tempting for the right reasons, and whether challenge 5 is genuinely new and not a re-skin.
  Commit: `Add five challenges ending in a transfer challenge`

- [x] **3. You see an evidence-based score and results at the end**
  Becomes usable: After challenge 5 the Results screen shows initial accuracy, misconceptions addressed (Corrected or Revealed), retry outcomes, transfer performance, and the 100-point score with each part's points. "Start over" begins a new session.
  Why now: Completes the Surprise → Diagnose → Transfer → Reflect loop. Scoring is pure domain logic, so it is cheap to build and test once the records exist.
  PRD ref: `prd.md > Combined scoring and results screen`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Domain: scoring and results`, `spec.md > UI: Results screen`
  Build: Add the weights table, score calculation and results builder; add the Results screen and the `RESTART` action; switch the view on `finished`.
  Verify (mechanical): Scoring and results tests cover all-first-try (100), all-revealed (0), mixed sessions and transfer weighting; typecheck, lint and test pass; finish a session in the dev server and confirm every figure matches the answers given.
  Learner check: Play through with a mix of right, corrected and missed answers and check that every number on the results screen matches what you did.
  Commit: `Add combined scoring and results screen`

- [x] **4. Your progress survives closing the tab**
  Becomes usable: Leave at any point, including after a wrong first answer, and return to the same challenge with the hint and single retry intact; a first visit still starts at challenge 1.
  Why now: Saving is the first place the data model can be wrong, and the whole session shape now exists to save.
  PRD ref: `prd.md > Saved progress`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Persistence: port and localStorage adapter`, `spec.md > UI: session provider`, `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: Add the progress repository port, the validated localStorage adapter (versioned, try/catch), the in-memory fallback, save-on-change in the session provider, load at startup via the composition root, the unsaved-progress note, and the error boundary.
  Verify (mechanical): Persistence tests cover save and load round-trip, corrupt JSON, wrong schema or content version, mismatched ids, and a throwing `localStorage`; in the dev server answer wrong once, reload, and confirm the hint and retry are restored.
  Learner check: Answer one challenge, close the tab, reopen it, and confirm you land where you left off. Then answer wrong once, refresh, and confirm you cannot reset the attempt.
  Commit: `Persist and restore session progress`

- [x] **5. You see a hand-drawn map showing where you are**
  Becomes usable: A wobbly ink path with five nodes shows finished challenges stamped by outcome colour and a "you are here" marker. It is visual only.
  Why now: It's the game-feel progress layer, built once state and progress are real so it has real data to show.
  PRD ref: `prd.md > Game-feel progress path`, `prd.md > Look and Feel`
  Spec ref: `spec.md > UI: Map path (progress)`, `spec.md > UI: Handicraft kit`
  Build: Add the seeded random and wobble-path helpers, the MapPath SVG with node states and marker, and place it beside or above the challenge card, with a horizontal strip on narrow screens.
  Verify (mechanical): Tests confirm the same seed gives the same path and different seeds differ; node states follow the session records; typecheck, lint and test pass; inspect the rendered map at desktop and narrow widths.
  Learner check: Play through and watch the map change. Say whether it feels like a hand-drawn journey and not a progress bar, and whether the wobble feels deliberate.
  Commit: `Add hand-drawn map path for progress`

- [x] **6. The whole app feels hand-crafted**
  Becomes usable: Cream paper with grain, offset paper-shadow cards, running-stitch borders, lettered display headings, ink palette with multiply overprint, sparing stop-motion, reduced-motion support, keyboard and screen-reader polish.
  Why now: Left late on purpose, so the look is applied to a behaviour that already works and is not rebuilt as the behaviour changes.
  PRD ref: `prd.md > Look and Feel`
  Spec ref: `spec.md > Look and Feel`, `spec.md > UI: Handicraft kit`
  Build: Add PaperCard, StitchBorder and HandLetteredText, finish the tokens and grain, refine the illustrations, apply 8–12 fps CSS stop-motion with `prefers-reduced-motion` off-switch, and verify focus order, contrast and responsive layout.
  Verify (mechanical): Typecheck, lint, test pass; production `npm run build` succeeds; check contrast of text on cream and that nothing animates under reduced motion; screenshot desktop and narrow widths.
  Learner check: Look at every screen and ask: does anything feel generic, like a quiz app, or like a texture filter on a standard UI?
  Commit: `Apply handicraft look across screens`

- [ ] **7. Someone else can run and try it**
  Becomes usable: A clean clone installs, runs and builds from the README, and CI passes on every push, ready for a public deploy.
  Why now: The learner wants others to try it; this closes the gap between "works here" and "works for a stranger".
  PRD ref: `prd.md > What We're Building`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Stack`
  Build: Write the README (run, build, how to try it), add `.github/workflows/ci.yml` (typecheck, lint, test, build), make sure `.gitignore` covers `node_modules` and `dist`, and do a fresh install and build to confirm.
  Verify (mechanical): In a clean copy, `npm ci`, `npm run build` and `npm run preview` work; all checks pass locally exactly as CI will run them.
  Learner check: Follow the README from scratch and confirm the app opens and plays.
  Commit: `Add README and CI`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 2, when all five challenges are playable
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions

- TypeScript pinned to 6.0.3, not the latest 7.x — the build discovered `typescript-eslint` (needed for the layer-boundary lint rules) supports only TypeScript below 6.1. Revisit when it adds 7.x support.
- Added `src/domain/fixtures.ts` (a tiny test topic) — the layer-boundary lint rule correctly stopped domain tests from importing real content.
