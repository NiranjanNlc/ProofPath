import { describe, expect, it } from 'vitest';
import { fixtureTopic as topic } from './fixtures';
import {
  createSession,
  currentRecord,
  phaseOf,
  sessionReducer,
  type SessionAction,
} from './session';

const run = (...actions: SessionAction[]) =>
  actions.reduce((s, a) => sessionReducer(s, a, topic), createSession(topic));

const answer = (optionId: string): SessionAction => ({ type: 'SUBMIT_ANSWER', optionId });
const first = topic.challenges[0]!;
const wrong = first.options.find((o) => o.id !== first.correctOptionId)!.id;
const right = first.correctOptionId;

describe('session reducer', () => {
  it('starts at the first challenge with nothing answered', () => {
    const s = createSession(topic);
    expect(s.currentIndex).toBe(0);
    expect(phaseOf(currentRecord(s, topic))).toBe('answering');
  });

  it('records a correct first attempt as first-try', () => {
    const record = currentRecord(run(answer(right)), topic);
    expect(record.outcome).toBe('first-try');
    expect(phaseOf(record)).toBe('resolved');
  });

  it('after one wrong answer keeps the challenge open for one retry', () => {
    const record = currentRecord(run(answer(wrong)), topic);
    expect(record.outcome).toBeNull();
    expect(phaseOf(record)).toBe('hinted');
  });

  it('records a correct retry as corrected, not first-try', () => {
    const record = currentRecord(run(answer(wrong), answer(right)), topic);
    expect(record.outcome).toBe('corrected');
    expect(record.attempts.map((a) => a.correct)).toEqual([false, true]);
  });

  it('reveals after a second wrong answer', () => {
    const record = currentRecord(run(answer(wrong), answer(wrong)), topic);
    expect(record.outcome).toBe('revealed');
  });

  it('allows no more than two attempts', () => {
    const s = run(answer(wrong), answer(wrong), answer(right));
    expect(currentRecord(s, topic).attempts).toHaveLength(2);
    expect(currentRecord(s, topic).outcome).toBe('revealed');
  });

  it('ignores unknown options', () => {
    expect(currentRecord(run(answer('zzz')), topic).attempts).toHaveLength(0);
  });

  it('refuses to advance until the challenge is resolved', () => {
    const s = run({ type: 'ADVANCE' });
    expect(s.status).toBe('in-progress');
    expect(s.currentIndex).toBe(0);
  });

  it('moves to the next challenge once resolved', () => {
    const s = run(answer(right), { type: 'ADVANCE' });
    expect(s.currentIndex).toBe(1);
    expect(phaseOf(currentRecord(s, topic))).toBe('answering');
  });

  it('finishes after the last challenge is resolved and advanced', () => {
    const s = run(answer(right), { type: 'ADVANCE' }, answer(wrong), answer(right), {
      type: 'ADVANCE',
    });
    expect(s.status).toBe('finished');
  });

  it('restarts to a fresh session', () => {
    const s = run(answer(right), { type: 'ADVANCE' }, { type: 'RESTART' });
    expect(s).toEqual(createSession(topic));
  });
});
