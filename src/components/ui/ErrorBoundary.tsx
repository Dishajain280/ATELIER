import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error in ATELIER:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 bg-[#FAF9F6]">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-xs p-8 text-center space-y-4 shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h2 className="font-editorial text-2xl font-normal text-neutral-900">
              An Unexpected Studio Interruption Occurred
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed font-light">
              {this.state.error?.message || 'A visual interface error occurred while rendering.'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
