import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  currentChallenge,
  currentRecord,
  phaseOf,
  sessionReducer,
  type SessionAction,
} from '../../domain/session';
import type { Challenge, ChallengeRecord, Phase, SessionState, Topic } from '../../domain/types';
import type { ProgressRepository } from '../../persistence/ProgressRepository';

interface SessionContextValue {
  topic: Topic;
  session: SessionState;
  challenge: Challenge;
  record: ChallengeRecord;
  phase: Phase;
  /** True when progress cannot be kept across reloads in this browser. */
  progressUnsaved: boolean;
  dispatch: (action: SessionAction) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface Props {
  topic: Topic;
  initialSession: SessionState;
  repository: ProgressRepository;
  children: ReactNode;
}

/** Holds the session and saves it after every action. Contains no game rules. */
export function SessionProvider({ topic, initialSession, repository, children }: Props) {
  const [session, setSession] = useState(initialSession);
  const [saveFailed, setSaveFailed] = useState(false);
  const latest = useRef(initialSession);

  const dispatch = useCallback(
    (action: SessionAction) => {
      const next = sessionReducer(latest.current, action, topic);
      if (next === latest.current) return;
      latest.current = next;
      setSession(next);
      if (action.type === 'RESTART') repository.clear();
      else setSaveFailed(!repository.save(next) && repository.durable);
    },
    [topic, repository],
  );

  const value = useMemo<SessionContextValue>(() => {
    const record = currentRecord(session, topic);
    return {
      topic,
      session,
      challenge: currentChallenge(session, topic),
      record,
      phase: phaseOf(record),
      progressUnsaved: !repository.durable || saveFailed,
      dispatch,
    };
  }, [session, topic, repository, saveFailed, dispatch]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
