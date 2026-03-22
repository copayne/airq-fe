/**
 * Next.js API Route for automated Ring authentication
 *
 * POST { action: 'start' } — Initiates auth with credentials from env vars, triggers 2FA
 * POST { action: 'verify', code: '123456' } — Completes auth with 2FA code, saves token
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { RingApiManager } from '~/lib/ringApiManager';

// Store the pending auth client between requests (server-side singleton)
const GLOBAL_KEY = '__ringAuthSession';
declare global {
  // eslint-disable-next-line no-var
  var __ringAuthSession: PendingAuthSession | undefined;
}

interface PendingAuthSession {
  restClient: Awaited<ReturnType<typeof createRestClient>> | null;
  promptFor2fa: string | null;
  createdAt: number;
}

// Dynamic import to access RingRestClient
async function createRestClient(email: string, password: string) {
  const { RingRestClient } = await import('ring-client-api/rest-client');
  // Use a random systemId to generate a fresh hardware_id each time.
  // Ring/Cloudflare can ban the deterministic hardware_id derived from system UUID
  // after too many failed auth attempts, returning 406 Not Acceptable.
  const systemId = crypto.randomUUID();
  return new RingRestClient({ email, password, systemId });
}

function getSession(): PendingAuthSession | null {
  const session = globalThis[GLOBAL_KEY];
  if (!session) return null;
  // Expire sessions after 10 minutes
  if (Date.now() - session.createdAt > 10 * 60 * 1000) {
    globalThis[GLOBAL_KEY] = undefined;
    return null;
  }
  return session;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, code } = req.body as { action?: string; code?: string };

  if (action === 'start') {
    const email = process.env.RING_EMAIL;
    const password = process.env.RING_PASSWORD;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Ring credentials not configured. Set RING_EMAIL and RING_PASSWORD in environment variables.',
      });
    }

    try {
      const restClient = await createRestClient(email, password);

      try {
        const auth = await restClient.getCurrentAuth();
        // No 2FA needed (unlikely but possible)
        const manager = RingApiManager.getInstance();
        await manager.updateToken(auth.refresh_token);
        return res.status(200).json({
          success: true,
          step: 'complete',
          message: 'Authenticated successfully without 2FA.',
        });
      } catch (authErr) {
        console.log('[ring/auth] Auth error:', authErr instanceof Error ? authErr.message : authErr);
        console.log('[ring/auth] promptFor2fa:', restClient.promptFor2fa);
        console.log('[ring/auth] using2fa:', restClient.using2fa);

        if (restClient.promptFor2fa) {
          // 2FA required — store session for the verify step
          globalThis[GLOBAL_KEY] = {
            restClient,
            promptFor2fa: restClient.promptFor2fa,
            createdAt: Date.now(),
          };
          return res.status(200).json({
            success: true,
            step: '2fa_required',
            message: restClient.promptFor2fa,
          });
        }

        // Pass through the actual error from Ring
        const errMsg = authErr instanceof Error ? authErr.message : 'Unknown authentication error';
        throw new Error(errMsg);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      const isRateLimit = message.includes('too many') || message.includes('10 codes');
      return res.status(isRateLimit ? 429 : 422).json({
        error: isRateLimit
          ? 'Rate limited by Ring. Too many authentication attempts. Wait 10 minutes and try again.'
          : message,
      });
    }
  }

  if (action === 'verify') {
    if (!code?.trim()) {
      return res.status(400).json({ error: '2FA code is required' });
    }

    const session = getSession();
    if (!session?.restClient) {
      return res.status(400).json({
        error: 'No pending auth session. Please start the authentication process first.',
      });
    }

    try {
      const auth = await session.restClient.getAuth(code.trim());
      // Clean up session
      globalThis[GLOBAL_KEY] = undefined;

      // Save the token
      const manager = RingApiManager.getInstance();
      await manager.updateToken(auth.refresh_token);

      return res.status(200).json({
        success: true,
        step: 'complete',
        message: 'Ring authenticated successfully. Token saved.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid 2FA code';
      return res.status(422).json({
        error: message,
        step: '2fa_retry',
        message: 'Invalid code. Please try again.',
      });
    }
  }

  return res.status(400).json({ error: 'Invalid action. Use "start" or "verify".' });
}
