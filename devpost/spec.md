---
doc: spec
status: approved
---

# ProofPath — Technical Spec

## How This Works, In Plain Language
ProofPath is a **single-page React app that runs entirely in the browser**. There is no server, no database, and no login.

It has four kinds of pieces, kept deliberately separate:

1. **The rules (the "domain").** Plain TypeScript with no React in it. It knows what a session is, how one challenge moves from first answer to hint to retry to reveal, and how the score is calculated. It is the brain, and it can be tested without opening a browser.
2. **The content.** The one topic (k-fold vs. stratified k-fold) lives in data files: scenarios, options, the misconception behind each wrong option, hints, and reveal explanations. The app never reads those files directly. It asks a **content provider**, a small contract that says "give me this topic's challenges". Today the provider reads bundled files. Later, a provider that asks an AI to generate challenges can replace it and nothing else changes.
3. **The memory.** A **progress repository**, which is another small contract, saves and loads the session. Today it uses `localStorage`, a sticky note the browser keeps for one site. A cloud-saving version could replace it later.
4. **The screens.** React components draw the landing page, the challenge screen, the pixel progress path, and the results screen. They only show what the rules say and report what the learner did.

The rule is that **dependencies point inward**: screens depend on the rules, and the rules depend on nothing. Content and memory are plugged in at one spot (the composition root) when the app starts.

Why this shape rather than something fancier: your PRD's proof is the diagnose-and-transfer loop, not infrastructure. A static app needs no accounts, keys, or servers, and it deploys to a free public link. The two contracts (content provider and progress repository) are the only places we pay for future flexibility, because those are exactly the two things your scope says will change later (AI-generated content, accounts and saved history).

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. **Open the app.** `main.tsx` calls the composition root. It builds the static content provider and the localStorage repository, then loads any saved session. With nothing saved (or something unreadable), it creates a fresh session at challenge 1.
2. **See challenge 1.** The Challenge screen shows scenario text, a picture, and options A–C. The map path shows node 1 as "you are here". *(Implements `prd.md > Surprise challenge`.)*
3. **Pick an answer and submit** (click, or press A–C then Enter). The UI sends a `SUBMIT_ANSWER` action to the session reducer in the domain.
4. **The reducer records the attempt.**
   - Correct on the first attempt: the challenge's outcome is `first-try`. A first-try achievement is shown, then "Continue".
   - Wrong on the first attempt: the reducer stores the attempt and the UI shows that option's misconception diagnosis plus the one hint. The learner can retry once. *(Implements `prd.md > Diagnose, hint, and retry`.)*
5. **The retry.**
   - Correct: outcome `corrected`.
   - Wrong: outcome `revealed`, and the UI shows the correct answer, the misconception explanation, and why each other option doesn't fit.
6. **Every attempt is saved immediately.** The session provider writes the new session through the progress repository, so closing the tab at any moment loses nothing. *(Implements `prd.md > Saved progress`.)*
7. **Continue.** An `ADVANCE` action moves to the next challenge. The map path stamps the finished node with its outcome colour and moves the marker.
8. **Challenge 5 is the transfer challenge.** It has the same flow, but it is marked `isTransfer`, and its result is kept as its own line in the results. *(Implements `prd.md > Remaining challenges and transfer challenge`.)*
9. **Finish.** After challenge 5, the view switches to the Results screen. The results builder reads the saved records and computes initial accuracy, misconceptions addressed, retry outcomes, transfer performance, and the combined score. Nothing is stored as a number; everything is derived from what the learner actually did. *(Implements `prd.md > Combined scoring and results screen`.)*
10. **Return later.** Step 1 loads the saved session. If the learner had answered wrong once, they come back to the hint and the single retry, and cannot reset an attempt by refreshing.

