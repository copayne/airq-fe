import type { NextApiRequest, NextApiResponse } from 'next';

// Server-side only: FRESHRSS_INTERNAL_URL for Docker networking, falls back to NEXT_PUBLIC_ for dev
const FRESHRSS_INTERNAL_URL =
  process.env.FRESHRSS_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_FRESHRSS_URL ??
  'http://freshrss:80';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pathSegments = req.query.path;
  if (!pathSegments || !Array.isArray(pathSegments)) {
    res.status(400).json({ error: 'Missing path' });
    return;
  }

  const path = pathSegments.join('/');
  const targetUrl = new URL(`/api/greader.php/${path}`, FRESHRSS_INTERNAL_URL);

  // Forward query params (excluding the catch-all path)
  const queryParams = { ...req.query };
  delete queryParams.path;
  for (const [key, value] of Object.entries(queryParams)) {
    if (typeof value === 'string') {
      targetUrl.searchParams.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((v) => targetUrl.searchParams.append(key, v));
    }
  }

  // Build headers to forward
  const headers: Record<string, string> = {
    'Content-Type': req.headers['content-type'] ?? 'application/x-www-form-urlencoded',
  };
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }

  try {
    const fetchOptions: RequestInit = {
      method: req.method ?? 'GET',
      headers,
    };

    if (req.method === 'POST') {
      // Forward body — could be form-encoded or JSON
      if (typeof req.body === 'string') {
        fetchOptions.body = req.body;
      } else if (req.body) {
        // Next.js auto-parses form/json bodies into objects — re-encode as form data
        fetchOptions.body = new URLSearchParams(req.body as Record<string, string>).toString();
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);
    const contentType = response.headers.get('content-type') ?? 'text/plain';
    const body = await response.text();

    if (!response.ok) {
      console.error(`FreshRSS ${req.method} ${path} → ${response.status}:`, body.slice(0, 500));
    }

    res.setHeader('Content-Type', contentType);
    res.status(response.status).send(body);
  } catch (error) {
    console.error('FreshRSS proxy error:', error);
    res.status(502).json({ error: 'FreshRSS unreachable' });
  }
}
