import type { Topic } from '../../domain/types';

/** The single PoC topic: five challenges, the last one a transfer challenge. */
export const kfoldValidation: Topic = {
  id: 'model-validation',
  title: 'Model validation',
  contentVersion: '1',
  challenges: [
    {
      id: 'pick-the-split',
      title: 'Pick the split',
      kind: 'Choose a strategy',
      concept: 'trustworthy-evaluation',
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
    {
      id: 'find-the-leak',
      title: 'Find the leak',
      kind: 'Debug a workflow',
      concept: 'trustworthy-evaluation',
      headline: 'The score was beautiful. The new patients disagreed.',
      scenario:
        'A study has 200 patients and 5,000 gene measurements each. To keep the model simple, you first pick the 20 measurements most correlated with the diagnosis, using all 200 patients. Then you run 5-fold cross-validation on those 20 features and get 95% accuracy. On brand-new patients the model scores about 55%. What went wrong?',
      image: {
        src: '/illustrations/find-the-leak.svg',
        alt: 'A flow diagram: all patients feed a feature-selection step, and only afterwards are they split into folds. An arrow shows the label information leaking past the split.',
      },
      options: [
        {
          id: 'a',
          text: 'Feature selection saw every patient, including the ones used for validation',
        },
        {
          id: 'b',
          text: 'Five folds is too few, so use 10 or 20 folds',
          misconception: {
            tag: 'more-folds-fix-leaks',
            diagnosis:
              'More folds feels like a more thorough test. But the leak happened before any fold existed, and every extra fold inherits it. You would get a more precise estimate of a wrong number.',
          },
        },
        {
          id: 'c',
          text: 'Twenty features is still too many, so keep only the top 5',
          misconception: {
            tag: 'too-many-features-is-the-bug',
            diagnosis:
              'With 5,000 candidates, overfitting sounds like the culprit. But the real problem is when the features were chosen, not how many. Picking the top 5 on all patients leaks just as badly.',
          },
        },
      ],
      correctOptionId: 'a',
      hint: 'Ask what the feature-selection step already knew about the validation patients’ diagnoses, before cross-validation even began.',
      reveal: {
        explanation:
          'Choosing features with all 200 patients let the validation patients’ diagnoses influence which features were kept. The validation folds were no longer unseen. Selection must happen inside each training fold only, for example by putting it in a pipeline that is refit per fold.',
        whyOthersDontFit: {
          b: 'More folds repeat the same flawed procedure. The leak sits upstream of every fold.',
          c: 'The number of features is not the leak. Selecting any number of features on all patients leaks label information.',
        },
      },
      isTransfer: false,
    },
    {
      id: 'question-the-metric',
      title: 'Question the metric',
      kind: 'Read a score',
      concept: 'trustworthy-evaluation',
      headline: '92.8% accuracy. Sounds impressive. Is it?',
      scenario:
        'A fraud model is tested on 1,000 transactions, 80 of them fraud. It flags 12 transactions, and 10 of those really are fraud. Accuracy is 92.8%. Your teammate says, “That is far above the 8% fraud rate, so it works.” What is the best response?',
      image: {
        src: '/illustrations/question-the-metric.svg',
        alt: 'A grid of 100 squares standing for 1,000 transactions, with 8 red squares for fraud. Only 1 red square is circled as caught.',
      },
      options: [
        {
          id: 'a',
          text: 'Agree: 92.8% is far above the 8% fraud rate',
          misconception: {
            tag: 'wrong-baseline',
            diagnosis:
              'Comparing against the fraud rate feels natural, but it is the wrong yardstick. A model that never flags anything is right 92% of the time on this data. Your model barely beats doing nothing.',
          },
        },
        {
          id: 'b',
          text: 'Check recall: how many of the 80 fraud cases did it catch?',
        },
        {
          id: 'c',
          text: 'Train longer until accuracy passes 95%',
          misconception: {
            tag: 'chase-the-number',
            diagnosis:
              'When a score disappoints, pushing it higher feels productive. But accuracy is the wrong number here, so raising it can mean ignoring fraud even more.',
          },
        },
      ],
      correctOptionId: 'b',
      hint: 'What accuracy would a model that never flags any transaction get on this exact test set?',
      reveal: {
        explanation:
          'On imbalanced data, accuracy is dominated by the majority class. This model caught only 10 of 80 fraud cases, a recall of 12.5%, while a model that flags nothing already scores 92%. Always read the metric that matches the job: here, how much fraud is caught.',
        whyOthersDontFit: {
          a: 'The right baseline is the do-nothing model at 92%, not the fraud rate. 92.8% is barely better than that.',
          c: 'Pushing accuracy higher does not fix a metric that hides the failure. Switch to a metric that reflects catching fraud.',
        },
      },
      isTransfer: false,
    },
    {
      id: 'protect-the-test-set',
      title: 'Protect the test set',
      kind: 'Debug a workflow',
      concept: 'trustworthy-evaluation',
      headline: 'You never trained on it. Is it still clean?',
      scenario:
        'You train six model variants on the training split. You score each one on the held-out test set, pick the best (91% accuracy), and report 91% as what to expect in production. None of the models was ever trained on the test set. What is the problem?',
      image: {
        src: '/illustrations/protect-the-test-set.svg',
        alt: 'Six model variants all pointing at the same test set, with an arrow from the test set back to the choice of the winner.',
      },
      options: [
        {
          id: 'a',
          text: 'Nothing: the models never trained on the test set, so 91% is an unbiased estimate',
          misconception: {
            tag: 'not-training-means-clean',
            diagnosis:
              'Not training on the test set feels like enough. But choosing the winner by its test score is also learning from it, and the best of six noisy scores is optimistic.',
          },
        },
        {
          id: 'b',
          text: 'The test set was used to choose the model, so the 91% is optimistic',
        },
        {
          id: 'c',
          text: 'The test set is too small, so collect a larger one',
          misconception: {
            tag: 'bigger-test-set-fixes-it',
            diagnosis:
              'A bigger test set sounds like a stronger one. It would make each score less noisy, but you would still be picking the winner on the same data you then report.',
          },
        },
      ],
      correctOptionId: 'b',
      hint: 'Which data decided which of the six models won, and is it the same data you then used to report the result?',
      reveal: {
        explanation:
          'Selecting the best of six by test score means the test set influenced the final choice, so the winning score is biased upward. Choose models on a separate validation set (or with cross-validation on the training data) and touch the test set once, at the end, for the final number.',
        whyOthersDontFit: {
          a: 'Staying out of training is not enough. Any decision made from the test score contaminates it.',
          c: 'A larger test set reduces noise but not the selection bias from choosing the winner on it.',
        },
      },
      isTransfer: false,
    },
    {
      id: 'same-idea-new-case',
      title: 'Same idea, new case',
      kind: 'Transfer',
      concept: 'trustworthy-evaluation',
      headline: 'The folds were balanced. The score still lied.',
      scenario:
        'A hospital has 3,000 scans from 400 patients, about 7 scans each. Five percent of scans show a rare condition. You run stratified 5-fold cross-validation, so every fold has 5% positive scans, and get 97% accuracy. On scans from new patients the model scores 78%. What is the most likely cause, and the fix?',
      image: {
        src: '/illustrations/same-idea-new-case.svg',
        alt: 'Scans drawn as small cards, coloured by patient. The same patient’s cards appear in both a training fold and a validation fold, linked by a line.',
      },
      options: [
        {
          id: 'a',
          text: 'Folds need stratifying by condition, to keep 5% positives in each',
          misconception: {
            tag: 'stratify-everything',
            diagnosis:
              'Stratification just rescued you in an earlier problem, so it is the tempting reflex. But your folds are already stratified here, so this cannot explain the gap.',
          },
        },
        {
          id: 'b',
          text: 'Keep all of a patient’s scans together in the same fold',
        },
        {
          id: 'c',
          text: 'Use a smaller model, because it is overfitting',
          misconception: {
            tag: 'blame-the-model',
            diagnosis:
              'A big gap between scores looks like overfitting, so shrinking the model feels right. But the model is not the first suspect: the evaluation let it see the same patients while training and while validating.',
          },
        },
      ],
      correctOptionId: 'b',
      hint: 'In deployment the model will see patients it has never met. In your folds, did it?',
      reveal: {
        explanation:
          'Scans from one patient look alike, so a random fold split puts a patient’s scans in both training and validation. The model can recognise the patient instead of the condition, which inflates the score. Use group-aware splitting (for example, grouped, stratified folds) so each patient stays in one fold, which matches the real situation of predicting for new patients.',
        whyOthersDontFit: {
          a: 'The folds already hold 5% positives. Stratifying again changes nothing about the leak between patients.',
          c: 'A smaller model may help a little, but the inflated score comes from shared patients across folds. Fix the evaluation first.',
        },
      },
      isTransfer: true,
    },
  ],
};
