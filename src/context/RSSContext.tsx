import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import { freshRSSService } from '~/services/FreshRSSService';
import { READ_TAG, STARRED_TAG, STARRED_STREAM } from '~/services/FreshRSSService';
import type { RSSCategory, RSSFeed, RSSItem, UnreadCount } from '~/services/FreshRSSService';

type FilterType = 'unread' | 'all' | 'starred';
type SortOrder = 'newest' | 'oldest';

interface RSSState {
  isAuthenticated: boolean;
  feeds: RSSFeed[];
  categories: RSSCategory[];
  unreadCounts: Map<string, number>;
  items: RSSItem[];
  selectedFeedId: string | null;
  selectedCategoryId: string | null;
  isLoading: boolean;
  error: string | null;
  continuation: string | undefined;
  filter: FilterType;
  sortOrder: SortOrder;
  isInitialized: boolean;
  hiddenItemIds: Set<string>;
}

type RSSAction =
  | { type: 'AUTH_SUCCESS' }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'SET_FEEDS'; payload: RSSFeed[] }
  | { type: 'SET_UNREAD_COUNTS'; payload: UnreadCount[] }
  | { type: 'SET_ITEMS'; payload: { items: RSSItem[]; continuation: string | undefined } }
  | { type: 'APPEND_ITEMS'; payload: { items: RSSItem[]; continuation: string | undefined } }
  | { type: 'SELECT_FEED'; payload: string | null }
  | { type: 'SELECT_CATEGORY'; payload: string | null }
  | { type: 'SET_FILTER'; payload: FilterType }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'MARK_READ'; payload: string[] }
  | { type: 'MARK_FEED_READ'; payload: string }
  | { type: 'HIDE_ITEM'; payload: string }
  | { type: 'TOGGLE_STAR'; payload: { itemId: string; starred: boolean } }
  | { type: 'SET_INITIALIZED' }
  | { type: 'SET_SORT_ORDER'; payload: SortOrder };

const initialState: RSSState = {
  isAuthenticated: false,
  feeds: [],
  categories: [],
  unreadCounts: new Map(),
  items: [],
  selectedFeedId: null,
  selectedCategoryId: null,
  isLoading: false,
  error: null,
  continuation: undefined,
  filter: 'unread',
  sortOrder: 'newest',
  isInitialized: false,
  hiddenItemIds: new Set(),
};

