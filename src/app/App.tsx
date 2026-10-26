import { AppHeader } from '../ui/components/AppHeader';
import { ChallengeScreen } from '../ui/screens/ChallengeScreen';
import { useSession } from '../ui/state/SessionProvider';

export function App() {
  const { session } = useSession();
  return (
    <>
      <AppHeader />
      <main className="page">
        {session.status === 'finished' ? (
          <p>Session finished. The results screen arrives in a later slice.</p>
        ) : (
          <ChallengeScreen />
        )}
      </main>
    </>
  );
}
