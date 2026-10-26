import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createSession, restoreSession } from '../domain/session';
import { LocalStorageProgressRepository } from '../persistence/localStorageProgressRepository';
import { MemoryProgressRepository } from '../persistence/memoryProgressRepository';
import { staticContentProvider } from '../content/staticContentProvider';
import { SessionProvider } from '../ui/state/SessionProvider';
import { App } from './App';

async function setup() {
  const topic = await staticContentProvider.getTopic('model-validation');
  const user = userEvent.setup();
  render(
    <SessionProvider
      topic={topic}
      initialSession={createSession(topic)}
      repository={new MemoryProgressRepository()}
    >
      <App />
    </SessionProvider>,
  );
  const pick = async (name: RegExp) => {
    await user.click(screen.getByRole('radio', { name }));
    await user.click(screen.getByRole('button', { name: /check answer/i }));
  };
  const next = () => user.click(screen.getByRole('button', { name: /continue|finish/i }));
  return { user, pick, next };
}

describe('full journey', () => {
  it('plays all five challenges and shows results that match the answers given', async () => {
    const { pick, next } = await setup();

    // 1. first-try correct
    expect(
      screen.getByRole('img', { name: /progress map.*pick the split: you are here/i }),
    ).toBeInTheDocument();
    await pick(/stratified k-fold/i);
    expect(screen.getByText(/right the first time/i)).toBeInTheDocument();
    await next();
    expect(
      screen.getByRole('img', {
        name: /progress map.*pick the split: first try.*find the leak: you are here/i,
      }),
    ).toBeInTheDocument();

    // 2. wrong, diagnosis and hint, then corrected
    await pick(/five folds is too few/i);
    expect(screen.getByText(/why that was tempting/i)).toBeInTheDocument();
    expect(screen.getByText(/one retry/i)).toBeInTheDocument();
    await pick(/feature selection saw every patient/i);
    expect(screen.getByText(/recorded as corrected/i)).toBeInTheDocument();
    await next();

    // 3. first-try correct
    await pick(/check recall/i);
    await next();

    // 4. wrong twice: revealed
    await pick(/nothing: the models never trained/i);
    await pick(/test set is too small/i);
    expect(screen.getByText(/the answer/i)).toBeInTheDocument();
    await next();

    // 5. transfer: wrong, then corrected
    expect(screen.getByText(/transfer challenge/i)).toBeInTheDocument();
    await pick(/stratifying by condition/i);
    await pick(/keep all of a patient/i);
    await next();

    // Results: 15 + 8 + 15 + 0 + 20 = 58 of 100
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('58 / 100');
    expect(screen.getByText(/2 of 5 right on the first try/i)).toBeInTheDocument();
    expect(screen.getByText(/2 corrected after a hint, 1 revealed/i)).toBeInTheDocument();
    expect(screen.getByText(/20 of 40 points/i)).toBeInTheDocument();
  });

  it('starts over from the results screen', async () => {
    const { pick, next, user } = await setup();
    for (const name of [
      /stratified k-fold/i,
      /feature selection saw/i,
      /check recall/i,
      /the test set was used to choose/i,
      /keep all of a patient/i,
    ]) {
      await pick(name);
      await next();
    }
    await user.click(screen.getByRole('button', { name: /start over/i }));
    expect(screen.getByText(/challenge 01/i)).toBeInTheDocument();
  });

  it('warns when progress cannot be saved', async () => {
    await setup();
    expect(screen.getByText(/progress can.t be saved/i)).toBeInTheDocument();
  });

  it('restores the hint and single retry after leaving mid-challenge', async () => {
    const topic = await staticContentProvider.getTopic('model-validation');
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
    const repository = new LocalStorageProgressRepository(storage);
    const user = userEvent.setup();
    const mount = () =>
      render(
        <SessionProvider
          topic={topic}
          initialSession={restoreSession(repository.load(), topic) ?? createSession(topic)}
          repository={repository}
        >
          <App />
        </SessionProvider>,
      );

    const first = mount();
    await user.click(screen.getByRole('radio', { name: /shuffle and split randomly/i }));
    await user.click(screen.getByRole('button', { name: /check answer/i }));
    expect(screen.queryByText(/progress can.t be saved/i)).not.toBeInTheDocument();
    first.unmount(); // the learner closes the tab

    mount(); // and comes back
    expect(screen.getByText(/why that was tempting/i)).toBeInTheDocument();
    expect(screen.getByText(/one retry/i)).toBeInTheDocument();

    // Refreshing cannot reset the attempt: a second wrong answer still reveals.
    await user.click(screen.getByRole('radio', { name: /train on all records/i }));
    await user.click(screen.getByRole('button', { name: /check answer/i }));
    expect(screen.getByText(/the answer/i)).toBeInTheDocument();
  });
});