## Stack
| Choice | Why | Docs |
|---|---|---|
| **React** with **TypeScript (strict)** | React is the learner's choice. TypeScript strict mode makes the domain and content contracts enforceable, which supports the clean-architecture value. *Derived recommendation: the learner can veto at review.* | https://react.dev · https://www.typescriptlang.org/docs/ |
| **Vite** | Standard, fast React build tool and dev server (`localhost:5173`). Outputs a static folder for deployment. | https://vite.dev/guide/ |
| **Plain CSS with design tokens** (CSS variables, CSS Modules per component) | Handicraft styling needs full control over borders, blend modes, and animation. No UI kit would fight it. | https://developer.mozilla.org/en-US/docs/Web/CSS |
| **Inline SVG + a small seeded-random helper** | Pixel sprites, the progress path, and map nodes, identical on every render. No game engine required. | https://developer.mozilla.org/en-US/docs/Web/SVG |
| **Zod** | Validates content files and saved progress at the boundaries. This matters especially for future AI-generated content, which can't be trusted to match the shape. *Derived recommendation.* | https://zod.dev |
| **Vitest + React Testing Library** | Unit tests for the rules, content, and persistence, plus one journey test of the UI. Vitest shares Vite's config. | https://vitest.dev · https://testing-library.com/docs/react-testing-library/intro/ |
| **ESLint + Prettier** | Consistency, plus enforcing the layer boundaries (see Components). | https://eslint.org · https://prettier.io |
| **GitHub Actions** | CI runs typecheck, lint, test, and build on every push. | https://docs.github.com/actions |
| **Fontsource** fonts | Self-hosted via npm, so there are no external font requests and the app works offline. | https://fontsource.org |
| **No router, no global-state library** | The view (challenge or results) is derived from session state. A `useReducer` plus context is enough for one session. | — |

**Unverified, to check at scaffold time (first build step):** current stable versions of React, Vite, Vitest, and Zod (pin exact versions in `package.json`), and the Fontsource package names and variable-font axes for the chosen fonts. This spec was written without a network lookup.

## Where It Runs and How Someone Tries It
- **Runtime:** the browser. Requirements: Node 20 or later and npm for development only.
- **Start locally:** `npm install`, then `npm run dev`, then open `http://localhost:5173`.
- **Production build:** `npm run build` outputs static files to `dist/`. `npm run preview` serves them locally.
- **Demo recording:** run `npm run dev`, then record a fresh session (clear site data first): a wrong first answer on challenge 1, hint, retry, a mid-session refresh to show restore, the transfer challenge, and the results screen.
- **Public link (the learner wants others to try it):** deploy `dist/` to a free static host. The default plan is **Vercel** (import the GitHub repo, framework preset "Vite", no environment variables). Netlify is an equivalent alternative. The final host is confirmed in `6-ship`. No API keys, no cost.
- **Required for submission regardless of the deployment:** a short demo video and a public GitHub repo. The deployed link does not replace either.

## Look and Feel
Revised direction: a pixel-art overworld. Source: `prd.md > Look and Feel`. The earlier hand-drawn paper-and-stitch blend is retired.

- **Lead material: pixel overworld.** Sky-blue ground, a brick-strip floor fixed to the bottom of the viewport, "?" blocks, and a HUD. Progress is a coin-yellow path with a node per challenge and a "you are here" marker. Take the grammar of classic platformer worlds, none of Nintendo's characters or assets. Sprites are original and drawn as small character grids rendered to SVG `<rect>`s with `shape-rendering: crispEdges`.
- **Panels:** cream (`--paper-raised`) cards with a 4px ink border and a hard 6px offset shadow (`--shadow-paper`). No blur anywhere.
- **Palette tokens:** sky `--paper`, cream `--paper-raised`, ink, coin yellow, brick and brick-dark, plus madder, indigo, ochre, moss for outcomes.
- **Typography:** Press Start 2P (`--font-pixel`, also `--font-label`) for headings, labels, HUD and buttons. Newsreader stays for body and answer text. Pixel type is never used for paragraphs.
- **Controls:** yellow pixel buttons with an inset shade and hard shadow that press down on hover and active. Answer options are chunky blocks with yellow lettered tiles, red when tried, green when correct.
- **Landing page:** one screen, no scroll (`height: 100dvh`, `overflow: hidden`). It is shown only when a learner has no saved progress. A pixel hero hops along levels 1-1 to 1-5 using stepped keyframes.
- **Technique:** stepped animation (`steps()`), disabled under `prefers-reduced-motion`.
- **Crisp underneath:** answer options, spacing, contrast, and touch targets stay rigorous.
- **Tone of copy:** warm, a little playful, never scolding. A wrong answer is "information".
- **Must not look like:** pixel-font body copy, blurry pixel pastiche, copied Nintendo assets, SaaS gradients, glassmorphism, pure white or black.

