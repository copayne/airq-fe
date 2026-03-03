const PROXY_BASE = '/api/rss';

export const READ_TAG = 'user/-/state/com.google/read';
export const STARRED_TAG = 'user/-/state/com.google/starred';
export const STARRED_STREAM = 'user/-/state/com.google/starred';

export interface RSSFeed {
  id: string;
  title: string;
  url: string;
  htmlUrl: string;
  categories: { id: string; label: string }[];
}

export interface RSSItem {
  id: string;
  title: string;
  published: number;
  canonical: { href: string }[];
  origin: { streamId: string; title: string; htmlUrl: string };
  summary: { content: string };
  categories: string[];
}

export interface RSSCategory {
  id: string;
  label: string;
}

export interface UnreadCount {
  id: string;
  count: number;
  newestItemTimestampUsec: string;
}

export interface StreamContentsResponse {
  items: RSSItem[];
  continuation?: string;
}

interface GetItemsOptions {
  streamId?: string;
  count?: number;
  excludeRead?: boolean;
  continuation?: string;
}

class FreshRSSService {
  private authToken: string | null = null;

  async login(username: string, password: string): Promise<string> {
    const res = await fetch(`${PROXY_BASE}/accounts/ClientLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ Email: username, Passwd: password }).toString(),
    });

    if (!res.ok) {
      throw new Error(`Login failed: ${res.status}`);
    }

    const text = await res.text();
    const authMatch = text.match(/Auth=(.+)/);
    if (!authMatch?.[1]) {
      throw new Error('No auth token in login response');
    }

    this.authToken = authMatch[1].trim();
    return this.authToken;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private authHeaders(): Record<string, string> {
    if (!this.authToken) throw new Error('Not authenticated');
    return { Authorization: `GoogleLogin auth=${this.authToken}` };
  }

  async getFeeds(): Promise<RSSFeed[]> {
    const res = await fetch(
      `${PROXY_BASE}/reader/api/0/subscription/list?output=json`,
      { headers: this.authHeaders() },
    );
    if (!res.ok) throw new Error(`getFeeds failed: ${res.status}`);
    const data = (await res.json()) as { subscriptions: RSSFeed[] };
    return data.subscriptions ?? [];
  }

  async getUnreadCounts(): Promise<UnreadCount[]> {
    const res = await fetch(
      `${PROXY_BASE}/reader/api/0/unread-count?output=json`,
      { headers: this.authHeaders() },
    );
    if (!res.ok) throw new Error(`getUnreadCounts failed: ${res.status}`);
    const data = (await res.json()) as { unreadcounts: UnreadCount[] };
    return data.unreadcounts ?? [];
  }

  async getItems(options: GetItemsOptions = {}): Promise<StreamContentsResponse> {
    const {
      streamId = 'user/-/state/com.google/reading-list',
      count = 50,
      excludeRead = false,
      continuation,
    } = options;

    const params = new URLSearchParams({
      output: 'json',
      n: String(count),
    });
    if (excludeRead) {
      params.set('xt', 'user/-/state/com.google/read');
    }
    if (continuation) {
      params.set('c', continuation);
    }

    const encodedStream = encodeURIComponent(streamId);
    const res = await fetch(
      `${PROXY_BASE}/reader/api/0/stream/contents/${encodedStream}?${params.toString()}`,
      { headers: this.authHeaders() },
    );
    if (!res.ok) throw new Error(`getItems failed: ${res.status}`);

    const data = (await res.json()) as StreamContentsResponse;
    return { items: data.items ?? [], continuation: data.continuation };
  }

  async getToken(): Promise<string> {
    const res = await fetch(`${PROXY_BASE}/reader/api/0/token`, {
      headers: this.authHeaders(),
    });
    if (!res.ok) throw new Error(`getToken failed: ${res.status}`);
    return (await res.text()).trim();
  }

  async markAsRead(itemIds: string[]): Promise<void> {
    const token = await this.getToken();
    const body = new URLSearchParams();
    body.set('a', 'user/-/state/com.google/read');
    body.set('T', token);
    for (const id of itemIds) {
      body.append('i', id);
    }

    const res = await fetch(`${PROXY_BASE}/reader/api/0/edit-tag`, {
      method: 'POST',
      headers: {
        ...this.authHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    if (!res.ok) throw new Error(`markAsRead failed: ${res.status}`);
  }

  async starItem(itemIds: string[]): Promise<void> {
    const token = await this.getToken();
    const body = new URLSearchParams();
    body.set('a', STARRED_TAG);
    body.set('T', token);
    for (const id of itemIds) {
      body.append('i', id);
    }

    const res = await fetch(`${PROXY_BASE}/reader/api/0/edit-tag`, {
      method: 'POST',
      headers: {
        ...this.authHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    if (!res.ok) throw new Error(`starItem failed: ${res.status}`);
  }

  async unstarItem(itemIds: string[]): Promise<void> {
    const token = await this.getToken();
    const body = new URLSearchParams();
    body.set('r', STARRED_TAG);
    body.set('T', token);
    for (const id of itemIds) {
      body.append('i', id);
    }

    const res = await fetch(`${PROXY_BASE}/reader/api/0/edit-tag`, {
      method: 'POST',
      headers: {
        ...this.authHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    if (!res.ok) throw new Error(`unstarItem failed: ${res.status}`);
  }

  async markFeedAsRead(feedId: string): Promise<void> {
    const token = await this.getToken();
    const ts = String(Date.now() * 1000); // microseconds
    const body = new URLSearchParams({ s: feedId, ts, T: token });

    const res = await fetch(`${PROXY_BASE}/reader/api/0/mark-all-as-read`, {
      method: 'POST',
      headers: {
        ...this.authHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    if (!res.ok) throw new Error(`markFeedAsRead failed: ${res.status}`);
  }
}

export const freshRSSService = new FreshRSSService();
