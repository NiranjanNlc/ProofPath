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
