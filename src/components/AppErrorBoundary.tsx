import { Component, type ErrorInfo, type ReactNode } from 'react';

type AppErrorBoundaryState = {
  failed: boolean;
};

export class AppErrorBoundary extends Component<
  { children: ReactNode },
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Circle Clash failed to render', error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="app-error" role="alert">
        <p className="eyebrow">Circle Clash</p>
        <h1>Игра не смогла продолжить</h1>
        <p>Обновите страницу — матч можно запустить заново.</p>
        <button
          type="button"
          className="button button--primary"
          onClick={() => window.location.reload()}
        >
          Обновить
        </button>
      </main>
    );
  }
}
