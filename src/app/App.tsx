import { useSession } from '../ui/state/SessionProvider';
import { ChallengeScreen } from '../ui/screens/ChallengeScreen';

export function App() {
  const { session } = useSession();
  return (
    <main>
      {session.status === 'finished' ? (
        <p>Session finished. The results screen arrives in a later slice.</p>
      ) : (
        <ChallengeScreen />
      )}
    </main>
  );
}
