import { z } from 'zod';

const attemptSchema = z.object({ optionId: z.string(), correct: z.boolean() });

const recordSchema = z.object({
  challengeId: z.string(),
  attempts: z.array(attemptSchema).max(2),
  outcome: z.enum(['first-try', 'corrected', 'revealed']).nullable(),
});

export const SCHEMA_VERSION = 1;

export const storedProgressSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  session: z.object({
    topicId: z.string(),
    contentVersion: z.string(),
    currentIndex: z.number().int().min(0),
    records: z.array(recordSchema),
    status: z.enum(['in-progress', 'finished']),
  }),
});
