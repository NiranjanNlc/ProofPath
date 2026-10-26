import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onReset: () => void;
}

/** Shows a plain message instead of a white screen if rendering ever fails. */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="page" role="alert">
        <p>Something went sideways on our side. Your answers are safe to start over.</p>
        <button
          type="button"
          className="button"
          onClick={() => {
            this.props.onReset();
            window.location.reload();
          }}
        >
          Start over →
        </button>
      </main>
    );
  }
}
