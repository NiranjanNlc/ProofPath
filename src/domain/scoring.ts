import type { Outcome } from './types';

/** Points per outcome (prd.md > Combined scoring and results screen). Maximum total: 100. */
export const REGULAR_POINTS: Record<Outcome, number> = {
  'first-try': 15,
  corrected: 8,
  revealed: 0,
};
export const TRANSFER_POINTS: Record<Outcome, number> = {
  'first-try': 40,
  corrected: 20,
  revealed: 0,
};

export const pointsFor = (outcome: Outcome, isTransfer: boolean): number =>
  (isTransfer ? TRANSFER_POINTS : REGULAR_POINTS)[outcome];

export const maxPointsFor = (isTransfer: boolean): number => pointsFor('first-try', isTransfer);

/** Maximum score for a session with the given number of regular challenges plus one transfer. */
export const MAX_SCORE = (regularChallenges: number): number =>
  regularChallenges * maxPointsFor(false) + maxPointsFor(true);
