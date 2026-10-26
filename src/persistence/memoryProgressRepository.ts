import type { SessionState } from '../domain/types';
import type { ProgressRepository } from './ProgressRepository';

/** Keeps progress for the life of the page only. Used by tests and when storage is unavailable. */
export class MemoryProgressRepository implements ProgressRepository {
  readonly durable = false;
  private state: SessionState | null = null;

  load() {
    return this.state;
  }

  save(state: SessionState) {
    this.state = state;
    return false;
  }

  clear() {
    this.state = null;
  }
}
