import { z } from 'zod';
import type { Topic } from '../domain/types';

const optionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  misconception: z.object({ tag: z.string().min(1), diagnosis: z.string().min(1) }).optional(),
});

const challengeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  kind: z.string().min(1),
  concept: z.string().min(1),
  headline: z.string().min(1),
  scenario: z.string().min(1),
  image: z.object({ src: z.string().min(1), alt: z.string().min(1) }),
  options: z.array(optionSchema).min(3).max(4),
  correctOptionId: z.string().min(1),
  hint: z.string().min(1),
  reveal: z.object({
    explanation: z.string().min(1),
    whyOthersDontFit: z.record(z.string(), z.string()),
  }),
  isTransfer: z.boolean(),
});

export const CHALLENGES_PER_SESSION = 5;

export const topicSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    contentVersion: z.string().min(1),
    challenges: z.array(challengeSchema).min(1),
  })
  .superRefine((topic, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
    if (topic.challenges.length !== CHALLENGES_PER_SESSION)
      fail(`Expected ${CHALLENGES_PER_SESSION} challenges, found ${topic.challenges.length}`);
    topic.challenges.forEach((c, i) => {
      const isLast = i === topic.challenges.length - 1;
      if (c.isTransfer !== isLast)
        fail(`${c.id}: only the last challenge is the transfer challenge`);
    });
    const transfer = topic.challenges.at(-1);
    if (transfer && !topic.challenges.slice(0, -1).some((c) => c.concept === transfer.concept))
      fail('The transfer challenge must share a concept tag with an earlier challenge');

    const ids = new Set<string>();
    topic.challenges.forEach((c) => {
      if (ids.has(c.id)) fail(`Duplicate challenge id ${c.id}`);
      ids.add(c.id);

      const optionIds = c.options.map((o) => o.id);
      if (new Set(optionIds).size !== optionIds.length) fail(`${c.id}: duplicate option ids`);
      if (!optionIds.includes(c.correctOptionId)) fail(`${c.id}: correctOptionId is not an option`);
      c.options.forEach((o) => {
        const isCorrect = o.id === c.correctOptionId;
        if (isCorrect && o.misconception)
          fail(`${c.id}/${o.id}: correct option has a misconception`);
        if (!isCorrect && !o.misconception)
          fail(`${c.id}/${o.id}: wrong option lacks a misconception`);
        if (!isCorrect && !c.reveal.whyOthersDontFit[o.id])
          fail(`${c.id}/${o.id}: no whyOthersDontFit entry`);
      });
    });
  });

export function parseTopic(data: unknown): Topic {
  return topicSchema.parse(data);
}
