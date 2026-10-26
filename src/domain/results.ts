import { maxPointsFor, pointsFor } from './scoring';
import type { Outcome, SessionState, Topic } from './types';

export interface ChallengeResult {
  challengeId: string;
  title: string;
  isTransfer: boolean;
  outcome: Outcome;
  points: number;
  maxPoints: number;
}

export interface MisconceptionResult {
  challengeId: string;
  challengeTitle: string;
  tag: string;
  diagnosis: string;
  status: 'corrected' | 'revealed';
}

export interface Results {
  score: number;
  maxScore: number;
  challenges: ChallengeResult[];
  initialAccuracy: { correct: number; total: number };
  retries: { corrected: number; revealed: number };
  misconceptions: MisconceptionResult[];
  transfer: ChallengeResult;
}

/**
 * Everything is derived from what the learner actually did. Returns null until every
 * challenge is resolved, so no placeholder numbers can ever be shown.
 */
export function buildResults(session: SessionState, topic: Topic): Results | null {
  const challenges: ChallengeResult[] = [];
  const misconceptions: MisconceptionResult[] = [];
  let correct = 0;
  const retries = { corrected: 0, revealed: 0 };

  for (const challenge of topic.challenges) {
    const record = session.records.find((r) => r.challengeId === challenge.id);
    if (!record || !record.outcome) return null;

    challenges.push({
      challengeId: challenge.id,
      title: challenge.title,
      isTransfer: challenge.isTransfer,
      outcome: record.outcome,
      points: pointsFor(record.outcome, challenge.isTransfer),
      maxPoints: maxPointsFor(challenge.isTransfer),
    });

    if (record.outcome === 'first-try') {
      correct += 1;
      continue;
    }
    retries[record.outcome] += 1;

    const firstWrong = challenge.options.find((o) => o.id === record.attempts[0]?.optionId);
    if (firstWrong?.misconception) {
      misconceptions.push({
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        tag: firstWrong.misconception.tag,
        diagnosis: firstWrong.misconception.diagnosis,
        status: record.outcome,
      });
    }
  }

  const transfer = challenges.find((c) => c.isTransfer);
  if (!transfer) return null;

  return {
    score: challenges.reduce((sum, c) => sum + c.points, 0),
    maxScore: challenges.reduce((sum, c) => sum + c.maxPoints, 0),
    challenges,
    initialAccuracy: { correct, total: challenges.length },
    retries,
    misconceptions,
    transfer,
  };
}
