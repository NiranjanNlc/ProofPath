import { useEffect, useRef, useState } from 'react';
import { stitchPath } from './stitch';

/** Running-stitch border drawn over its (position: relative) parent. Decorative. */
export function StitchBorder({ seed, inset = 8 }: { seed: number; inset?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return; // decorative: skip where unsupported
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <svg ref={ref} className="stitch" aria-hidden="true" focusable="false">
      {size.width > 0 && <path d={stitchPath(size.width, size.height, seed, inset)} />}
    </svg>
  );
}
