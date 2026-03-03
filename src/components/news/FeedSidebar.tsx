import React, { useMemo, useCallback, useState } from 'react';
import { Rss, FolderOpen, Bookmark, RefreshCw } from 'lucide-react';
import { useRSS } from '~/context/RSSContext';
import { useToast } from '~/components/common/Toast';

const FeedSidebar: React.FC = () => {
  const { state, selectFeed, selectCategory, setFilter, totalUnread, refreshFeeds } = useRSS();
  const { feeds, categories, unreadCounts, selectedFeedId, selectedCategoryId, filter } = state;
  const { showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const feedTotal = useMemo(() => {
    let total = 0;
    for (const feed of feeds) {
      total += unreadCounts.get(feed.id) ?? 0;
    }
    return total;
  }, [feeds, unreadCounts]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
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
    setIsRefreshing(false);
  }, [feedTotal, refreshFeeds, showToast]);

  const categoryUnreadCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const cat of categories) {
      let total = 0;
      for (const feed of feeds) {
        if (feed.categories.some((fc) => fc.id === cat.id)) {
          total += unreadCounts.get(feed.id) ?? 0;
        }
      }
      counts.set(cat.id, total);
    }
    return counts;
  }, [categories, feeds, unreadCounts]);

  const visibleFeeds = useMemo(() => {
    if (!selectedCategoryId) return feeds;
    return feeds.filter((feed) => feed.categories.some((fc) => fc.id === selectedCategoryId));
  }, [feeds, selectedCategoryId]);

  const isAllSelected = selectedFeedId === null && selectedCategoryId === null && filter !== 'starred';

  return (
    <div className="flex flex-col h-full">
      {/* Feed list */}
      <div className="flex-1 overflow-y-auto px-1">
        {/* All Feeds */}
        <div className="flex items-center">
          <button
            onClick={() => { if (filter === 'starred') setFilter('unread'); void selectCategory(null); }}
            className={`flex-1 flex items-center justify-between px-3 py-2 text-left rounded transition-colors ${
              isAllSelected
                ? 'bg-airq-dark/10 border-l-2 border-l-airq-secondary'
                : 'hover:bg-airq-dark/5 border-l-2 border-l-transparent'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-mono font-medium truncate">
              <Rss className="w-3.5 h-3.5 flex-shrink-0" />
              All Feeds
            </span>
            {totalUnread > 0 && (
              <span className="bg-airq-secondary text-white rounded-full px-2 py-0.5 text-xs flex-shrink-0">
                {totalUnread}
              </span>
            )}
          </button>
          <button
            onClick={() => void handleRefresh()}
            className="p-1.5 text-airq-dark/30 hover:text-airq-dark/60 transition-colors flex-shrink-0"
            title="Refresh feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Bookmarked */}
        <button
          onClick={() => filter === 'starred' ? setFilter('unread') : setFilter('starred')}
          className={`w-full flex items-center justify-between px-3 py-1.5 text-left rounded transition-colors ${
            filter === 'starred'
              ? 'bg-airq-dark/10 border-l-2 border-l-airq-secondary'
              : 'hover:bg-airq-dark/5 border-l-2 border-l-transparent'
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-mono truncate">
            <Bookmark className="w-3.5 h-3.5 flex-shrink-0" />
            Bookmarked
          </span>
        </button>

        {/* Categories + feeds hidden in starred view */}
        {filter !== 'starred' && (
          <>
            {/* Categories */}
            {categories.length > 0 && (
              <div className="mt-1">
                {categories.map((cat) => {
                  const count = categoryUnreadCounts.get(cat.id) ?? 0;
                  const isSelected = selectedCategoryId === cat.id && selectedFeedId === null;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => void selectCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-left rounded transition-colors ${
                        isSelected
                          ? 'bg-airq-dark/10 border-l-2 border-l-airq-secondary'
                          : 'hover:bg-airq-dark/5 border-l-2 border-l-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-mono truncate pr-2">
                        <FolderOpen className="w-3.5 h-3.5 flex-shrink-0 text-airq-dark/50" />
                        {cat.label}
                      </span>
                      {count > 0 && (
                        <span className="bg-airq-secondary text-white rounded-full px-2 py-0.5 text-xs flex-shrink-0">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Divider between categories and feeds */}
            {categories.length > 0 && (
              <div className="border-t border-airq-dark/10 my-1" />
            )}

            {/* Individual feeds */}
            {visibleFeeds.map((feed) => {
              const count = unreadCounts.get(feed.id) ?? 0;
              const isSelected = selectedFeedId === feed.id;
              return (
                <button
                  key={feed.id}
                  onClick={() => void selectFeed(feed.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left rounded transition-colors ${
                    isSelected
                      ? 'bg-airq-dark/10 border-l-2 border-l-airq-secondary'
                      : 'hover:bg-airq-dark/5 border-l-2 border-l-transparent'
                  }`}
                >
                  <span className="text-sm font-mono truncate pr-2">{feed.title}</span>
                  {count > 0 && (
                    <span className="bg-airq-secondary text-white rounded-full px-2 py-0.5 text-xs flex-shrink-0">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Filter toggle */}
      <div className="border-t border-airq-dark/10 p-2 flex gap-1">
        <button
          onClick={() => setFilter('unread')}
          className={`flex-1 text-xs py-1.5 rounded font-mono transition-colors ${
            filter === 'unread'
              ? 'bg-airq-secondary text-airq-light'
              : 'bg-transparent text-airq-dark hover:bg-airq-dark/5'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 text-xs py-1.5 rounded font-mono transition-colors ${
            filter === 'all'
              ? 'bg-airq-secondary text-airq-light'
              : 'bg-transparent text-airq-dark hover:bg-airq-dark/5'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('starred')}
          className={`flex-1 text-xs py-1.5 rounded font-mono transition-colors ${
            filter === 'starred'
              ? 'bg-airq-secondary text-airq-light'
              : 'bg-transparent text-airq-dark hover:bg-airq-dark/5'
          }`}
        >
          Saved
        </button>
      </div>
    </div>
  );
};

export default FeedSidebar;
