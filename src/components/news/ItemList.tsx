import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { useRSS } from '~/context/RSSContext';
import { useToast } from '~/components/common/Toast';
import NewsItem from './NewsItem';
import { hasSubstantiveContent } from '~/lib/articleUtils';
import { normalizeText } from '~/lib/cleanArticleContent';
import type { RSSItem } from '~/services/FreshRSSService';
import { READING_LIST_STREAM } from '~/services/FreshRSSService';
import { useReadingStats } from '~/hooks/useReadingStats';

interface ItemListProps {
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
}

const ItemList: React.FC<ItemListProps> = ({ selectedItemId, onSelectItem }) => {
  const { state, loadMore, commitMarkAsRead, markFeedAsRead, toggleStar, refreshFeeds, setSortOrder, setFilter, totalUnread } = useRSS();
  const { items, isLoading, continuation, selectedFeedId, selectedCategoryId, categories, feeds, filter, sortOrder, hiddenItemIds } = state;
  const { showToast } = useToast();
  const { recordRead } = useReadingStats();
  const [isMobileRefreshing, setIsMobileRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedFeedName = selectedFeedId
    ? feeds.find((f) => f.id === selectedFeedId)?.title ?? 'Feed'
    : selectedCategoryId
      ? categories.find((c) => c.id === selectedCategoryId)?.label ?? 'Category'
      : filter === 'starred'
        ? 'Bookmarked'
        : 'All Feeds';

  const markAllStreamId = selectedFeedId ?? selectedCategoryId ?? READING_LIST_STREAM;

  // Filter out hidden items, deduplicate, then sort by published time
  const { visibleItems, alsoFrom } = useMemo(() => {
    let filtered = items;
    if (filter === 'unread' && hiddenItemIds.size > 0) {
      filtered = items.filter((item) => !hiddenItemIds.has(item.id));
    }

    // Group duplicates by canonical URL or normalized title
    const groups = new Map<string, RSSItem[]>();
    for (const item of filtered) {
      const canonicalUrl = item.canonical?.[0]?.href;
      const key = canonicalUrl ?? `title:${normalizeText(item.title)}`;
      const existing = groups.get(key);
      if (existing) {
        existing.push(item);
      } else {
        groups.set(key, [item]);
      }
    }

    const deduped: RSSItem[] = [];
    const alsoFromMap = new Map<string, string[]>();
    for (const group of groups.values()) {
      group.sort((a, b) => a.published - b.published);
      const primary = group[0]!;
      deduped.push(primary);

      if (group.length > 1) {
        const otherFeeds = [...new Set(
          group
            .slice(1)
            .map((item) => item.origin?.title)
            .filter((name): name is string => !!name && name !== primary.origin?.title),
        )];
        if (otherFeeds.length > 0) {
          alsoFromMap.set(primary.id, otherFeeds);
        }
      }
    }

    const searched = searchQuery
      ? deduped.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : deduped;

    searched.sort((a, b) =>
      sortOrder === 'newest' ? b.published - a.published : a.published - b.published,
    );

    return { visibleItems: searched, alsoFrom: alsoFromMap };
  }, [items, hiddenItemIds, filter, sortOrder, searchQuery]);

  // Clear search when user switches feeds, categories, or filters
  useEffect(() => {
    setSearchQuery('');
    setSearchOpen(false);
  }, [selectedFeedId, selectedCategoryId, filter]);

  const handleMobileRefresh = useCallback(async () => {
    setIsMobileRefreshing(true);
    const oldTotal = totalUnread;
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
  }, [totalUnread, refreshFeeds, showToast]);

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
      recordRead(item.origin?.title ?? '', content);
      void commitMarkAsRead(item.id);
      if (hasSubstantiveContent(content)) {
        onSelectItem(item.id);
      } else {
        const articleUrl = item.canonical?.[0]?.href ?? item.origin?.htmlUrl ?? '#';
        window.open(articleUrl, '_blank', 'noopener,noreferrer');
      }
    },
    [commitMarkAsRead, recordRead, onSelectItem],
  );

  const handleBookmark = useCallback(
    (itemId: string) => {
      void toggleStar(itemId);
    },
    [toggleStar],
  );

  const handleMarkRead = useCallback(
    (itemId: string) => {
      void commitMarkAsRead(itemId);
    },
    [commitMarkAsRead],
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
          {/* Desktop search */}
          {searchOpen ? (
            <div className="hidden sm:flex items-center gap-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                    setSearchOpen(false);
                  }
                }}
                placeholder="search..."
                className="w-40 text-xs font-mono bg-transparent border-b border-airq-dark/20 focus:border-airq-secondary outline-none py-0.5 text-airq-dark placeholder:text-airq-dark/30 transition-colors"
              />
              <button
                onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                className="p-1 text-airq-dark/30 hover:text-airq-dark/60 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 0); }}
              className="hidden sm:block p-1 text-airq-dark/30 hover:text-airq-dark/60 transition-colors"
              title="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
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
              {searchQuery ? 'No matches' : filter === 'unread' ? 'No unread items' : filter === 'starred' ? 'No bookmarked items' : 'No items'}
            </span>
          </div>
        ) : (
          <>
            {visibleItems.map((item) => (
              <NewsItem
                key={item.id}
                item={item}
                alsoFrom={alsoFrom.get(item.id)}
                isSelected={item.id === selectedItemId}
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
    </div>
  );
};

export default ItemList;
