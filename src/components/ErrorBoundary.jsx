import React from 'react';

/**
 * ErrorBoundary — React Class Component for resilient error handling.
 * Catches runtime errors anywhere in the component tree, preventing
 * the entire ClubOS dashboard from crashing due to a single component error.
 * Particularly important for AI-generated content rendering and game components.
 *
 * @class ErrorBoundary
 * @extends {React.Component}
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  /**
   * Derive state from thrown errors — called before render on error.
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state slice marking the error
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Log error details for debugging. In production, this could send to
   * Firebase Crashlytics or Google Cloud Logging.
   * @param {Error} error - The error object
   * @param {React.ErrorInfo} errorInfo - Component stack info
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, log to monitoring service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  /**
   * Reset the error boundary state to allow retry.
   */
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center justify-center p-8 bg-red-500/10 border border-red-500/30 rounded-2xl text-center space-y-4"
        >
          <div className="text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-red-400">Something went wrong</h2>
          <p className="text-sm text-gray-400 max-w-sm">
            This component encountered an error. The rest of ClubOS is unaffected.
            Try resetting or refreshing the page.
          </p>
          <button
            onClick={this.handleReset}
            aria-label="Reset this component and try again"
            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-lg font-semibold transition-colors"
          >
            Reset Component
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
