import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  /** Full-screen, brand-neutral bilingual fallback for the root of the public site. */
  fullScreen?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    // Root-level fallback for the public site: full-screen, bilingual, and a
    // hard reload (the section-level handleReset can't recover a persistent
    // top-level error). Brand-neutral so it works even if styling/context fails.
    if (this.props.fullScreen) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6 text-center">
          <div className="max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">
              Algo salió mal · Something went wrong
            </h1>
            <p className="text-white/70 text-sm mb-6">
              Por favor recarga la página. Si el problema persiste, contáctanos en support@triexpertservice.com.
              <br />
              Please reload the page. If the problem persists, contact support@triexpertservice.com.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs text-red-300 bg-black/30 rounded-lg p-3 mb-6 overflow-auto">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <RotateCw className="w-4 h-4" />
              Recargar · Reload
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          {this.props.fallbackTitle ?? 'Something went wrong in this section'}
        </h2>
        <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
          {import.meta.env.DEV && this.state.error
            ? this.state.error.message
            : 'The other tabs and the rest of the panel still work. You can try reloading this section.'}
        </p>
        <button
          onClick={this.handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          <RotateCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    );
  }
}
