import { useEffect, useState } from 'react';
import type { ContentProvider } from '../content/ContentProvider';
import { staticContentProvider } from '../content/staticContentProvider';
import { createSession, restoreSession } from '../domain/session';
import type { SessionState, Topic } from '../domain/types';
import { LocalStorageProgressRepository } from '../persistence/localStorageProgressRepository';
import { MemoryProgressRepository } from '../persistence/memoryProgressRepository';
import type { ProgressRepository } from '../persistence/ProgressRepository';
import { SessionProvider } from '../ui/state/SessionProvider';
import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';

const TOPIC_ID = 'model-validation';

/** The only place concrete adapters are chosen. */
const contentProvider: ContentProvider = staticContentProvider;

function createRepository(): ProgressRepository {
  try {
    const repo = new LocalStorageProgressRepository(window.localStorage);
    if (repo.durable) return repo;
  } catch {
    /* accessing localStorage itself can throw when site data is blocked */
  }
  return new MemoryProgressRepository();
}

const repository = createRepository();

interface Loaded {
  topic: Topic;
  initialSession: SessionState;
}

export function Root() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    contentProvider.getTopic(TOPIC_ID).then(
      (topic) =>
        setLoaded({
          topic,
          initialSession: restoreSession(repository.load(), topic) ?? createSession(topic),
        }),
      (e: unknown) => setError(String(e)),
    );
  }, []);

  if (error) return <p role="alert">Could not load the challenges: {error}</p>;
  if (!loaded) return null;

  return (
    <ErrorBoundary onReset={() => repository.clear()}>
      <SessionProvider
        topic={loaded.topic}
        initialSession={loaded.initialSession}
        repository={repository}
      >
        <App />
      </SessionProvider>
    </ErrorBoundary>
  );
}
