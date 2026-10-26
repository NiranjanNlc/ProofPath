import type { ReactNode } from 'react';
import { StitchBorder } from './StitchBorder';
import './handcraft.css';

/** Cut-paper card: cream ground, one light direction (offset shadow), running-stitch border. */
export function PaperCard({
  children,
  className = '',
  seed,
}: {
  children: ReactNode;
  className?: string;
  seed: number;
}) {
  return (
    <article className={`paper-card ${className}`}>
      <StitchBorder seed={seed} />
      {children}
    </article>
  );
}
