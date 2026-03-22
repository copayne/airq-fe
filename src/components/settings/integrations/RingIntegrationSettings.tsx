import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Loader2, Link2Off, ShieldCheck, KeyRound } from 'lucide-react';
import { useRing } from '~/context/RingContext';

type ConnectionStatus = 'connected' | 'expired' | 'error' | 'disconnected' | 'connecting';
type AuthStep = 'idle' | 'starting' | '2fa_required' | 'verifying' | 'complete' | 'error';

interface TokenStatusResponse {
  status: ConnectionStatus;
  error?: string;
  lastRefresh?: string;
  hasToken: boolean;
}

interface AuthResponse {
  success?: boolean;
  step?: string;
  message?: string;
  error?: string;
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
  const [serverStatus, setServerStatus] = useState<TokenStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Automated auth flow state
  const [authStep, setAuthStep] = useState<AuthStep>('idle');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Manual token fallback
  const [showManual, setShowManual] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  useEffect(() => {
    if (isInitialized || tokenExpired) {
      void fetchStatus();
    }
  }, [isInitialized, tokenExpired, fetchStatus]);

  const handleStartAuth = async () => {
    setAuthStep('starting');
    setAuthError(null);
    setAuthMessage(null);
    setTwoFactorCode('');

    try {
      const response = await fetch('/api/ring/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await response.json() as AuthResponse;

      if (!response.ok) {
        setAuthStep('error');
        setAuthError(data.error ?? 'Failed to start authentication');
        return;
      }

      if (data.step === 'complete') {
        setAuthStep('complete');
        setAuthMessage(data.message ?? 'Authenticated successfully');
        await fetchStatus();
      } else if (data.step === '2fa_required') {
        setAuthStep('2fa_required');
        setAuthMessage(data.message ?? 'Enter the 2FA code sent to your device');
      }
    } catch {
      setAuthStep('error');
      setAuthError('Network error. Could not reach the server.');
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = twoFactorCode.trim();
    if (!code) return;

    setAuthStep('verifying');
    setAuthError(null);

    try {
      const response = await fetch('/api/ring/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', code }),
      });
      const data = await response.json() as AuthResponse;

      if (!response.ok) {
        if (data.step === '2fa_retry') {
          setAuthStep('2fa_required');
          setAuthError(data.message ?? 'Invalid code. Please try again.');
          setTwoFactorCode('');
        } else {
          setAuthStep('error');
          setAuthError(data.error ?? 'Verification failed');
        }
        return;
      }

      setAuthStep('complete');
      setAuthMessage(data.message ?? 'Ring authenticated successfully');
      await fetchStatus();
    } catch {
      setAuthStep('error');
      setAuthError('Network error. Could not reach the server.');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
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
        setSubmitError('Failed to connect with the provided token.');
      }
    } catch {
      setSubmitError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAuth = () => {
    setAuthStep('idle');
    setAuthError(null);
    setAuthMessage(null);
    setTwoFactorCode('');
  };

  const currentStatus: ConnectionStatus = loadingStatus
    ? 'connecting'
    : tokenExpired
      ? 'expired'
      : serverStatus?.status ?? 'disconnected';

  const config = statusConfig[currentStatus];
  const StatusIcon = config.icon;

  const needsAuth = currentStatus !== 'connected' && currentStatus !== 'connecting';

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

        {/* Auth complete success */}
        {authStep === 'complete' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            {authMessage}
          </div>
        )}

        {/* Automated auth flow */}
        {needsAuth && authStep === 'idle' && (
          <div className="space-y-3">
            <button
              onClick={() => void handleStartAuth()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-airq-dark text-airq-light border border-airq-dark hover:bg-airq-dark/90 transition-colors"
            >
              <KeyRound className="h-4 w-4" />
              Refresh Token
            </button>
            <button
              onClick={() => setShowManual(!showManual)}
              className="text-xs text-airq-dark/50 hover:text-airq-dark/80 transition-colors"
            >
              {showManual ? 'Hide manual token entry' : 'Or enter a token manually...'}
            </button>
          </div>
        )}

        {/* Starting auth */}
        {authStep === 'starting' && (
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
            <p className="text-sm text-blue-700">Authenticating with Ring... A 2FA code will be sent to your device.</p>
          </div>
        )}

        {/* 2FA code entry */}
        {(authStep === '2fa_required' || authStep === 'verifying') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm">
              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              {authMessage}
            </div>

            {authError && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs">
                <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {authError}
              </div>
            )}

            <form onSubmit={(e) => void handleVerify2fa(e)} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="Enter 2FA code"
                maxLength={6}
                className="w-full px-3 py-2 text-center text-lg tracking-[0.5em] font-mono border border-airq-dark/30 bg-airq-light focus:border-airq-contrast focus:outline-none"
                disabled={authStep === 'verifying'}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={authStep === 'verifying' || !twoFactorCode.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-airq-dark text-airq-light border border-airq-dark hover:bg-airq-dark/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {authStep === 'verifying' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify'
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetAuth}
                  className="px-4 py-2 text-sm text-airq-dark/60 border border-airq-dark/20 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Auth error with retry */}
        {authStep === 'error' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm">
              <XCircle className="h-4 w-4 flex-shrink-0" />
              {authError}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => void handleStartAuth()}
                className="px-4 py-2 text-sm font-medium bg-airq-dark text-airq-light border border-airq-dark hover:bg-airq-dark/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={resetAuth}
                className="px-4 py-2 text-sm text-airq-dark/60 border border-airq-dark/20 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Already connected — show refresh option */}
        {currentStatus === 'connected' && authStep !== 'complete' && (
          <button
            onClick={() => void handleStartAuth()}
            className="text-xs text-airq-dark/50 hover:text-airq-dark/80 transition-colors"
          >
            Re-authenticate with Ring...
          </button>
        )}

        {/* Manual token fallback */}
        {showManual && authStep === 'idle' && (
          <div className="space-y-3 pt-2 border-t border-airq-dark/10">
            <div className="text-sm text-airq-dark/80 space-y-2">
              <p className="font-medium">Manual Token Entry</p>
              <p className="text-xs text-airq-dark/60">
                Paste a refresh token generated via <code className="bg-airq-dark/10 px-1">npx -p ring-client-api ring-auth-cli</code>
              </p>
            </div>

            <form onSubmit={(e) => void handleManualSubmit(e)} className="space-y-3">
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

              {submitSuccess && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-xs">
                  <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  Token updated successfully.
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