## Components
Layers and the dependency rule, enforced with ESLint `no-restricted-imports`:

```
ui ──▶ domain ◀── content (adapter)
 │        ▲  ◀── persistence (adapter)
 └────────┴── app (composition root wires everything)
```

- `domain/` imports nothing outside itself.
- `content/` and `persistence/` import only `domain/` types.
- `ui/` imports `domain/` and the **interfaces** of content and persistence, never their implementations.
- Only `app/` knows the concrete adapters.

### Domain: types and session rules
Implements `prd.md > Diagnose, hint, and retry`, `prd.md > Surprise challenge`, `prd.md > States and Boundaries`.
Pure TypeScript. `types.ts` defines Topic, Challenge, Option, AttemptRecord, ChallengeRecord, SessionState. `session.ts` is the reducer and selectors. Actions: `SUBMIT_ANSWER`, `ADVANCE`, `RESTART`. The current challenge's phase is **derived** from its record (`answering` → `hinted` → `resolved`), not stored separately. Rules encoded here:
- One answer per attempt; at most 2 attempts per challenge.
- Outcome: `first-try` (correct on attempt 1), `corrected` (correct on attempt 2), `revealed` (wrong twice).
- `ADVANCE` is only allowed once the current challenge is resolved. There are no skips.
- The last challenge resolving moves the session to `finished`.

### Domain: scoring and results
Implements `prd.md > Combined scoring and results screen`.
`scoring.ts` holds the weights as named constants (the learner-accepted table):

| Outcome | Challenges 1–4 | Transfer (5) |
|---|---|---|
| `first-try` | 15 | 40 |
| `corrected` | 8 | 20 |
| `revealed` | 0 | 0 |

Maximum 100. `results.ts` builds a `Results` object from the session records:
- **Initial accuracy:** first attempts correct out of attempts made (all five).
- **Retry outcomes:** how many retries were corrected vs. revealed.
- **Misconceptions addressed:** the list of misconception tags diagnosed from wrong first answers, each marked *Corrected* or *Revealed*.
- **Transfer performance:** the transfer challenge's outcome on its own line.
- **Score:** total, with each part's points shown next to it.

No placeholder numbers: with zero data, the results builder returns nothing and the results screen isn't reachable.

### Content: port, schema, and the k-fold topic
Implements `prd.md > Surprise challenge` and `prd.md > States and Boundaries` ("Content source").
- `ContentProvider.ts`: `getTopic(id): Promise<Topic>` (async on purpose, so an AI-backed provider can replace the static one without changing callers).
- `schema.ts`: Zod schema for Topic. Validation rules beyond shape: 3–4 options per challenge; exactly one correct option; every wrong option has a `misconception` (tag + a short "why this was tempting" text); exactly 5 challenges; the last and only the last is `isTransfer`; the transfer challenge shares a `concept` tag with earlier challenges. Content that fails validation fails loudly in tests and at boot.
- `staticContentProvider.ts`: serves the bundled topic through the same schema.
- `topics/kfold-validation.ts`: the single PoC topic, **"Model validation"**, 5 challenges:
  1. Pick the split (the surprise: stratified K-fold vs. random split vs. evaluating on training data)
  2. Find the leak (debug a workflow)
  3. Question the metric (read a score on imbalanced data)
  4. Protect the test set (debug a workflow)
  5. Same idea, new case (transfer, different surface details)

  Each challenge: `id`, `title`, `kind`, `scenario`, `image {src, alt}`, `options[]` (with `misconception` on the wrong ones), `correctOptionId`, `hint`, `reveal {explanation, whyOthersDontFit}`, `concept`, `isTransfer`. Topic carries a `contentVersion`.

