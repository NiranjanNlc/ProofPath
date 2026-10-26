import type { SessionState } from '../domain/types';
import type { ProgressRepository } from './ProgressRepository';
import { SCHEMA_VERSION, storedProgressSchema } from './schema';

export const STORAGE_KEY = 'proofpath:session:v1';

/** Saves the session as validated JSON under one key. Every call is guarded: storage can throw. */
export class LocalStorageProgressRepository implements ProgressRepository {
  readonly durable: boolean;

  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>) {
    this.durable = this.probe();
  }

  load(): SessionState | null {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = storedProgressSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data.session : null;
    } catch {
      return null;
    }
  }

  save(state: SessionState): boolean {
    try {
      this.storage.setItem(
        STORAGE_KEY,
        JSON.stringify({ schemaVersion: SCHEMA_VERSION, session: state }),
      );
      return true;
    } catch {
      return false;
    }
  }

  clear(): void {
    try {
      this.storage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clear if storage is unavailable */
    }
  }

  private probe(): boolean {
    try {
      const key = `${STORAGE_KEY}:probe`;
      this.storage.setItem(key, '1');
      this.storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
}
