# ProofPath

A game-feel learning app for developers stuck in tutorial hell. It doesn't explain a concept and hope it stuck. It puts a tricky scenario in front of you first, diagnoses _why_ a wrong answer was tempting, and then tests whether you can apply the corrected idea to a genuinely new problem.

**The loop:** Surprise → Diagnose → Transfer → Reflect.

The proof-of-concept topic is model validation (k-fold vs. stratified k-fold, data leakage, imbalanced metrics, test-set hygiene): five challenges, the last one a transfer challenge with different surface details.

## Live demo

- **Play it:** <https://proof-path.netlify.app/>
- **Watch the demo video:** <https://youtu.be/dqld42gN2Xw>

## Try it

Requires Node 22 or later.

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Pick an answer (click, or press `A`–`C` then `Enter`).

What to try:

1. Get challenge 1 wrong. Read why the option was tempting, use the one hint, and retry.
2. Get it wrong twice to see the reveal with an explanation of every option.
3. Close the tab mid-challenge and reopen it. You land exactly where you left off.
4. Finish all five to see an evidence-based score out of 100 and the misconceptions you addressed.

To start fresh, use **Start over** on the results screen, or clear the site's data.

## Scoring

| Outcome                                  | Challenges 1–4 | Transfer (5) |
| ---------------------------------------- | -------------- | ------------ |
| Right on first try                       | 15             | 40           |
| Right after hint and retry ("corrected") | 8              | 20           |
| Revealed after two misses                | 0              | 0            |

Maximum 100. The results screen shows each part next to the score, and every figure is derived from what you actually answered.

## How it's built

React + TypeScript (strict) + Vite. No backend: progress is kept in the browser's `localStorage`.

Clean-architecture layering, enforced by ESLint import rules:

```
src/
├── domain/        pure TypeScript rules: session reducer, scoring, results (no React, no I/O)
├── content/       where challenges come from: a ContentProvider port + the bundled topic + Zod schema
├── persistence/   where progress is saved: a ProgressRepository port + localStorage / in-memory adapters
├── ui/            React screens and components, the landing page, the pixel progress path, the pixel kit
└── app/           composition root: the only place concrete adapters are chosen
```

- **Swap the content source.** Implement `ContentProvider` (for example, one that generates challenges with an AI model) and change one line in `src/app/compositionRoot.tsx`. Content is validated with the same Zod schema either way.
- **Swap the storage.** Implement `ProgressRepository` (for example, cloud saving) the same way.
- **Add a topic.** Add a file under `src/content/topics/` that satisfies the schema in `src/content/schema.ts`.

The look is a pixel-art overworld: Press Start 2P headings, sky and brick backdrop, cream panels with hard shadows, and original pixel sprites drawn from character grids (`src/ui/screens/LandingScreen.tsx`, `src/ui/theme/`). Animation is stepped and switched off for reduced motion.

## Scripts

| Command                              | What it does                                |
| ------------------------------------ | ------------------------------------------- |
| `npm run dev`                        | Dev server at `localhost:5173`              |
| `npm run build`                      | Typecheck and build static files to `dist/` |
| `npm run preview`                    | Serve the production build locally          |
| `npm test`                           | Run the unit and journey tests              |
| `npm run typecheck` / `npm run lint` | Type and lint checks (also run in CI)       |

## Deploying

It's a static site: build with `npm run build` and serve `dist/`. On Vercel or Netlify, import the repository with the Vite preset (build command `npm run build`, output directory `dist`). No environment variables or API keys are needed.

## License

[MIT](LICENSE)
