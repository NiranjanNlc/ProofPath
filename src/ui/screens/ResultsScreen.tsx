import { useMemo } from 'react';
import { buildResults } from '../../domain/results';
import type { Outcome } from '../../domain/types';
import { PaperCard } from '../handcraft/PaperCard';
import { seedFrom } from '../handcraft/seededRandom';
import { useSession } from '../state/SessionProvider';
import './ResultsScreen.css';

const OUTCOME_LABEL: Record<Outcome, string> = {
  'first-try': 'First try',
  corrected: 'Corrected',
  revealed: 'Revealed',
};

export function ResultsScreen() {
  const { session, topic, dispatch } = useSession();
  const results = useMemo(() => buildResults(session, topic), [session, topic]);
  if (!results) return null;

  const { initialAccuracy, retries, misconceptions, transfer } = results;

  return (
    <PaperCard className="results" seed={seedFrom('results')}>
      <section className="results__summary">
        <p className="label">Your mastery report · {topic.title}</p>
        <h1>
          {results.score}
          <span className="results__max"> / {results.maxScore}</span>
        </h1>
        <dl className="results__stats">
          <div>
            <dt className="label">Initial accuracy</dt>
            <dd>
              {initialAccuracy.correct} of {initialAccuracy.total} right on the first try
            </dd>
          </div>
          <div>
            <dt className="label">Retry outcomes</dt>
            <dd>
              {retries.corrected} corrected after a hint, {retries.revealed} revealed
            </dd>
          </div>
          <div>
            <dt className="label">Transfer challenge</dt>
            <dd>
              <span className="outcome" data-outcome={transfer.outcome}>
                {OUTCOME_LABEL[transfer.outcome]}
              </span>{' '}
              {transfer.points} of {transfer.maxPoints} points
            </dd>
          </div>
        </dl>
        <button type="button" className="button" onClick={() => dispatch({ type: 'RESTART' })}>
          Start over →
        </button>
      </section>

      <section className="results__detail">
        <h2 className="label">How the score adds up</h2>
        <ol className="results__rows">
          {results.challenges.map((c) => (
            <li key={c.challengeId}>
              <span>
                {c.title}
                {c.isTransfer && <span className="label"> · transfer</span>}
              </span>
              <span className="outcome" data-outcome={c.outcome}>
                {OUTCOME_LABEL[c.outcome]}
              </span>
              <span className="results__points">
                {c.points}/{c.maxPoints}
              </span>
            </li>
          ))}
        </ol>

        <h2 className="label">Misconceptions you addressed</h2>
        {misconceptions.length === 0 ? (
          <p>None. Every first answer was right.</p>
        ) : (
          <ul className="results__misconceptions">
            {misconceptions.map((m) => (
              <li key={m.challengeId}>
                <strong>{m.challengeTitle}</strong>{' '}
                <span className="outcome" data-outcome={m.status}>
                  {m.status === 'corrected' ? 'Corrected' : 'Revealed'}
                </span>
                <br />
                {m.diagnosis}
              </li>
            ))}
          </ul>
        )}
      </section>
    </PaperCard>
  );
}
