import React from "react";
import { env } from "../config/env";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (env.IS_DEV) {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }

    // Store error details
    this.setState({
      error,
      errorInfo,
    });

  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-xl w-full bg-white dark:bg-slate-800 shadow-md rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Something went wrong</h1>
            <p className="text-slate-600 mb-6">
              We apologize for the inconvenience. An unexpected error occurred.
            </p>

            {env.IS_DEV && (
              <details className="text-left mb-4 p-4 bg-gray-100 rounded">
                <summary className="cursor-pointer font-semibold">
                  Error Details (Development)
                </summary>
                <div className="mt-2">
                  <p>
                    <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  </p>
                  <pre className="mt-2 text-sm overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload Page
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
