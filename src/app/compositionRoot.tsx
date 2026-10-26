import { useEffect, useState } from 'react';
import type { ContentProvider } from '../content/ContentProvider';
import { staticContentProvider } from '../content/staticContentProvider';
import type { Topic } from '../domain/types';
import { SessionProvider } from '../ui/state/SessionProvider';
import { App } from './App';

const TOPIC_ID = 'model-validation';

/** The only place concrete adapters are chosen. */
const contentProvider: ContentProvider = staticContentProvider;

export function Root() {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    contentProvider.getTopic(TOPIC_ID).then(setTopic, (e: unknown) => setError(String(e)));
  }, []);

  if (error) return <p role="alert">Could not load the challenges: {error}</p>;
  if (!topic) return null;

  return (
    <SessionProvider topic={topic}>
      <App />
    </SessionProvider>
  );
}
