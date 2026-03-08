const PROXY_BASE = '/api/rss';

export const READ_TAG = 'user/-/state/com.google/read';
export const STARRED_TAG = 'user/-/state/com.google/starred';
export const STARRED_STREAM = 'user/-/state/com.google/starred';
export const READING_LIST_STREAM = 'user/-/state/com.google/reading-list';

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
  author?: string;
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
      streamId = READING_LIST_STREAM,
      count = 50,
      excludeRead = false,
      continuation,
    } = options;

    const params = new URLSearchParams({
      output: 'json',
      n: String(count),
    });
    if (excludeRead) {
      params.set('xt', READ_TAG);
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

  private async editTag(action: 'a' | 'r', tag: string, itemIds: string[]): Promise<void> {
    const token = await this.getToken();
    const body = new URLSearchParams();
    body.set(action, tag);
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
    if (!res.ok) throw new Error(`editTag failed: ${res.status}`);
  }

  async markAsRead(itemIds: string[]): Promise<void> {
    return this.editTag('a', READ_TAG, itemIds);
  }

  async starItem(itemIds: string[]): Promise<void> {
    return this.editTag('a', STARRED_TAG, itemIds);
  }

  async unstarItem(itemIds: string[]): Promise<void> {
    return this.editTag('r', STARRED_TAG, itemIds);
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
  private async editSubscriptionRequest(params: URLSearchParams): Promise<void> {
    const token = await this.getToken();
    params.set('T', token);

    const res = await fetch(`${PROXY_BASE}/reader/api/0/subscription/edit`, {
      method: 'POST',
      headers: {
        ...this.authHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    if (!res.ok) throw new Error(`subscription/edit failed: ${res.status}`);
  }

  async subscribeFeed(feedUrl: string, title?: string, categoryId?: string): Promise<void> {
    const params = new URLSearchParams({ ac: 'subscribe', s: `feed/${feedUrl}` });
    if (title) params.set('t', title);
    if (categoryId) params.set('a', categoryId);
    return this.editSubscriptionRequest(params);
  }

  async editSubscription(feedId: string, title?: string, addCategory?: string, removeCategory?: string): Promise<void> {
    const params = new URLSearchParams({ ac: 'edit', s: feedId });
    if (title) params.set('t', title);
    if (addCategory) params.set('a', addCategory);
    if (removeCategory) params.set('r', removeCategory);
    return this.editSubscriptionRequest(params);
  }

  async unsubscribeFeed(feedId: string): Promise<void> {
    return this.editSubscriptionRequest(new URLSearchParams({ ac: 'unsubscribe', s: feedId }));
  }
}

export const freshRSSService = new FreshRSSService();
