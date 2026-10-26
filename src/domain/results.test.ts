import { describe, expect, it } from 'vitest';
import { fixtureTopic as topic } from './fixtures';
import { buildResults } from './results';
import { createSession, sessionReducer, type SessionAction } from './session';
import { MAX_SCORE } from './scoring';

const answer = (optionId: string): SessionAction => ({ type: 'SUBMIT_ANSWER', optionId });
const next: SessionAction = { type: 'ADVANCE' };
const play = (...actions: SessionAction[]) =>
  actions.reduce((s, a) => sessionReducer(s, a, topic), createSession(topic));

describe('buildResults', () => {
  it('is null until every challenge is resolved', () => {
    expect(buildResults(createSession(topic), topic)).toBeNull();
    expect(buildResults(play(answer('c'), next), topic)).toBeNull();
  });

  it('scores a perfect session as the maximum', () => {
    const r = buildResults(play(answer('c'), next, answer('c'), next), topic)!;
    expect(r.score).toBe(55);
    expect(r.maxScore).toBe(55);
    expect(r.initialAccuracy).toEqual({ correct: 2, total: 2 });
    expect(r.misconceptions).toEqual([]);
  });

  it('weights the transfer challenge more heavily', () => {
    const r = buildResults(play(answer('c'), next, answer('a'), answer('c'), next), topic)!;
    expect(r.challenges.map((c) => c.points)).toEqual([15, 20]);
    expect(r.transfer.outcome).toBe('corrected');
    expect(r.score).toBe(35);
  });

  it('scores a fully missed session as zero', () => {
    const r = buildResults(
      play(answer('a'), answer('b'), next, answer('a'), answer('b'), next),
      topic,
    )!;
    expect(r.score).toBe(0);
    expect(r.retries).toEqual({ corrected: 0, revealed: 2 });
    expect(r.misconceptions.map((m) => m.status)).toEqual(['revealed', 'revealed']);
  });

  it('lists the diagnosed misconception with its status', () => {
    const r = buildResults(play(answer('a'), answer('c'), next, answer('c'), next), topic)!;
    expect(r.misconceptions).toEqual([
      {
        challengeId: 'one',
        challengeTitle: 'one',
        tag: 'one-a',
        diagnosis: 'a is tempting',
        status: 'corrected',
      },
    ]);
    expect(r.initialAccuracy).toEqual({ correct: 1, total: 2 });
    expect(r.score).toBe(8 + 40);
  });

  it('keeps the maximum at 100 for the real weights', () => {
    expect(MAX_SCORE(4)).toBe(100);
  });
});
