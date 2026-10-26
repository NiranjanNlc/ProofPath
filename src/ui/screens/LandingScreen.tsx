import type { Topic } from '../../domain/types';
import { MAX_SCORE } from '../../domain/scoring';
import './LandingScreen.css';

type Palette = Record<string, string>;

/** Draws a tiny pixel sprite from rows of characters. '.' is transparent. */
function Pixels({
  rows,
  palette,
  className,
}: {
  rows: string[];
  palette: Palette;
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${rows[0]!.length} ${rows.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          palette[c] ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={palette[c]} />
          ) : null,
        ),
      )}
    </svg>
  );
}

const HERO = [
  '..hhhh..',
  '.hhhhhh.',
  '.ssssss.',
  '.s.ss.s.',
  '.ssssss.',
  '..bbbb..',
  '.bbbbbb.',
  '.bb..bb.',
  '.kk..kk.',
];
const HERO_COLORS = { h: '#35497a', s: '#f2c9a0', b: '#b8423c', k: '#2b2520' };

const BLOCK = [
  'kkkkkkkk',
  'kyyyyyyk',
  'kyykkyyk',
  'kyyyykyk',
  'kyyykyyk',
  'kyyyyyyk',
  'kyyykyyk',
  'kkkkkkkk',
];
const BLOCK_COLORS = { k: '#2b2520', y: '#e8a93a' };

/** First screen for a new learner. Knows nothing about sessions: it only calls onStart. */
export function LandingScreen({ topic, onStart }: { topic: Topic; onStart: () => void }) {
  const regular = topic.challenges.filter((c) => !c.isTransfer).length;

  return (
    <main className="landing">
      <header className="landing__hud" aria-hidden="true">
        <span>ProofPath</span>
        <span>World 1-1</span>
        <span>0 / {MAX_SCORE(regular)}</span>
      </header>

      <section className="landing__stage">
        <Pixels
          rows={BLOCK}
          palette={BLOCK_COLORS}
          className="landing__qblock landing__qblock--a"
        />
        <Pixels
          rows={BLOCK}
          palette={BLOCK_COLORS}
          className="landing__qblock landing__qblock--b"
        />
        <div className="landing__copy">
          <h1>
            You passed the quiz. <em>The real project still went blank.</em>
          </h1>
          <p>
            Nobody tells you which idea to use. Get a real situation, make the call, and see why the
            wrong answer felt right.
          </p>
          <button type="button" className="landing__start" onClick={onStart}>
            <span aria-hidden="true">▶</span> Press start
          </button>
        </div>
      </section>

      <footer className="landing__ground">
        <ol className="landing__levels" aria-label="Your path">
          {topic.challenges.map((c, i) => (
            <li key={c.id} data-transfer={c.isTransfer}>
              <span className="landing__lvl">1-{i + 1}</span>
              <span className="landing__name">{c.isTransfer ? 'Boss: new case' : c.title}</span>
            </li>
          ))}
        </ol>
        <Pixels rows={HERO} palette={HERO_COLORS} className="landing__hero" />
      </footer>
    </main>
  );
}
