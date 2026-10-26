import { AppHeader } from '../ui/components/AppHeader';
import { MapPath } from '../ui/components/MapPath';
import { ChallengeScreen } from '../ui/screens/ChallengeScreen';
import { ResultsScreen } from '../ui/screens/ResultsScreen';
import { useSession } from '../ui/state/SessionProvider';

export function App() {
  const { session, progressUnsaved } = useSession();
  return (
    <>
      <AppHeader />
      {progressUnsaved && (
        <p className="notice label" role="status">
          Progress can&apos;t be saved in this browser, so closing the tab will start you over.
        </p>
      )}
      <main className="page">
        <MapPath />
        {session.status === 'finished' ? <ResultsScreen /> : <ChallengeScreen />}
      </main>
    </>
  );
}
