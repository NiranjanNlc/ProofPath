import { HandLetteredText } from '../handcraft/HandLetteredText';
import { useSession } from '../state/SessionProvider';
import './AppHeader.css';

export function AppHeader() {
  const { topic, session } = useSession();
  const total = topic.challenges.length;
  const finished = session.status === 'finished';

  return (
    <header className="header">
      <span className="header__brand">
        <HandLetteredText text="ProofPath" />
      </span>
      <span className="label header__where">
        {finished ? 'Session complete' : `Challenge ${session.currentIndex + 1} of ${total}`}
      </span>
    </header>
  );
}