Doc: https://zod.dev

### Persistence: port and localStorage adapter
Implements `prd.md > Saved progress`.
- `ProgressRepository.ts`: `load(): SessionState | null`, `save(state)`, `clear()`.
- `localStorageProgressRepository.ts`: key `proofpath:session:v1`. Stores `{schemaVersion, contentVersion, session}`. On load it validates with Zod. If the JSON is corrupt, the schema or content version differs, or the stored challenge ids don't match current content, it returns `null` (fresh start). Every call is wrapped in try/catch.
- `memoryProgressRepository.ts`: in-memory implementation used by tests and as the fallback when `localStorage` is unavailable.

### UI: session provider
Implements `prd.md > Saved progress`, `prd.md > States and Boundaries`.
`ui/state/SessionProvider.tsx` holds `useReducer(sessionReducer)`, injects the content topic and repository from `app/`, and saves after every state change. `useSession()` exposes state and actions to screens. Contains no game rules.

### UI: Challenge screen
Implements `prd.md > Screens and Layout` ("Challenge screen"), `prd.md > Surprise challenge`, `prd.md > Diagnose, hint, and retry`.
Composition of `ChallengeCard` (eyebrow, headline, scenario, illustration), `OptionList` (radio group, lettered A–D, keyboard A–D to select and Enter to submit), `FeedbackPanel` (first-try achievement, misconception diagnosis + hint, reveal) and the "Check answer" / "Continue" button. Shown beside or above the map path. Accessibility: semantic radio group, `aria-live="polite"` for feedback, focus moves to the feedback and then to "Continue".

### UI: Map path (progress)
Implements `prd.md > Game-feel progress path`.
`MapPath` renders one SVG: a wobbly path connecting 5 nodes (fixed layout array), small landmark illustrations, a "you are here" marker. Node states: *done* (stamped in moss for first-try, ochre for corrected, madder for revealed), *current*, *upcoming* (faded). It is **visual only**: not clickable, no gates, no lives, no score economy. On narrow screens it becomes a horizontal strip above the card.

### UI: Results screen
Implements `prd.md > Combined scoring and results screen`, `prd.md > Screens and Layout` ("Results screen").
Reads `Results` from the domain and shows the score with its parts, the misconceptions list (Corrected/Revealed), retry outcomes, and the transfer line, each backed by the learner's own answers. A "Start over" button dispatches `RESTART` (clears saved progress). *Derived implementation detail: the PRD doesn't name a replay control, but a demo needs a way to play again.*

### UI: Pixel kit
Implements `prd.md > Look and Feel`.
`ui/handcraft/` (kept from the earlier direction; reused for cards): `seededRandom.ts` (deterministic PRNG), `wobblePath.ts` (bounded-irregularity paths, used by the map), `PaperCard.tsx` (cream panel; its stitch border is hidden by CSS), `HandLetteredText.tsx` (plain pixel headings, per-letter variation disabled). `ui/screens/LandingScreen.tsx` holds the pixel sprites and the no-scroll landing page. `ui/theme/`: `tokens.css` (palette, spacing, type scale), `global.css`, `fonts.ts`. Rule: any irregularity comes from a seed, never `Math.random()` at render time.

### App: composition root and error boundary
`app/compositionRoot.ts` is the only place that picks `staticContentProvider` and `localStorageProgressRepository` (falling back to the in-memory repository if `localStorage` throws). `App.tsx` picks the screen from `session.status`. `ErrorBoundary.tsx` shows a plain, on-brand message instead of a white screen.

## Data Model
Content is static and read-only. The only mutable data is the session.

```ts
type Outcome = 'first-try' | 'corrected' | 'revealed';

interface Attempt { optionId: string; correct: boolean }

interface ChallengeRecord {
  challengeId: string;
  attempts: Attempt[];        // length 1 or 2
  outcome: Outcome | null;    // null until resolved
}

interface SessionState {
  topicId: string;
  contentVersion: string;
  currentIndex: number;       // 0–4
  records: ChallengeRecord[]; // one per challenge reached
  status: 'in-progress' | 'finished';
}
```

