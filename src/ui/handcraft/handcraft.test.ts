import { describe, expect, it } from 'vitest';
import { seededRandom, seedFrom } from './seededRandom';
import { wobbleCircle, wobbleLine } from './wobblePath';

const a = { x: 0, y: 0 };
const b = { x: 200, y: 0 };

describe('seededRandom', () => {
  it('repeats exactly for the same seed', () => {
    const one = seededRandom(7);
    const two = seededRandom(7);
    expect([one(), one(), one()]).toEqual([two(), two(), two()]);
  });

  it('differs between seeds and stays in [0, 1)', () => {
    const r = seededRandom(1);
    const values = Array.from({ length: 200 }, () => r());
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(seededRandom(1)()).not.toBe(seededRandom(2)());
  });

  it('derives a stable seed from text', () => {
    expect(seedFrom('node-1')).toBe(seedFrom('node-1'));
    expect(seedFrom('node-1')).not.toBe(seedFrom('node-2'));
  });
});

describe('wobbleLine', () => {
  it('is identical on every render for the same seed', () => {
    expect(wobbleLine(a, b, 42)).toBe(wobbleLine(a, b, 42));
  });

  it('differs for different seeds', () => {
    expect(wobbleLine(a, b, 1)).not.toBe(wobbleLine(a, b, 2));
  });

  it('starts and ends exactly on the given points', () => {
    const d = wobbleLine(a, b, 5);
    expect(d.startsWith('M0.0 0.0')).toBe(true);
    expect(d.endsWith('L200.0 0.0')).toBe(true);
  });

  it('keeps its drift within the amplitude', () => {
    const d = wobbleLine(a, b, 9, { amplitude: 3 });
    // Path numbers alternate x, y, x, y: the line runs along y = 0, so |y| is the drift.
    const numbers = (d.match(/-?\d+\.\d/g) ?? []).map(Number);
    const ys = numbers.filter((_, i) => i % 2 === 1).map(Math.abs);
    expect(Math.max(...ys)).toBeLessThanOrEqual(3.1);
  });
});

describe('wobbleCircle', () => {
  it('is deterministic and closed', () => {
    expect(wobbleCircle(50, 50, 20, 3)).toBe(wobbleCircle(50, 50, 20, 3));
    expect(wobbleCircle(50, 50, 20, 3).endsWith('Z')).toBe(true);
  });
});
