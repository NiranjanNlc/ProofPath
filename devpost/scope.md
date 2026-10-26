---
doc: scope
status: approved
---

# Tutorial Hell Rescuer (working title)

A game-feel learning app that doesn't just teach a developer a concept. It finds out *why* they're confused and tests whether they can apply the corrected understanding to a new problem.

## The Unique Kernel
Don't compete on explaining concepts. Compete on **detecting why a learner is confused** and **testing whether they can apply the corrected understanding to a new problem**. A concept counts as gained when the learner can quickly translate it into where to use it. Example: they know that a rare "false" case means stratified k-fold is necessary, not plain k-fold.

## Who It's For
Developers stuck in tutorial hell: they can recite a definition and a use case, but in a messy real situation can't tell which tool applies (k-fold vs. stratified k-fold). The primary user is the learner-builder, and other developers should be able to use it too.

## The Core Loop
1. Learner picks a topic and experience level.
2. A concise lesson with a concrete example.
3. Three diagnostic questions: a prediction, a why-question, and an application task (scenario text, relevant picture, multiple choices).
4. On a miss, feedback diagnoses the specific reasoning error: why the wrong option was tempting, what the right answer is, and why the others don't fit.
5. Retry with a new question that tests the corrected understanding.
6. A transparent mastery report with the session score.

## Inspiration & Identity
- Duolingo's teaching mechanism (short lessons, instant feedback) with Mario-style game feel: levels and a visible progression path.
- Every screen should feel part of a game, not a quiz application.
- Design should read as hand-crafted, not generic. Gamification and behavioral economics inform the feel.

## Why This Matters to the Learner
"We all, especially developers, are stuck in tutorial hell." They want learning that is verified and usable when needed. It is also their chance to get fully comfortable with spec-driven development, building something distinctive with clean, scalable, maintainable architecture.

## What "Working" Looks Like
A cohesive landing page, a guided learning session, interactive questions, useful feedback, and a finished mastery report, all with a game feel. The "oh, that's cool" beat: a learner picks the wrong fold strategy, and the app explains the temptation behind that choice. Then a fresh problem shows they now get it.

## The POC Boundary
- One or two hardcoded topics (e.g. k-fold vs. stratified k-fold).
- The full flow: landing page, topic and level pick, lesson, three diagnostic questions, misconception feedback, retry question, mastery report.
- Mario-like levels and progression as a **visual layer only**. Real game mechanics are not required.
- Content is separated from the app so hardcoded topics can be replaced by live AI generation later without rewriting the app.
- Clean architecture, kept small enough for a proof of concept.

## Later
- Live AI-generated lessons and questions for any topic the learner types.
- Real Mario-style game mechanics and progression.
- Other developers' accounts, saved history, and spaced repetition over time.

## Explicitly Cut
- Live AI generation: deferred. Hardcoded topics prove the diagnosis-and-transfer kernel without API setup or generation quality risk.
- Deep game mechanics (lives, scoring economy, level unlocks): visual layer is enough to show the game feel.
- Competing on lesson content or breadth of topics: the kernel is diagnosis, not explanation.
