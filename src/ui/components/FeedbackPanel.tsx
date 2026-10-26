import type { Challenge, ChallengeRecord } from '../../domain/types';
import './FeedbackPanel.css';

interface Props {
  challenge: Challenge;
  record: ChallengeRecord;
}

export function FeedbackPanel({ challenge, record }: Props) {
  const lastWrong = [...record.attempts].reverse().find((a) => !a.correct);
  const diagnosis = challenge.options.find((o) => o.id === lastWrong?.optionId)?.misconception;

  return (
    <div
      className="feedback"
      role="status"
      aria-live="polite"
      data-outcome={record.outcome ?? 'hinted'}
    >
      {record.outcome === 'first-try' && (
        <>
          <p className="label">First-try</p>
          <p>Right the first time. That is recorded as a first-try win.</p>
        </>
      )}

      {record.outcome === null && diagnosis && (
        <>
          <p className="label">Why that was tempting</p>
          <p>{diagnosis.diagnosis}</p>
          <p className="label">Hint</p>
          <p>{challenge.hint}</p>
          <p className="feedback__nudge">You have one retry.</p>
        </>
      )}

      {record.outcome === 'corrected' && (
        <>
          <p className="label">Corrected</p>
          <p>That fixed it. Recorded as corrected, not as a first-try win.</p>
        </>
      )}

      {record.outcome === 'revealed' && (
        <>
          <p className="label">The answer</p>
          <p>{challenge.reveal.explanation}</p>
          <ul>
            {challenge.options
              .filter((o) => o.id !== challenge.correctOptionId)
              .map((o) => (
                <li key={o.id}>
                  <strong>{o.text}.</strong> {challenge.reveal.whyOthersDontFit[o.id]}
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
}
