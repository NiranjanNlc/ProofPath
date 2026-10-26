import { useEffect, useState } from 'react';
import { isLastChallenge } from '../../domain/session';
import { HandLetteredText } from '../handcraft/HandLetteredText';
import { PaperCard } from '../handcraft/PaperCard';
import { seedFrom } from '../handcraft/seededRandom';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { OptionList, optionLetter } from '../components/OptionList';
import { useSession } from '../state/SessionProvider';
import './ChallengeScreen.css';

/** Keyed by challenge and attempt, so each new attempt starts with nothing selected. */
export function ChallengeScreen() {
  const { challenge, record } = useSession();
  return <ChallengeView key={`${challenge.id}:${record.attempts.length}`} />;
}

function ChallengeView() {
  const { topic, session, challenge, record, phase, dispatch } = useSession();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const resolved = phase === 'resolved';
  const triedWrongIds = record.attempts.filter((a) => !a.correct).map((a) => a.optionId);
  const last = isLastChallenge(session, topic);

  const submit = () => {
    if (selectedId) dispatch({ type: 'SUBMIT_ANSWER', optionId: selectedId });
  };
  const advance = () => dispatch({ type: 'ADVANCE' });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        if (resolved) advance();
        else submit();
        return;
      }
      if (resolved) return;
      const index = event.key.toLowerCase().charCodeAt(0) - 97;
      const option = event.key.length === 1 ? challenge.options[index] : undefined;
      if (option) setSelectedId(option.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const lastLetter = optionLetter(challenge.options.length - 1);

  return (
    <PaperCard className="challenge" seed={seedFrom(challenge.id)}>
      <div className="challenge__story">
        <p className="label">
          Challenge {String(session.currentIndex + 1).padStart(2, '0')} · {challenge.title}
          {challenge.isTransfer && ' · Transfer challenge'}
        </p>
        <HandLetteredText as="h1" text={challenge.headline} />
        <p className="challenge__scenario">{challenge.scenario}</p>
        <img className="challenge__image" src={challenge.image.src} alt={challenge.image.alt} />
      </div>

      <div className="challenge__play">
        <OptionList
          options={challenge.options}
          selectedId={selectedId}
          triedWrongIds={triedWrongIds}
          disabled={resolved}
          correctId={challenge.correctOptionId}
          onSelect={setSelectedId}
        />

        {!resolved && (
          <p className="challenge__help">
            Pick the answer you could defend to a reviewer.{' '}
            <span className="label">Keys: A–{lastLetter}, then Enter.</span>
          </p>
        )}

        <FeedbackPanel challenge={challenge} record={record} />

        <div className="challenge__actions">
          {resolved ? (
            <button type="button" className="button" onClick={advance}>
              {last ? 'Finish' : 'Continue'} →
            </button>
          ) : (
            <button type="button" className="button" disabled={!selectedId} onClick={submit}>
              Check answer →
            </button>
          )}
        </div>
      </div>
    </PaperCard>
  );
}
