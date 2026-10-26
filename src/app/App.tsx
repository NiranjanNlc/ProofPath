import { AppHeader } from '../ui/components/AppHeader';
import { ChallengeScreen } from '../ui/screens/ChallengeScreen';
import { ResultsScreen } from '../ui/screens/ResultsScreen';
import { useSession } from '../ui/state/SessionProvider';

export function App() {
  const { session } = useSession();
  return (
    <>
      <AppHeader />
      <main className="page">
        {session.status === 'finished' ? <ResultsScreen /> : <ChallengeScreen />}
      </main>
    </>
  );
}
