import type { Topic } from '../domain/types';
import type { ContentProvider } from './ContentProvider';
import { parseTopic } from './schema';
import { kfoldValidation } from './topics/kfold-validation';

const topics: Record<string, unknown> = { [kfoldValidation.id]: kfoldValidation };

/** Serves bundled topics, validated through the same schema any future provider would use. */
export const staticContentProvider: ContentProvider = {
  async getTopic(id: string): Promise<Topic> {
    const data = topics[id];
    if (!data) throw new Error(`Unknown topic: ${id}`);
    return parseTopic(data);
  },
};
