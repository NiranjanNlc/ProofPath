export interface Misconception {
  tag: string;
  /** Why this wrong option was tempting. Shown after a wrong attempt. */
  diagnosis: string;
}

export interface ChallengeOption {
  id: string;
  text: string;
  /** Present on every wrong option, absent on the correct one. */
  misconception?: Misconception;
}

export interface Reveal {
  explanation: string;
  /** Why each wrong option doesn't fit, keyed by option id. */
  whyOthersDontFit: Record<string, string>;
}

export interface Challenge {
  id: string;
  title: string;
  kind: string;
  concept: string;
  scenario: string;
  headline: string;
  image: { src: string; alt: string };
  options: ChallengeOption[];
  correctOptionId: string;
  hint: string;
  reveal: Reveal;
  isTransfer: boolean;
}

export interface Topic {
  id: string;
  title: string;
  contentVersion: string;
  challenges: Challenge[];
}

export type Outcome = 'first-try' | 'corrected' | 'revealed';

export interface Attempt {
  optionId: string;
  correct: boolean;
}

export interface ChallengeRecord {
  challengeId: string;
  attempts: Attempt[];
  outcome: Outcome | null;
}

export interface SessionState {
  topicId: string;
  contentVersion: string;
  currentIndex: number;
  records: ChallengeRecord[];
  status: 'in-progress' | 'finished';
}

export type Phase = 'answering' | 'hinted' | 'resolved';