function rssReducer(state: RSSState, action: RSSAction): RSSState {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, isAuthenticated: true, error: null };
    case 'AUTH_FAILURE':
      return { ...state, isAuthenticated: false, error: action.payload, isLoading: false };
    case 'SET_FEEDS': {
      const catMap = new Map<string, string>();
      for (const feed of action.payload) {
        for (const cat of feed.categories) {
          catMap.set(cat.id, cat.label);
        }
      }
      const categoryOrder = ['News', 'Technology', 'Culture', 'Independent'];
      const categories = Array.from(catMap.entries()).map(([id, label]) => ({ id, label }));
      categories.sort((a, b) => {
        const ai = categoryOrder.indexOf(a.label);
        const bi = categoryOrder.indexOf(b.label);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.label.localeCompare(b.label);
      });
      return { ...state, feeds: action.payload, categories };
    }
    case 'SET_UNREAD_COUNTS': {
      const map = new Map<string, number>();
      for (const uc of action.payload) {
        map.set(uc.id, uc.count);
      }
      return { ...state, unreadCounts: map };
    }
    case 'SET_ITEMS':
      return { ...state, items: action.payload.items, continuation: action.payload.continuation, isLoading: false, hiddenItemIds: new Set() };
    case 'APPEND_ITEMS':
      return {
        ...state,
        items: [...state.items, ...action.payload.items],
        continuation: action.payload.continuation,
        isLoading: false,
      };
    case 'SELECT_FEED':
      return { ...state, selectedFeedId: action.payload, items: [], continuation: undefined, hiddenItemIds: new Set() };
    case 'SELECT_CATEGORY':
      return { ...state, selectedCategoryId: action.payload, selectedFeedId: null, items: [], continuation: undefined, hiddenItemIds: new Set() };
    case 'SET_FILTER':
      return { ...state, filter: action.payload, items: [], continuation: undefined, hiddenItemIds: new Set() };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'HIDE_ITEM': {
      const hiddenItemIds = new Set(state.hiddenItemIds);
      hiddenItemIds.add(action.payload);
      // Decrement unread count for this item's feed
      const item = state.items.find((i) => i.id === action.payload);
      if (item && !item.categories.includes(READ_TAG)) {
        const unreadCounts = new Map(state.unreadCounts);
        const feedId = item.origin.streamId;
        const current = unreadCounts.get(feedId) ?? 0;
        if (current > 0) unreadCounts.set(feedId, current - 1);
        return { ...state, hiddenItemIds, unreadCounts };
      }
      return { ...state, hiddenItemIds };
    }
    case 'MARK_READ': {
      const readIds = new Set(action.payload);
      const items = state.items.map((item) =>
        readIds.has(item.id) && !item.categories.includes(READ_TAG)
          ? { ...item, categories: [...item.categories, READ_TAG] }
          : item,
      );
      return { ...state, items };
    }
    case 'MARK_FEED_READ': {
      const isReadingList = action.payload.includes('/state/com.google/reading-list');
      const isCategoryId = action.payload.includes('/label/');
      const affectedFeedIds = new Set<string>();
      if (isReadingList) {
        for (const feed of state.feeds) {
          affectedFeedIds.add(feed.id);
        }
      } else if (isCategoryId) {
        for (const feed of state.feeds) {
          if (feed.categories.some((c) => c.id === action.payload)) {
            affectedFeedIds.add(feed.id);
          }
        }
      } else {
        affectedFeedIds.add(action.payload);
      }
      const items = state.items.map((item) =>
        affectedFeedIds.has(item.origin.streamId) && !item.categories.includes(READ_TAG)
          ? { ...item, categories: [...item.categories, READ_TAG] }
          : item,
      );
      const unreadCounts = new Map(state.unreadCounts);
      for (const feedId of affectedFeedIds) {
        unreadCounts.set(feedId, 0);
      }
      return { ...state, items, unreadCounts };
    }
    case 'TOGGLE_STAR': {
      const { itemId, starred } = action.payload;
      const items = state.items.map((item) => {
        if (item.id !== itemId) return item;
        const cats = item.categories.filter((c) => c !== STARRED_TAG);
        if (starred) cats.push(STARRED_TAG);
        return { ...item, categories: cats };
      });
      return { ...state, items };
    }
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: true };
    case 'SET_SORT_ORDER':
      return { ...state, sortOrder: action.payload };
    default:
      return state;
  }
}

interface RSSContextValue {
  state: RSSState;
  initialize: () => Promise<void>;
  selectFeed: (feedId: string | null) => Promise<void>;
  selectCategory: (categoryId: string | null) => Promise<void>;
  loadMore: () => Promise<void>;
  hideFromList: (itemId: string) => void;
  commitMarkAsRead: (itemId: string) => Promise<void>;
  markFeedAsRead: (feedId: string) => Promise<void>;
  toggleStar: (itemId: string) => Promise<void>;
  refreshFeeds: () => Promise<{ newTotal: number }>;
  setFilter: (filter: FilterType) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  totalUnread: number;
}

const RSSContext = createContext<RSSContextValue | undefined>(undefined);

