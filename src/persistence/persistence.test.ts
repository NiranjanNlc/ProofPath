import { beforeEach, describe, expect, it } from 'vitest';
import { fixtureTopic as topic } from '../domain/fixtures';
import { createSession, restoreSession, sessionReducer } from '../domain/session';
import type { SessionState } from '../domain/types';
import { LocalStorageProgressRepository, STORAGE_KEY } from './localStorageProgressRepository';

class FakeStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

const throwing = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

const hinted: SessionState = sessionReducer(
  createSession(topic),
  { type: 'SUBMIT_ANSWER', optionId: 'a' },
  topic,
);

describe('LocalStorageProgressRepository', () => {
  let storage: FakeStorage;
  let repo: LocalStorageProgressRepository;
  beforeEach(() => {
    storage = new FakeStorage();
    repo = new LocalStorageProgressRepository(storage);
  });

  it('is durable and returns null when nothing is saved', () => {
    expect(repo.durable).toBe(true);
    expect(repo.load()).toBeNull();
  });

  it('round-trips a session, including a pending hint and retry', () => {
    expect(repo.save(hinted)).toBe(true);
    expect(restoreSession(repo.load(), topic)).toEqual(hinted);
  });

  it('returns null for corrupt JSON', () => {
    storage.setItem(STORAGE_KEY, '{not json');
    expect(repo.load()).toBeNull();
  });

  it('returns null for the wrong shape or schema version', () => {
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99, session: hinted }));
    expect(repo.load()).toBeNull();
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, session: { nope: true } }));
    expect(repo.load()).toBeNull();
  });

  it('clears saved progress', () => {
    repo.save(hinted);
    repo.clear();
    expect(repo.load()).toBeNull();
  });

  it('degrades quietly when storage throws', () => {
    const blocked = new LocalStorageProgressRepository(throwing);
    expect(blocked.durable).toBe(false);
    expect(blocked.load()).toBeNull();
    expect(blocked.save(hinted)).toBe(false);
    expect(() => blocked.clear()).not.toThrow();
  });
});

describe('restoreSession', () => {
  it('accepts a consistent saved session', () => {
    expect(restoreSession(hinted, topic)).toEqual(hinted);
  });

  it('rejects null and a different content version or topic', () => {
    expect(restoreSession(null, topic)).toBeNull();
    expect(restoreSession({ ...hinted, contentVersion: 'old' }, topic)).toBeNull();
    expect(restoreSession({ ...hinted, topicId: 'other' }, topic)).toBeNull();
  });

  it('rejects ids that no longer exist in the content', () => {
    const stale = { ...hinted, records: [{ ...hinted.records[0]!, challengeId: 'gone' }] };
    expect(restoreSession(stale, topic)).toBeNull();
  });

  it('rejects an out-of-range position', () => {
    expect(restoreSession({ ...hinted, currentIndex: 7 }, topic)).toBeNull();
  });

  it('rejects an outcome that contradicts the attempts', () => {
    const forged = {
      ...hinted,
      records: [{ ...hinted.records[0]!, outcome: 'first-try' as const }],
    };
    expect(restoreSession(forged, topic)).toBeNull();
  });

  it('rejects a position that skips unfinished challenges', () => {
    expect(restoreSession({ ...createSession(topic), currentIndex: 1 }, topic)).toBeNull();
  });

  it('rejects a finished status with unresolved challenges', () => {
    expect(restoreSession({ ...hinted, status: 'finished' }, topic)).toBeNull();
  });
});
