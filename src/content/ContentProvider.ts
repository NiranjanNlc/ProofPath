import type { Topic } from '../domain/types';

/** Port: where challenges come from. A future AI-backed provider implements the same contract. */
export interface ContentProvider {
  getTopic(id: string): Promise<Topic>;
}
