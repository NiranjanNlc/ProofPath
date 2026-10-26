import type { SessionState } from '../domain/types';

/** Port: where the learner's session is kept between visits. */
export interface ProgressRepository {
  /** False when progress cannot survive a reload (e.g. storage blocked). */
  readonly durable: boolean;
  /** Returns the saved session, or null when nothing usable is stored. Never throws. */
  load(): SessionState | null;
  /** Returns true if the state was stored durably. Never throws. */
  save(state: SessionState): boolean;
  clear(): void;
}
