import React, { Component, type ReactNode } from 'react';
import { type ApolloError } from '@apollo/client';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GraphQLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GraphQL Error Boundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private isApolloError(error: Error): error is ApolloError {
    return error.name === 'ApolloError';
  }

  private renderErrorFallback() {
    const { error } = this.state;
    
    if (this.props.fallback) {
      return this.props.fallback;
    }

    if (error && this.isApolloError(error)) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Data Loading Error
          </h3>
          {error.graphQLErrors.length > 0 && (
            <div className="mb-2">
              <p className="text-sm text-red-700 font-medium">GraphQL Errors:</p>
              <ul className="list-disc list-inside text-sm text-red-600">
                {error.graphQLErrors.map((err, index) => (
                  <li key={index}>{err.message}</li>
                ))}
              </ul>
            </div>
          )}
          {error.networkError && (
            <div className="mb-2">
              <p className="text-sm text-red-700 font-medium">Network Error:</p>
              <p className="text-sm text-red-600">{error.networkError.message}</p>
            </div>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-red-700 mb-2">
          {error?.message ?? 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => this.setState({ hasError: false, error: undefined })}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}