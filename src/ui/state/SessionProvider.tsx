import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import {
  createSession,
  currentChallenge,
  currentRecord,
  phaseOf,
  sessionReducer,
  type SessionAction,
} from '../../domain/session';
import type { Challenge, ChallengeRecord, Phase, SessionState, Topic } from '../../domain/types';

interface SessionContextValue {
  topic: Topic;
  session: SessionState;
  challenge: Challenge;
  record: ChallengeRecord;
  phase: Phase;
  dispatch: (action: SessionAction) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ topic, children }: { topic: Topic; children: ReactNode }) {
  const [session, dispatch] = useReducer(
    (state: SessionState, action: SessionAction) => sessionReducer(state, action, topic),
    topic,
    createSession,
  );

  const value = useMemo<SessionContextValue>(() => {
    const record = currentRecord(session, topic);
    return {
      topic,
      session,
      challenge: currentChallenge(session, topic),
      record,
      phase: phaseOf(record),
      dispatch,
    };
  }, [session, topic]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
