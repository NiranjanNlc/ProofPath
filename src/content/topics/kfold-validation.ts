import type { Topic } from '../../domain/types';

/** The single PoC topic. Challenges 2–5 are added in slice 2. */
export const kfoldValidation: Topic = {
  id: 'model-validation',
  title: 'Model validation',
  contentVersion: '1',
  challenges: [
    {
      id: 'pick-the-split',
      title: 'Pick the split',
      kind: 'Choose a strategy',
      concept: 'representative-evaluation',
      headline: 'Same label balance. Better evaluation.',
      scenario:
        'You are training a classifier on 2,000 independent customer records. Only 8% are fraud cases. Which validation approach best preserves the class balance in each fold?',
      image: {
        src: '/illustrations/pick-the-split.svg',
        alt: 'Five folds of customer records drawn as boxes. Red marks for fraud cases are spread unevenly: one fold has many, another almost none.',
      },
      options: [
        {
          id: 'a',
          text: 'Shuffle and split randomly',
          misconception: {
            tag: 'random-means-balanced',
            diagnosis:
              'Shuffling feels fair, but it only balances classes on average. With 160 fraud cases in 2,000 records, a fold can easily get 20 of them or 45. Your score then depends on luck, not on the model.',
          },
        },
        {
          id: 'b',
          text: 'Train on all records, evaluate on the same data',
          misconception: {
            tag: 'evaluating-on-training-data',
            diagnosis:
              'Using every record feels like using the most information. But a model scored on data it already saw is graded on memory, so the number tells you nothing about unseen customers.',
          },
        },
        { id: 'c', text: 'Stratified K-Fold' },
      ],
      correctOptionId: 'c',
      hint: 'Count the fraud cases in each fold. With only 8% fraud, what could go wrong in a fold by chance, and what would force every fold to keep roughly 8%?',
      reveal: {
        explanation:
          'Stratified K-Fold builds every fold so it keeps the original class proportions, here about 8% fraud in each. Every fold is then a fair miniature of the whole dataset, and the scores are comparable.',
        whyOthersDontFit: {
          a: 'A random split balances the classes only on average. For a rare class, individual folds can drift far from 8%.',
          b: 'Evaluating on the training data measures memory, not generalisation, so it says nothing about new customers.',
        },
      },
      isTransfer: false,
    },
  ],
};
