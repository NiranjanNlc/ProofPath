import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { staticContentProvider } from '../content/staticContentProvider';
import { LandingScreen } from '../ui/screens/LandingScreen';

describe('LandingScreen', () => {
  it('shows the pitch, the path and real point totals, and starts on click', async () => {
    const topic = await staticContentProvider.getTopic('model-validation');
    const onStart = vi.fn();
    render(<LandingScreen topic={topic} onStart={onStart} />);

    expect(
      screen.getByRole('heading', { level: 1, name: /still went blank/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Protect the test set')).toBeInTheDocument();
    expect(screen.getByText('0 / 100')).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: /press start/i }));
    expect(onStart).toHaveBeenCalledOnce();
  });
});
