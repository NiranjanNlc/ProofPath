import type { Challenge, ChallengeRecord, Outcome, Phase, SessionState, Topic } from './types';

export const MAX_ATTEMPTS = 2;

export type SessionAction =
  { type: 'SUBMIT_ANSWER'; optionId: string } | { type: 'ADVANCE' } | { type: 'RESTART' };

export function createSession(topic: Topic): SessionState {
  return {
    topicId: topic.id,
    contentVersion: topic.contentVersion,
    currentIndex: 0,
    records: [],
    status: 'in-progress',
  };
}

export function currentRecord(session: SessionState, topic: Topic): ChallengeRecord {
  const challenge = currentChallenge(session, topic);
  return (
    session.records.find((r) => r.challengeId === challenge.id) ?? {
      challengeId: challenge.id,
      attempts: [],
      outcome: null,
    }
  );
}

export function currentChallenge(session: SessionState, topic: Topic): Challenge {
  const challenge = topic.challenges[session.currentIndex];
  if (!challenge) throw new Error(`No challenge at index ${session.currentIndex}`);
  return challenge;
}

/** Phase is derived from the record, never stored. */
export function phaseOf(record: ChallengeRecord): Phase {
  if (record.outcome) return 'resolved';
  return record.attempts.length === 0 ? 'answering' : 'hinted';
}

function outcomeFor(attempts: ChallengeRecord['attempts']): Outcome | null {
  const [first, second] = attempts;
  if (first?.correct) return 'first-try';
  if (second) return second.correct ? 'corrected' : 'revealed';
  return null;
}

export function isLastChallenge(session: SessionState, topic: Topic): boolean {
  return session.currentIndex === topic.challenges.length - 1;
}

export function sessionReducer(
  session: SessionState,
  action: SessionAction,
  topic: Topic,
): SessionState {
  switch (action.type) {
    case 'SUBMIT_ANSWER': {
      if (session.status === 'finished') return session;
      const challenge = currentChallenge(session, topic);
      const record = currentRecord(session, topic);
      if (record.outcome || record.attempts.length >= MAX_ATTEMPTS) return session;
      if (!challenge.options.some((o) => o.id === action.optionId)) return session;

      const attempts = [
        ...record.attempts,
        { optionId: action.optionId, correct: action.optionId === challenge.correctOptionId },
      ];
      const next: ChallengeRecord = { ...record, attempts, outcome: outcomeFor(attempts) };
      const others = session.records.filter((r) => r.challengeId !== challenge.id);
      return { ...session, records: [...others, next] };
    }
    case 'ADVANCE': {
      if (session.status === 'finished') return session;
      if (phaseOf(currentRecord(session, topic)) !== 'resolved') return session;
      if (isLastChallenge(session, topic)) return { ...session, status: 'finished' };
      return { ...session, currentIndex: session.currentIndex + 1 };
    }
    case 'RESTART':
      return createSession(topic);
  }
}

/**
 * Accepts a saved session only if it still makes sense for the current content. Anything
 * inconsistent (old content version, unknown ids, impossible attempts) is rejected and the
 * caller starts fresh. Never trusts stored outcomes: they must match the stored attempts.
 */
export function restoreSession(saved: SessionState | null, topic: Topic): SessionState | null {
  if (!saved) return null;
  if (saved.topicId !== topic.id || saved.contentVersion !== topic.contentVersion) return null;
  if (saved.currentIndex < 0 || saved.currentIndex >= topic.challenges.length) return null;

  const seen = new Set<string>();
  for (const record of saved.records) {
    const challengeIndex = topic.challenges.findIndex((c) => c.id === record.challengeId);
    const challenge = topic.challenges[challengeIndex];
    if (!challenge || seen.has(challenge.id) || challengeIndex > saved.currentIndex) return null;
    seen.add(challenge.id);

    if (record.attempts.length > MAX_ATTEMPTS) return null;
    const validAttempts = record.attempts.every(
      (a) =>
        challenge.options.some((o) => o.id === a.optionId) &&
        a.correct === (a.optionId === challenge.correctOptionId),
    );
    if (!validAttempts) return null;
    if (record.outcome !== outcomeFor(record.attempts)) return null;
    // A challenge before the current one must be finished.
    if (challengeIndex < saved.currentIndex && !record.outcome) return null;
  }
  for (let i = 0; i < saved.currentIndex; i++) {
    if (!seen.has(topic.challenges[i]!.id)) return null;
  }

  if (saved.status === 'finished') {
    const allResolved = topic.challenges.every(
      (c) => saved.records.find((r) => r.challengeId === c.id)?.outcome,
    );
    if (!allResolved || saved.currentIndex !== topic.challenges.length - 1) return null;
  }
  return saved;
}
