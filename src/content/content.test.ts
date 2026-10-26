import { describe, expect, it } from 'vitest';
import { createSession, sessionReducer, type SessionAction } from '../domain/session';
import { parseTopic } from './schema';
import { staticContentProvider } from './staticContentProvider';
import { kfoldValidation } from './topics/kfold-validation';

describe('bundled content', () => {
  it('passes the content schema', async () => {
    await expect(staticContentProvider.getTopic(kfoldValidation.id)).resolves.toMatchObject({
      id: kfoldValidation.id,
    });
  });

  it('rejects an unknown topic', async () => {
    await expect(staticContentProvider.getTopic('nope')).rejects.toThrow();
  });

  it('rejects a wrong option without a misconception', () => {
    const broken = structuredClone(kfoldValidation);
    delete broken.challenges[0]!.options[0]!.misconception;
    expect(() => parseTopic(broken)).toThrow(/lacks a misconception/);
  });

  it('rejects a correct option that carries a misconception', () => {
    const broken = structuredClone(kfoldValidation);
    broken.challenges[0]!.options[2]!.misconception = { tag: 'x', diagnosis: 'y' };
    expect(() => parseTopic(broken)).toThrow(/correct option has a misconception/);
  });

  it('rejects a correctOptionId that is not an option', () => {
    const broken = structuredClone(kfoldValidation);
    broken.challenges[0]!.correctOptionId = 'missing';
    expect(() => parseTopic(broken)).toThrow(/not an option/);
  });

  it('has five challenges, and only the last is the transfer challenge', () => {
    const flags = kfoldValidation.challenges.map((c) => c.isTransfer);
    expect(flags).toEqual([false, false, false, false, true]);
  });

  it('rejects a topic where the transfer challenge is not last', () => {
    const broken = structuredClone(kfoldValidation);
    broken.challenges[0]!.isTransfer = true;
    expect(() => parseTopic(broken)).toThrow(/only the last challenge is the transfer/);
  });

  it('rejects a transfer challenge sharing no concept with earlier ones', () => {
    const broken = structuredClone(kfoldValidation);
    broken.challenges[4]!.concept = 'unrelated';
    expect(() => parseTopic(broken)).toThrow(/share a concept tag/);
  });

  it('rejects the wrong number of challenges', () => {
    const broken = structuredClone(kfoldValidation);
    broken.challenges.splice(1, 1);
    expect(() => parseTopic(broken)).toThrow(/Expected 5 challenges/);
  });

  it('can be played end to end to a finished session', () => {
    let session = createSession(kfoldValidation);
    for (const challenge of kfoldValidation.challenges) {
      const answer: SessionAction = { type: 'SUBMIT_ANSWER', optionId: challenge.correctOptionId };
      session = sessionReducer(session, answer, kfoldValidation);
      session = sessionReducer(session, { type: 'ADVANCE' }, kfoldValidation);
    }
    expect(session.status).toBe('finished');
    expect(session.records.every((r) => r.outcome === 'first-try')).toBe(true);
  });
});