export function RSSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rssReducer, initialState);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const committedReadsRef = useRef(new Set<string>());

  const fetchItems = useCallback(
    async (feedId: string | null, categoryId: string | null, filter: FilterType, append = false) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        let streamId: string;
        let excludeRead = false;

        if (filter === 'starred') {
          streamId = STARRED_STREAM;
        } else {
          streamId = feedId ?? categoryId ?? 'user/-/state/com.google/reading-list';
          excludeRead = filter === 'unread';
        }

        const result = await freshRSSService.getItems({
          streamId,
          excludeRead,
          continuation: append ? state.continuation ?? undefined : undefined,
        });
        const payload = { items: result.items, continuation: result.continuation };
        if (append) {
          dispatch({ type: 'APPEND_ITEMS', payload });
        } else {
          dispatch({ type: 'SET_ITEMS', payload });
        }
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to fetch items' });
      }
    },
    [state.continuation],
  );

  const initialize = useCallback(async () => {
    if (state.isInitialized) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    const savedToken = localStorage.getItem('rss_auth_token');
    if (savedToken) {
      freshRSSService.setAuthToken(savedToken);
      dispatch({ type: 'AUTH_SUCCESS' });
    } else {
      const username = process.env.NEXT_PUBLIC_FRESHRSS_USER;
      const password = process.env.NEXT_PUBLIC_FRESHRSS_API_PASSWORD;

      if (!username || !password) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'FreshRSS credentials not configured' });
        dispatch({ type: 'SET_INITIALIZED' });
        return;
      }

      try {
        const token = await freshRSSService.login(username, password);
        localStorage.setItem('rss_auth_token', token);
        dispatch({ type: 'AUTH_SUCCESS' });
      } catch (err) {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: err instanceof Error ? err.message : 'Login failed',
        });
        dispatch({ type: 'SET_INITIALIZED' });
        return;
      }
    }

    try {
      const [feeds, unreadCounts] = await Promise.all([
        freshRSSService.getFeeds(),
        freshRSSService.getUnreadCounts(),
      ]);
      dispatch({ type: 'SET_FEEDS', payload: feeds });
      dispatch({ type: 'SET_UNREAD_COUNTS', payload: unreadCounts });

      // Default to "All Feeds" (unread)
      const result = await freshRSSService.getItems({ excludeRead: true });
      dispatch({ type: 'SET_ITEMS', payload: { items: result.items, continuation: result.continuation } });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to load feeds' });
    }

    dispatch({ type: 'SET_INITIALIZED' });
  }, [state.isInitialized]);

  const flushPendingReads = useCallback(() => {
    const pending = [...state.hiddenItemIds].filter((id) => !committedReadsRef.current.has(id));
    if (pending.length === 0) return;
    for (const id of pending) committedReadsRef.current.add(id);
    dispatch({ type: 'MARK_READ', payload: pending });
    freshRSSService.markAsRead(pending).catch((err) => console.error('Failed to flush reads:', err));
  }, [state.hiddenItemIds]);

  const selectFeed = useCallback(
    async (feedId: string | null) => {
      flushPendingReads();
      dispatch({ type: 'SELECT_FEED', payload: feedId });
      await fetchItems(feedId, state.selectedCategoryId, state.filter);
    },
    [flushPendingReads, fetchItems, state.filter, state.selectedCategoryId],
  );

  const selectCategory = useCallback(
    async (categoryId: string | null) => {
      flushPendingReads();
      dispatch({ type: 'SELECT_CATEGORY', payload: categoryId });
      await fetchItems(null, categoryId, state.filter);
    },
    [flushPendingReads, fetchItems, state.filter],
  );

  const loadMore = useCallback(async () => {
    if (!state.continuation || state.isLoading) return;
    await fetchItems(state.selectedFeedId, state.selectedCategoryId, state.filter, true);
  }, [fetchItems, state.continuation, state.isLoading, state.selectedFeedId, state.selectedCategoryId, state.filter]);

  const hideFromList = useCallback((itemId: string) => {
    dispatch({ type: 'HIDE_ITEM', payload: itemId });
  }, []);

  const commitMarkAsRead = useCallback(async (itemId: string) => {
    if (committedReadsRef.current.has(itemId)) return;
    committedReadsRef.current.add(itemId);
    dispatch({ type: 'MARK_READ', payload: [itemId] });
    try {
      await freshRSSService.markAsRead([itemId]);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  const markFeedAsRead = useCallback(
    async (feedId: string) => {
      dispatch({ type: 'MARK_FEED_READ', payload: feedId });
      try {
        await freshRSSService.markFeedAsRead(feedId);
      } catch (err) {
        console.error('Failed to mark feed as read:', err);
      }
    },
    [],
  );

  const toggleStar = useCallback(async (itemId: string) => {
    const item = state.items.find((i) => i.id === itemId);
    if (!item) return;
    const isCurrentlyStarred = item.categories.includes(STARRED_TAG);
    const newStarred = !isCurrentlyStarred;

    dispatch({ type: 'TOGGLE_STAR', payload: { itemId, starred: newStarred } });

    // If bookmarking, also mark as read and hide from unread
    if (newStarred) {
      dispatch({ type: 'HIDE_ITEM', payload: itemId });
      if (!committedReadsRef.current.has(itemId)) {
        committedReadsRef.current.add(itemId);
        dispatch({ type: 'MARK_READ', payload: [itemId] });
        freshRSSService.markAsRead([itemId]).catch((err) => console.error('Failed to mark as read:', err));
      }
    }

    try {
      if (newStarred) {
        await freshRSSService.starItem([itemId]);
      } else {
        await freshRSSService.unstarItem([itemId]);
      }
    } catch (err) {
      console.error('Failed to toggle star:', err);
      dispatch({ type: 'TOGGLE_STAR', payload: { itemId, starred: isCurrentlyStarred } });
    }
  }, [state.items]);

  const refreshFeeds = useCallback(async (): Promise<{ newTotal: number }> => {
    flushPendingReads();
    const [feeds, unreadCounts] = await Promise.all([
      freshRSSService.getFeeds(),
      freshRSSService.getUnreadCounts(),
    ]);
    dispatch({ type: 'SET_FEEDS', payload: feeds });
    dispatch({ type: 'SET_UNREAD_COUNTS', payload: unreadCounts });
    // Re-fetch items for the current view
    await fetchItems(state.selectedFeedId, state.selectedCategoryId, state.filter);
    const feedIds = new Set(feeds.map((f) => f.id));
    let newTotal = 0;
    for (const uc of unreadCounts) {
      if (feedIds.has(uc.id)) newTotal += uc.count;
    }
    return { newTotal };
  }, [flushPendingReads, fetchItems, state.selectedFeedId, state.selectedCategoryId, state.filter]);

  const setFilter = useCallback(
    (filter: FilterType) => {
      flushPendingReads();
      dispatch({ type: 'SET_FILTER', payload: filter });
      void fetchItems(state.selectedFeedId, state.selectedCategoryId, filter);
    },
    [flushPendingReads, fetchItems, state.selectedFeedId, state.selectedCategoryId],
  );

  const setSortOrder = useCallback((sortOrder: SortOrder) => {
    dispatch({ type: 'SET_SORT_ORDER', payload: sortOrder });
  }, []);

  useEffect(() => {
    if (!state.isInitialized || !state.isAuthenticated) return;

    pollRef.current = setInterval(() => {
      void refreshFeeds();
    }, 120_000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [state.isInitialized, state.isAuthenticated, refreshFeeds]);

  const totalUnread = useMemo(() => {
    let total = 0;
    for (const feed of state.feeds) {
      total += state.unreadCounts.get(feed.id) ?? 0;
    }
    return total;
  }, [state.feeds, state.unreadCounts]);

  const contextValue = useMemo(
    () => ({
      state,
      initialize,
      selectFeed,
      selectCategory,
      loadMore,
      hideFromList,
      commitMarkAsRead,
      markFeedAsRead,
      toggleStar,
      refreshFeeds,
      setFilter,
      setSortOrder,
      totalUnread,
    }),
    [state, initialize, selectFeed, selectCategory, loadMore, hideFromList, commitMarkAsRead, markFeedAsRead, toggleStar, refreshFeeds, setFilter, setSortOrder, totalUnread],
  );

  return <RSSContext.Provider value={contextValue}>{children}</RSSContext.Provider>;
}

export function useRSS(): RSSContextValue {
  const context = useContext(RSSContext);
  if (context === undefined) {
    throw new Error('useRSS must be used within an RSSProvider');
  }
  return context;
}
