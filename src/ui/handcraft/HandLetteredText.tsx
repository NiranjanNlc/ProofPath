import { Fragment } from 'react';
import { seededRandom, seedFrom } from './seededRandom';
import './handcraft.css';

/**
 * Display text where repeated letters are never identical: each letter gets a small seeded
 * tilt and lift. Words stay unbreakable units, so wrapping works. Screen readers get the plain text.
 */
export function HandLetteredText({
  text,
  as: Tag = 'span',
}: {
  text: string;
  as?: 'span' | 'h1' | 'h2';
}) {
  const random = seededRandom(seedFrom(text));
  return (
    <Tag className="lettered" aria-label={text}>
      {text.split(' ').map((word, w) => (
        <Fragment key={w}>
          {w > 0 && ' '}
          <span className="lettered__word" aria-hidden="true">
            {[...word].map((letter, i) => (
              <span
                key={i}
                className="lettered__letter"
                style={{
                  transform: `translateY(${((random() * 2 - 1) * 1.4).toFixed(2)}px) rotate(${((random() * 2 - 1) * 1.6).toFixed(2)}deg)`,
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
