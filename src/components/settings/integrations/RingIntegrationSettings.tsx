import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Loader2, Link2Off } from 'lucide-react';
import { useRing } from '~/context/RingContext';

type ConnectionStatus = 'connected' | 'expired' | 'error' | 'disconnected' | 'connecting';

interface TokenStatusResponse {
  status: ConnectionStatus;
  error?: string;
  lastRefresh?: string;
  hasToken: boolean;
}

const statusConfig: Record<ConnectionStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  connected: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Connected' },
  expired: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Token Expired' },
  error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Error' },
  disconnected: { icon: Link2Off, color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', label: 'Not Connected' },
  connecting: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Connecting...' },
};

export const RingIntegrationSettings: React.FC = () => {
  const { tokenExpired, updateToken, isInitialized } = useRing();
  const [tokenInput, setTokenInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverStatus, setServerStatus] = useState<TokenStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/ring/token');
      const data = await response.json() as TokenStatusResponse;
      setServerStatus(data);
    } catch {
      setServerStatus({ status: 'error', hasToken: false, error: 'Failed to fetch status' });
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  // Re-fetch status when context initialization changes
  useEffect(() => {
    if (isInitialized || tokenExpired) {
      void fetchStatus();
    }
  }, [isInitialized, tokenExpired, fetchStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tokenInput.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const success = await updateToken(trimmed);
      if (success) {
        setSubmitSuccess(true);
        setTokenInput('');
        await fetchStatus();
      } else {
        setSubmitError('Failed to connect with the provided token. Verify it was copied correctly from ring-auth-cli.');
      }
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentStatus: ConnectionStatus = loadingStatus
    ? 'connecting'
    : tokenExpired
      ? 'expired'
      : serverStatus?.status ?? 'disconnected';

  const config = statusConfig[currentStatus];
  const StatusIcon = config.icon;

  const showTokenForm = currentStatus !== 'connected' || submitSuccess === false;

  return (
    <div>
      <div className="bg-airq-dark text-airq-light px-4 py-2 border-b border-black/80">
        <p className="text-xs font-semibold">ring integration</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Status indicator */}
        <div className={`flex items-center gap-3 px-4 py-3 border ${config.bg}`}>
          <StatusIcon className={`h-5 w-5 flex-shrink-0 ${config.color} ${currentStatus === 'connecting' ? 'animate-spin' : ''}`} />
          <div className="min-w-0">
            <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
            {serverStatus?.error && currentStatus !== 'connected' && (
              <p className="text-xs text-gray-600 mt-0.5 truncate">{serverStatus.error}</p>
            )}
            {serverStatus?.lastRefresh && currentStatus === 'connected' && (
              <p className="text-xs text-gray-500 mt-0.5">
                Last token refresh: {new Date(serverStatus.lastRefresh).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Success message */}
        {submitSuccess && currentStatus === 'connected' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            Ring connected successfully.
          </div>
        )}

        {/* Token input form */}
        {showTokenForm && (
          <div className="space-y-3">
            <div className="text-sm text-airq-dark/80 space-y-2">
              <p className="font-medium">
                {currentStatus === 'connected' ? 'Update Token' : 'Connect to Ring'}
              </p>
              <p className="text-xs text-airq-dark/60">
                Generate a refresh token by running the following command, then paste the token below:
              </p>
              <code className="block px-3 py-2 bg-airq-dark text-airq-light text-xs font-mono">
                npx -p ring-client-api ring-auth-cli
              </code>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
              <textarea
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  setSubmitError(null);
                  setSubmitSuccess(false);
                }}
                placeholder="Paste your Ring refresh token here..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-airq-dark/30 bg-airq-light focus:border-airq-contrast focus:outline-none resize-none font-mono"
                disabled={submitting}
              />

              {submitError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs">
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !tokenInput.trim()}
                className="px-4 py-2 text-sm font-medium bg-airq-dark text-airq-light border border-airq-dark hover:bg-airq-dark/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </span>
                ) : currentStatus === 'connected' ? (
                  'Update Token'
                ) : (
                  'Connect'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