| Data | Where it lives | How it's updated | When the learner leaves and returns |
|---|---|---|---|
| Challenges (scenarios, options, hints, reveals) | Bundled content files | Never at runtime | Same content every time |
| Session (`SessionState`) | React state while open; mirrored to `localStorage` key `proofpath:session:v1` | Reducer actions; saved after every attempt and every advance | Loaded at startup: last challenge and completed progress restored, including a pending hint and retry |
| Current phase (answering / hinted / resolved) | Not stored; derived from the current record's attempts | Follows from attempts | Re-derived on load |
| Selected-but-unsubmitted option | Component-local state only | Click or key | Not restored (not an attempt) |
| Score and results | Not stored; derived from the records | Recomputed on demand | Always matches what the learner did |
| First-time visit | No stored key | — | Starts at challenge 1 |

## File Structure
The project root is the repo root. `devpost/` is the Devpost learning workspace.

```
.
├── src/
│   ├── main.tsx                         # entry; mounts <App />
│   ├── app/
│   │   ├── App.tsx                      # picks screen from session status
│   │   ├── compositionRoot.ts           # the ONLY place concrete adapters are chosen
│   │   └── ErrorBoundary.tsx
│   ├── domain/                          # pure TS, no React, no I/O
│   │   ├── types.ts                     # Topic, Challenge, Option, ChallengeRecord, SessionState
│   │   ├── session.ts                   # reducer + selectors (phase, outcome rules)
│   │   ├── scoring.ts                   # weights table + score calculation
│   │   ├── results.ts                   # builds Results from records
│   │   └── *.test.ts
│   ├── content/                         # adapter: where challenges come from
│   │   ├── ContentProvider.ts           # port (interface)
│   │   ├── schema.ts                    # Zod schema + content rules
│   │   ├── staticContentProvider.ts
│   │   ├── topics/
│   │   │   └── kfold-validation.ts      # the 5 challenges
│   │   └── content.test.ts              # validates the topic against the schema
│   ├── persistence/                     # adapter: where progress is saved
│   │   ├── ProgressRepository.ts        # port (interface)
│   │   ├── localStorageProgressRepository.ts
│   │   ├── memoryProgressRepository.ts  # tests + unavailable-storage fallback
│   │   └── *.test.ts
│   └── ui/
│       ├── state/
│       │   ├── SessionProvider.tsx      # reducer + save-on-change
│       │   └── useSession.ts
│       ├── screens/
│       │   ├── ChallengeScreen/
│       │   └── ResultsScreen/
│       ├── components/                  # ChallengeCard, OptionList, FeedbackPanel, MapPath
│       ├── handcraft/                   # seededRandom, wobblePath, PaperCard (stitch hidden), HandLetteredText, StitchBorder
│       ├── theme/                       # tokens.css, global.css, fonts.ts
│       └── journey.test.tsx             # one full-journey UI test
├── public/
│   └── illustrations/                   # hand-authored SVG per challenge
├── .github/workflows/ci.yml             # typecheck, lint, test, build
├── devpost/                             # Devpost learning workspace
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js                     # includes the layer-boundary rules
└── README.md                            # how to run, how to try it
```

## External Services and Dependencies
No runtime external services. No API keys. No cost.

| Dependency | Use | Docs |
|---|---|---|
| React, React DOM | UI | https://react.dev |
| Vite | Dev server and build | https://vite.dev/guide/ |
| TypeScript | Language | https://www.typescriptlang.org/docs/ |
| Zod | Content and saved-progress validation | https://zod.dev |
| Fontsource (Press Start 2P, Newsreader) | Self-hosted fonts | https://fontsource.org |
| Vitest, Testing Library | Tests | https://vitest.dev · https://testing-library.com |
| ESLint, Prettier | Lint and format | https://eslint.org · https://prettier.io |
| Browser `localStorage` | Saved progress | https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage |
| GitHub Actions | CI | https://docs.github.com/actions |
| Vercel (or Netlify), optional | Public static hosting, free tier | https://vercel.com/docs · https://docs.netlify.com |

