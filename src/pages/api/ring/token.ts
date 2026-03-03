/**
 * Next.js API Route for Ring Token Management
 *
 * GET: Returns current Ring connection status and token presence
 * POST: Accepts a new refresh token, persists it, and re-initializes the Ring API
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { RingApiManager } from '~/lib/ringApiManager';
import type { RingStatusInfo } from '~/lib/ringApiManager';

interface TokenStatusResponse extends RingStatusInfo {
  hasToken: boolean;
}

interface TokenUpdateResponse {
  success: boolean;
  status: RingStatusInfo;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenStatusResponse | TokenUpdateResponse | { error: string }>
) {
  const manager = RingApiManager.getInstance();

  if (req.method === 'GET') {
    const statusInfo = manager.getStatus();
    const hasToken = manager.hasToken();
    return res.status(200).json({ ...statusInfo, hasToken });
  }

  if (req.method === 'POST') {
    const body = req.body as { token?: string };
    const token = body?.token?.trim();

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const status = await manager.updateToken(token);
    const success = status.status === 'connected';
    return res.status(success ? 200 : 422).json({ success, status });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
