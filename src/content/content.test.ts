import { describe, expect, it } from 'vitest';
import { parseTopic } from './schema';
import { staticContentProvider } from './staticContentProvider';
import { kfoldValidation } from './topics/kfold-validation';

describe('bundled content', () => {
  it('passes the content schema', async () => {
    await expect(staticContentProvider.getTopic(kfoldValidation.id)).resolves.toMatchObject({
      id: kfoldValidation.id,
    });
  });

  it('rejects an unknown topic', async () => {
    await expect(staticContentProvider.getTopic('nope')).rejects.toThrow();
  });

  it('rejects a wrong option without a misconception', () => {
    const broken = structuredClone(kfoldValidation);
    delete broken.challenges[0]!.options[0]!.misconception;
    expect(() => parseTopic(broken)).toThrow(/lacks a misconception/);
  });

  it('rejects a correct option that carries a misconception', () => {
    const broken = structuredClone(kfoldValidation);
    broken.challenges[0]!.options[2]!.misconception = { tag: 'x', diagnosis: 'y' };
    expect(() => parseTopic(broken)).toThrow(/correct option has a misconception/);
  });

  it('rejects a correctOptionId that is not an option', () => {
    const broken = structuredClone(kfoldValidation);
    broken.challenges[0]!.correctOptionId = 'missing';
    expect(() => parseTopic(broken)).toThrow(/not an option/);
  });
});
