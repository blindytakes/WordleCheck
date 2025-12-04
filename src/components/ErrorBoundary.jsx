// src/components/ErrorBoundary.jsx

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-8 bg-red-900/30 rounded-lg border-2 border-red-500">
                        <h2 className="text-2xl font-bold text-red-400 mb-4">
                            Oops! Something went wrong
                        </h2>
                        <p className="text-gray-300 mb-4">
                            The word cloud encountered an error while rendering.
                        </p>
                        <button
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition"
                            onClick={() => this.setState({ hasError: false, error: null })}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
