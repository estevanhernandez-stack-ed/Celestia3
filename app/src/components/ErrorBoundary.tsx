"use client";

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🔴 [ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl shadow-red-500/10">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white tracking-wide">
                Cosmic Disturbance Detected
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                The astral currents have been disrupted. This error has been logged for investigation.
              </p>
            </div>

            {/* Error Details (collapsed) */}
            <details className="bg-black/40 rounded-xl p-4 text-left border border-slate-800">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 transition-colors uppercase tracking-widest font-bold">
                Technical Details
              </summary>
              <pre className="mt-3 text-xs text-red-400 font-mono overflow-auto max-h-32">
                {this.state.error?.message || "Unknown error"}
              </pre>
            </details>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all text-sm font-bold uppercase tracking-wider"
              >
                <Home size={16} />
                Home
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all text-sm font-bold uppercase tracking-wider"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>

            {/* Footer */}
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">
              Celestia 3 • Error Recovery Protocol
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
