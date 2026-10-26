import { phaseOf } from '../../domain/session';
import type { Outcome } from '../../domain/types';
import { seedFrom } from '../handcraft/seededRandom';
import { wobbleCircle, wobbleLine, type Point } from '../handcraft/wobblePath';
import { useSession } from '../state/SessionProvider';
import './MapPath.css';

const WIDTH = 1000;
const HEIGHT = 130;
const MARGIN = 70;

/** Node positions along a gentle S-curve, evenly spaced. */
function layout(count: number): Point[] {
  return Array.from({ length: count }, (_, i) => ({
    x: MARGIN + (i * (WIDTH - 2 * MARGIN)) / Math.max(1, count - 1),
    y: i % 2 === 0 ? 82 : 58,
  }));
}

const OUTCOME_LABEL: Record<Outcome, string> = {
  'first-try': 'first try',
  corrected: 'corrected',
  revealed: 'revealed',
};

/** Where you are on the journey. Visual only: nothing here is clickable or gated. */
export function MapPath() {
  const { topic, session } = useSession();
  const nodes = layout(topic.challenges.length);
  const finished = session.status === 'finished';

  const states = topic.challenges.map((challenge, i) => {
    const record = session.records.find((r) => r.challengeId === challenge.id);
    if (
      record?.outcome &&
      (i < session.currentIndex || finished || phaseOf(record) === 'resolved')
    ) {
      return { kind: 'done' as const, outcome: record.outcome };
    }
    return { kind: i === session.currentIndex ? ('current' as const) : ('upcoming' as const) };
  });

  const summary = topic.challenges
    .map((c, i) => {
      const s = states[i]!;
      const label =
        s.kind === 'done'
          ? OUTCOME_LABEL[s.outcome]
          : s.kind === 'current'
            ? 'you are here'
            : 'ahead';
      return `${c.title}: ${label}`;
    })
    .join('. ');

  return (
    <svg
      className="map"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Progress map. ${summary}.`}
    >
      {nodes.slice(0, -1).map((from, i) => {
        const to = nodes[i + 1]!;
        const walked = states[i]!.kind === 'done';
        return (
          <path
            key={i}
            className="map__path"
            data-walked={walked}
            d={wobbleLine(from, to, seedFrom(`${topic.id}:path:${i}`), { amplitude: 4 })}
          />
        );
      })}

      {nodes.slice(0, -1).map((from, i) => {
        const to = nodes[i + 1]!;
        const x = (from.x + to.x) / 2;
        const y = (from.y + to.y) / 2 + (i % 2 === 0 ? 30 : -34);
        return (
          <Landmark
            key={i}
            x={x}
            y={y}
            kind={i % 2 === 0 ? 'tree' : 'hill'}
            seed={seedFrom(`lm:${i}`)}
          />
        );
      })}

      {nodes.map((p, i) => {
        const state = states[i]!;
        const challenge = topic.challenges[i]!;
        const radius = challenge.isTransfer ? 22 : 18;
        const nodeShape = wobbleCircle(p.x, p.y, radius, seedFrom(`node:${i}`));
        return (
          <g
            key={challenge.id}
            data-state={state.kind}
            data-outcome={state.kind === 'done' ? state.outcome : undefined}
          >
            <path className="map__node-base" d={nodeShape} />
            <path className="map__node" d={nodeShape} />
            <text className="map__number" x={p.x} y={p.y + 5} textAnchor="middle">
              {i + 1}
            </text>
            {challenge.isTransfer && (
              <text className="map__tag" x={p.x} y={p.y + 42} textAnchor="middle">
                transfer
              </text>
            )}
            {state.kind === 'current' && !finished && (
              <g className="map__here">
                <path d={`M${p.x} ${p.y - 24} l-8 -14 h16 z`} />
                <text x={p.x} y={p.y - 46} textAnchor="middle">
                  you are here
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Landmark({
  x,
  y,
  kind,
  seed,
}: {
  x: number;
  y: number;
  kind: 'tree' | 'hill';
  seed: number;
}) {
  if (kind === 'tree') {
    return (
      <g className="map__landmark">
        <path d={wobbleLine({ x, y: y + 12 }, { x, y: y - 2 }, seed, { amplitude: 0.8 })} />
        <path d={wobbleCircle(x, y - 10, 9, seed + 1, 0.15)} />
      </g>
    );
  }
  return (
    <g className="map__landmark">
      <path d={wobbleLine({ x: x - 16, y: y + 8 }, { x, y: y - 8 }, seed, { amplitude: 0.8 })} />
      <path
        d={wobbleLine({ x, y: y - 8 }, { x: x + 16, y: y + 8 }, seed + 1, { amplitude: 0.8 })}
      />
    </g>
  );
}
