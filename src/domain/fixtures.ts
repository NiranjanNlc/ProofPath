import type { Challenge, Topic } from './types';

const challenge = (id: string, isTransfer = false): Challenge => ({
  id,
  title: id,
  kind: 'Test',
  concept: 'c',
  headline: id,
  scenario: 'scenario',
  image: { src: '/x.svg', alt: 'x' },
  options: [
    { id: 'a', text: 'A', misconception: { tag: `${id}-a`, diagnosis: 'a is tempting' } },
    { id: 'b', text: 'B', misconception: { tag: `${id}-b`, diagnosis: 'b is tempting' } },
    { id: 'c', text: 'C' },
  ],
  correctOptionId: 'c',
  hint: 'hint',
  reveal: { explanation: 'because', whyOthersDontFit: { a: 'no', b: 'no' } },
  isTransfer,
});

/** Small topic for domain tests, so domain/ never imports real content. */
export const fixtureTopic: Topic = {
  id: 'fixture',
  title: 'Fixture',
  contentVersion: 'test',
  challenges: [challenge('one'), challenge('two', true)],
};
