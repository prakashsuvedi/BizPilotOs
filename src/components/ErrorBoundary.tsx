import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Send, CheckCircle2, Bug, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children?: ReactNode;
  sectionName?: string;
  fallback?: ReactNode;
  onReset?: () => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showStack: boolean;
  isReporting: boolean;
  reportSent: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showStack: false,
    isReporting: false,
    reportSent: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error(`[ErrorBoundary] Caught error in ${this.props.sectionName || 'Component'}:`, error, errorInfo);

    // Auto-telemetry beacon in background
    try {
      fetch('/api/telemetry/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'error_boundary_crash',
          section: this.props.sectionName || 'Root',
          errorMessage: error.message,
          stackSnippet: error.stack?.slice(0, 500),
          componentStack: errorInfo.componentStack?.slice(0, 500),
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {
        // Safe silence on telemetry fail
      });
    } catch (e) {}
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, reportSent: false });
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (err) {
        console.error('Error during ErrorBoundary reset handler:', err);
      }
    }
  };

  private handleManualReport = async () => {
    if (this.state.isReporting || this.state.reportSent) return;
    this.setState({ isReporting: true });

    try {
      await fetch('/api/telemetry/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'user_reported_ui_crash',
          section: this.props.sectionName || 'Component',
          errorMessage: this.state.error?.message || 'Unknown render failure',
          stackSnippet: this.state.error?.stack?.slice(0, 1000),
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      });
      this.setState({ isReporting: false, reportSent: true });
    } catch (e) {
      this.setState({ isReporting: false });
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isSectionLevel = Boolean(this.props.sectionName);

      return (
        <div 
          className={`w-full ${
            isSectionLevel 
              ? 'p-6 rounded-2xl bg-white border border-rose-200/80 shadow-sm my-3' 
              : 'min-h-[460px] flex items-center justify-center p-6 bg-slate-900/95 rounded-3xl border border-slate-800 my-4'
          }`}
          role="alert"
        >
          <div className="max-w-xl w-full mx-auto space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`font-bold ${isSectionLevel ? 'text-slate-900 text-lg' : 'text-white text-xl'}`}>
                    {this.props.sectionName ? `${this.props.sectionName} Encountered an Issue` : 'Something went wrong'}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                    Isolated Boundary
                  </span>
                </div>
                <p className={`text-sm mt-1 ${isSectionLevel ? 'text-slate-600' : 'text-slate-400'}`}>
                  This section experienced a runtime fault, but the rest of the application remains protected and operational.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 overflow-x-auto">
              <span className="font-bold text-rose-600">Error: </span>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
              {this.state.error?.message?.includes('dynamically imported module') && (
                <div className="mt-2 text-[11px] font-sans font-medium text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  ⚡ <strong>New App Build Available:</strong> The application was recently updated with fresh assets. Click "Reload Page" to sync the newest version.
                </div>
              )}
            </div>

            {/* Collapsible Details in Dev or on demand */}
            {this.state.error?.stack && (
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <button
                  onClick={() => this.setState(prev => ({ showStack: !prev.showStack }))}
                  className="w-full px-3 py-2 bg-slate-100/70 hover:bg-slate-100 flex items-center justify-between text-slate-600 font-medium transition"
                >
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Bug className="w-3.5 h-3.5 text-slate-500" /> Technical Trace Information
                  </span>
                  {this.state.showStack ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {this.state.showStack && (
                  <pre className="p-3 bg-slate-900 text-slate-300 overflow-auto max-h-40 font-mono text-[10px] leading-relaxed select-all">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                title="Attempt to remount and restore this component without reloading the page"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry Component
              </button>

              <button
                onClick={this.handleManualReport}
                disabled={this.state.isReporting || this.state.reportSent}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-2 cursor-pointer ${
                  this.state.reportSent
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                }`}
              >
                {this.state.reportSent ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Diagnostics Logged
                  </>
                ) : (
                  <>
                    <Send className={`w-3.5 h-3.5 ${this.state.isReporting ? 'animate-pulse' : ''}`} />
                    {this.state.isReporting ? 'Transmitting...' : 'Send Error Log'}
                  </>
                )}
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-2 cursor-pointer ml-auto"
                title="Reload full application page"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
