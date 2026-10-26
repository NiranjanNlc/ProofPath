import { seededRandom } from './seededRandom';

export interface Point {
  x: number;
  y: number;
}

const fmt = (n: number) => n.toFixed(1);

/** Smooth path through points: quadratic curves via midpoints, ending exactly on the last point. */
function smooth(points: Point[]): string {
  const [first, ...rest] = points;
  if (!first) return '';
  let d = `M${fmt(first.x)} ${fmt(first.y)}`;
  for (let i = 0; i < rest.length - 1; i++) {
    const p = rest[i]!;
    const next = rest[i + 1]!;
    d += ` Q${fmt(p.x)} ${fmt(p.y)} ${fmt((p.x + next.x) / 2)} ${fmt((p.y + next.y) / 2)}`;
  }
  const last = rest[rest.length - 1];
  if (last) d += ` L${fmt(last.x)} ${fmt(last.y)}`;
  return d;
}

interface WobbleOptions {
  /** Maximum sideways drift in px: the bound that keeps irregularity deliberate. */
  amplitude?: number;
  /** Distance between wobble points along the line. */
  step?: number;
}

/** A hand-drawn-looking line between two points. Deterministic for a given seed; endpoints are exact. */
export function wobbleLine(
  from: Point,
  to: Point,
  seed: number,
  options: WobbleOptions = {},
): string {
  const { amplitude = 3, step = 22 } = options;
  const random = seededRandom(seed);
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const segments = Math.max(2, Math.round(length / step));
  const nx = -(to.y - from.y) / length;
  const ny = (to.x - from.x) / length;

  const points: Point[] = [from];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const drift = (random() * 2 - 1) * amplitude;
    points.push({
      x: from.x + (to.x - from.x) * t + nx * drift,
      y: from.y + (to.y - from.y) * t + ny * drift,
    });
  }
  points.push(to);
  return smooth(points);
}

/** A closed, slightly irregular circle: radius varies within +/- jitter of r. */
export function wobbleCircle(
  cx: number,
  cy: number,
  r: number,
  seed: number,
  jitter = 0.08,
): string {
  const random = seededRandom(seed);
  const count = 12;
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = r * (1 + (random() * 2 - 1) * jitter);
    points.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
  }
  const mids = points.map((p, i) => {
    const q = points[(i + 1) % count]!;
    return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
  });
  let d = `M${fmt(mids[count - 1]!.x)} ${fmt(mids[count - 1]!.y)}`;
  points.forEach((p, i) => {
    d += ` Q${fmt(p.x)} ${fmt(p.y)} ${fmt(mids[i]!.x)} ${fmt(mids[i]!.y)}`;
  });
  return `${d} Z`;
}