## Important Failure Modes
- **`localStorage` is unavailable, full, or blocked** (private window, blocked site data) → the app falls back to the in-memory repository and still works. A small on-brand note says "Progress can't be saved in this browser" and restore won't apply.
- **Saved progress is corrupt, from an older shape, or doesn't match current content** → validation rejects it and the learner starts fresh at challenge 1. No crash.
- **An illustration or font fails to load** → the image shows its alt text inside the panel, and fonts fall back to a system monospace and serif. The layout still works.
- **Content that breaks its own rules** (two correct options, missing misconception) → caught by the content test and the schema at boot; it can't ship silently.
- **Any unexpected render error** → the error boundary shows a plain message with a "Start over" button, not a white screen.

## What Was Simplified and Why
- **One topic, five challenges, app-chosen** instead of topic and level pick and many problem sets — `prd.md > Deferred From the POC`. The content format supports adding topics later.
- **No backend, accounts, or cross-device sync; `localStorage` only** — the PRD defers accounts, and the saved-progress behaviour is fully proven locally. The fuller version would need a small API and a database behind the same `ProgressRepository` port.
- **Hardcoded content instead of live AI generation** — `scope.md > Explicitly Cut`. The `ContentProvider` port plus Zod validation is the seam where a generator would plug in.
- **Map path is visual only** (non-clickable nodes, no lives, no unlock gates) — `prd.md > Game-feel progress path`.
- **No router or state library** — one session with two views doesn't need them.
- **Illustrations are hand-authored static SVGs**, not generated — keeps the look controlled and deterministic.
- **No end-to-end browser test suite.** One RTL journey test covers the flow; Playwright is a later addition.

## Decisions and Open Issues
**Learner decisions**
- **React.** Chosen by the learner.
- **Public link wanted** ("others should also try"), so the app is a static deployment. Host (default Vercel) confirmed in `6-ship`.
- **One topic, 5 challenges** (the learner changed the recommended 4 to 5 after sharing their reference screenshot, whose titles are used for challenges 1–4, plus one transfer). The last is the transfer challenge. Resolves `prd.md > Open Questions` (session length).
- **Progress is the pixel level path** from the PRD, not the screenshot's numbered tiles.
- **Scoring weights accepted** (table above). Tradeoff accepted: one transfer miss costs a lot. Resolves `prd.md > Open Questions` (scoring).
- **Visual direction changed to a pixel-art overworld** (replacing the paper and stitch blend). Resolves `prd.md > Open Questions` (primary material).
- **Standard software practice, without overriding the learner's values** (clean architecture, scalability, maintainability). Applied as ports-and-adapters layering with enforced boundaries, strict TypeScript, tests, lint, and CI.

**Derived implementation details** (follow from the above; the learner can change them at review): TypeScript strict, Zod, Vitest + RTL, ESLint/Prettier, GitHub Actions CI, no router or state library, localStorage key and versioning scheme, "Start over" on the results screen, keyboard A–D + Enter, font choices (Press Start 2P and Newsreader).

**The learner's uncertainty:** none identified. When asked which part they were least sure about, the learner asked for standard practice that doesn't override their values. No new tool or exercise was added.

**Open issues**
- **Challenge content authoring.** The wording of the five challenges, every wrong-option misconception, hint, and reveal is written in `5-build`. The learner must review the ML correctness and the transfer challenge's genuinely different surface details. This is the highest-risk item for the kernel; the spec only guarantees the shape.
- **Font specifics.** Press Start 2P is the pixel face; check it stays crisp at the sizes used.
- **Library versions.** Pin current stable versions at scaffold time.
- **Illustration craft.** The five SVG illustrations are ink-style diagrams and still need to be redrawn in the pixel palette. Fallback: keep the ink diagrams on the cream panel.
- **Cross-device progress** is not needed for the PoC (carried from `prd.md > Open Questions`).
