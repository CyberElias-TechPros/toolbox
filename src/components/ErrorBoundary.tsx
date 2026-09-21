import { Component, type ReactNode } from 'react';
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="container-page py-16">
          <div className="empty-state">
            <h1 className="text-2xl">Let’s get you back in flow.</h1>
            <p>This workspace could not load. Try reloading, or return to the collection.</p>
            <div className="flex gap-4 justify-center">
              <button className="orange-button" onClick={() => window.location.reload()}>
                Reload workspace
              </button>
              <a className="orange-button" href="/tools">
                All tools
              </a>
            </div>
          </div>
        </div>
      );
    return this.props.children;
  }
}
