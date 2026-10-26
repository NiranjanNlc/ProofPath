import { seededRandom } from './seededRandom';

/**
 * A running-stitch path around a rectangle inset by `inset` px. Each stitch differs in
 * length and sits a hair off the line, within fixed bounds, and is identical every render.
 */
export function stitchPath(width: number, height: number, seed: number, inset = 8): string {
  const random = seededRandom(seed);
  const corners = [
    [inset, inset],
    [width - inset, inset],
    [width - inset, height - inset],
    [inset, height - inset],
  ] as const;

  let d = '';
  for (let side = 0; side < 4; side++) {
    const [x1, y1] = corners[side]!;
    const [x2, y2] = corners[(side + 1) % 4]!;
    const length = Math.hypot(x2 - x1, y2 - y1);
    const ux = (x2 - x1) / length;
    const uy = (y2 - y1) / length;
    let at = 0;
    while (at < length) {
      const stitch = Math.min(length - at, 9 + random() * 4);
      const drift = (random() * 2 - 1) * 1.2;
      const sx = x1 + ux * at - uy * drift;
      const sy = y1 + uy * at + ux * drift;
      d += `M${sx.toFixed(1)} ${sy.toFixed(1)}L${(sx + ux * stitch).toFixed(1)} ${(sy + uy * stitch).toFixed(1)}`;
      at += stitch + 6 + random() * 2.5;
    }
  }
  return d;
}
