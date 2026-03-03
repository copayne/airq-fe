import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Loader2, RefreshCw } from 'lucide-react';
import { useRSS } from '~/context/RSSContext';
import { useToast } from '~/components/common/Toast';
import NewsItem from './NewsItem';
import ArticleReader, { hasSubstantiveContent } from './ArticleReader';
import type { RSSItem } from '~/services/FreshRSSService';

const ItemList: React.FC = () => {
  const { state, loadMore, hideFromList, commitMarkAsRead, markFeedAsRead, toggleStar, refreshFeeds, setSortOrder, setFilter } = useRSS();
  const { items, isLoading, continuation, selectedFeedId, selectedCategoryId, categories, feeds, filter, sortOrder, hiddenItemIds, unreadCounts } = state;
  const { showToast } = useToast();
  const [isMobileRefreshing, setIsMobileRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItemRef = useRef<RSSItem | null>(null);

  const selectedFeedName = selectedFeedId
    ? feeds.find((f) => f.id === selectedFeedId)?.title ?? 'Feed'
    : selectedCategoryId
      ? categories.find((c) => c.id === selectedCategoryId)?.label ?? 'Category'
      : filter === 'starred'
        ? 'Bookmarked'
        : 'All Feeds';

  const markAllStreamId = selectedFeedId ?? selectedCategoryId ?? 'user/-/state/com.google/reading-list';

  // Filter out hidden items in unread mode, then sort by published time
  const visibleItems = useMemo(() => {
    let filtered = items;
    if (filter === 'unread' && hiddenItemIds.size > 0) {
      filtered = items.filter((item) => !hiddenItemIds.has(item.id));
    }
    return [...filtered].sort((a, b) =>
      sortOrder === 'newest' ? b.published - a.published : a.published - b.published,
    );
  }, [items, hiddenItemIds, filter, sortOrder]);

  // Look up selected item from full items array, falling back to ref for stability during refreshes
  const selectedItem = useMemo(() => {
    if (!selectedItemId) {
      selectedItemRef.current = null;
      return null;
    }
    const found = items.find((i) => i.id === selectedItemId) ?? null;
    if (found) {
      selectedItemRef.current = found;
      return found;
    }
    // Item not in current items list (e.g. after background refresh) — use cached ref
    return selectedItemRef.current;
  }, [selectedItemId, items]);

  // Close reader when user explicitly switches feeds, categories, or filters
  useEffect(() => {
    if (selectedItemId) {
      void commitMarkAsRead(selectedItemId);
      setSelectedItemId(null);
      selectedItemRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFeedId, selectedCategoryId, filter]);

  // Compute prev/next neighbors from the full items array, skipping hidden ones
  const navInfo = useMemo(() => {
    if (!selectedItemId) return { hasPrev: false, hasNext: false, prevId: null as string | null, nextId: null as string | null };

    const origIdx = items.findIndex((i) => i.id === selectedItemId);
    if (origIdx < 0) return { hasPrev: false, hasNext: false, prevId: null as string | null, nextId: null as string | null };

    let prevId: string | null = null;
    for (let i = origIdx - 1; i >= 0; i--) {
      const candidate = items[i];
      if (candidate && !hiddenItemIds.has(candidate.id)) {
        prevId = candidate.id;
        break;
      }
    }

    let nextId: string | null = null;
    for (let i = origIdx + 1; i < items.length; i++) {
      const candidate = items[i];
      if (candidate && !hiddenItemIds.has(candidate.id)) {
        nextId = candidate.id;
        break;
      }
    }

    return { hasPrev: prevId !== null, hasNext: nextId !== null, prevId, nextId };
  }, [selectedItemId, items, hiddenItemIds]);

  const feedTotal = useMemo(() => {
    let total = 0;
    for (const feed of feeds) {
      total += unreadCounts.get(feed.id) ?? 0;
    }
    return total;
  }, [feeds, unreadCounts]);

  const handleMobileRefresh = useCallback(async () => {
    setIsMobileRefreshing(true);
    const oldTotal = feedTotal;
    try {
      const { newTotal } = await refreshFeeds();
      const diff = newTotal - oldTotal;
      if (diff > 0) {
        showToast('success', `${diff} new item${diff === 1 ? '' : 's'}`);
      } else {
        showToast('success', 'Feeds refreshed');
      }
    } catch {
      showToast('error', 'Failed to refresh feeds');
    }
    setIsMobileRefreshing(false);
  }, [feedTotal, refreshFeeds, showToast]);

  const handleMarkAllRead = useCallback(() => {
    if (markAllStreamId) {
      void markFeedAsRead(markAllStreamId);
    }
  }, [markAllStreamId, markFeedAsRead]);

  const handleToggleSort = useCallback(() => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  }, [sortOrder, setSortOrder]);

  const handleSelect = useCallback(
    (item: RSSItem) => {
      const content = item.summary?.content ?? '';
      if (hasSubstantiveContent(content)) {
        setSelectedItemId(item.id);
        if (filter === 'unread') {
          hideFromList(item.id);
        }
      } else {
        const articleUrl = item.canonical?.[0]?.href ?? item.origin?.htmlUrl ?? '#';
        window.open(articleUrl, '_blank', 'noopener,noreferrer');
        if (filter === 'unread') {
          hideFromList(item.id);
        }
        void commitMarkAsRead(item.id);
      }
    },
    [filter, hideFromList, commitMarkAsRead],
  );

  const handleBookmark = useCallback(
    (itemId: string) => {
      void toggleStar(itemId);
    },
    [toggleStar],
  );

  const handleMarkRead = useCallback(
    (itemId: string) => {
      if (filter === 'unread') {
        hideFromList(itemId);
      }
      void commitMarkAsRead(itemId);
    },
    [filter, hideFromList, commitMarkAsRead],
  );

  const handleCloseReader = useCallback(() => {
    if (selectedItemId) {
      void commitMarkAsRead(selectedItemId);
    }
    setSelectedItemId(null);
    selectedItemRef.current = null;
  }, [selectedItemId, commitMarkAsRead]);

  const handleNavigate = useCallback(
    (direction: 'prev' | 'next') => {
      const targetId = direction === 'next' ? navInfo.nextId : navInfo.prevId;
      if (!targetId) return;

      // Commit read for the article we're navigating away from
      if (selectedItemId) {
        void commitMarkAsRead(selectedItemId);
      }

      setSelectedItemId(targetId);
      if (filter === 'unread') {
        hideFromList(targetId);
      }
    },
    [navInfo, selectedItemId, commitMarkAsRead, filter, hideFromList],
  );

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isLoading || !continuation) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (nearBottom) {
      void loadMore();
    }
  }, [isLoading, continuation, loadMore]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="border-b border-airq-dark/10 px-4 py-2 flex justify-between items-center flex-shrink-0">
        <span className="text-sm font-mono font-medium text-airq-dark truncate">
          <span className="sm:hidden flex gap-3">
            <button
              onClick={() => setFilter('unread')}
              className={`transition-colors ${filter !== 'starred' ? 'text-airq-dark' : 'text-airq-dark/30'}`}
            >
              All Feeds
            </button>
            <button
              onClick={() => setFilter('starred')}
              className={`transition-colors ${filter === 'starred' ? 'text-airq-dark' : 'text-airq-dark/30'}`}
            >
              Bookmarked
            </button>
          </span>
          <span className="hidden sm:inline">{selectedFeedName}</span>
        </span>
        <div className="flex items-center gap-2">
          {/* Mobile refresh */}
          <button
            onClick={() => void handleMobileRefresh()}
            className="sm:hidden p-1 text-airq-dark/30 hover:text-airq-dark/60 transition-colors"
            title="Refresh feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isMobileRefreshing ? 'animate-spin' : ''}`} />
          </button>
          {/* Sort toggle */}
          <button
            onClick={handleToggleSort}
            className="p-1 text-airq-dark/30 hover:text-airq-dark/60 transition-colors"
            title={sortOrder === 'newest' ? 'Showing newest first' : 'Showing oldest first'}
          >
            {sortOrder === 'newest' ? (
              <ArrowDownWideNarrow className="w-3.5 h-3.5" />
            ) : (
              <ArrowUpNarrowWide className="w-3.5 h-3.5" />
            )}
          </button>
          {/* Desktop mark all read */}
          {filter !== 'starred' && (
            <button
              onClick={handleMarkAllRead}
              className="hidden sm:inline text-xs text-airq-contrast hover:underline cursor-pointer font-mono"
            >
              mark all read
            </button>
          )}
        </div>
      </div>

      {/* Item list */}
      <div ref={scrollRef} className="overflow-y-auto flex-1">
        {visibleItems.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-airq-dark/40 text-sm font-mono">
              {filter === 'unread' ? 'No unread items' : filter === 'starred' ? 'No bookmarked items' : 'No items'}
            </span>
          </div>
        ) : (
          <>
            {visibleItems.map((item) => (
              <NewsItem
                key={item.id}
                item={item}
                onSelect={handleSelect}
                onBookmark={handleBookmark}
                onMarkRead={handleMarkRead}
              />
            ))}
            {isLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-airq-dark/40" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Article reading modal */}
      {selectedItem && (
        <ArticleReader
          item={selectedItem}
          onClose={handleCloseReader}
          onNavigate={handleNavigate}
          onBookmark={handleBookmark}
          hasPrev={navInfo.hasPrev}
          hasNext={navInfo.hasNext}
        />
      )}
    </div>
  );
};

export default ItemList;
