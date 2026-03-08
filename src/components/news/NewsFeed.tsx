import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import Layout from '../layout/Layout';
import FeedSidebar from './FeedSidebar';
import ItemList from './ItemList';
import FeedManager from './FeedManager';
import ArticleReader from './ArticleReader';
import { useRSS } from '~/context/RSSContext';
import type { RSSItem } from '~/services/FreshRSSService';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

const PANEL = 'bg-airq-light/95 rounded border-airq-dark border overflow-hidden';

const NewsFeed: React.FC = () => {
  const { state, initialize, commitMarkAsRead, toggleStar } = useRSS();
  const isDesktop = useIsDesktop();

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItemRef = useRef<RSSItem | null>(null);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  // Look up selected item from items array, with ref fallback for stability during refreshes
  const selectedItem = useMemo(() => {
    if (!selectedItemId) {
      selectedItemRef.current = null;
      return null;
    }
    const found = state.items.find((i) => i.id === selectedItemId) ?? null;
    if (found) {
      selectedItemRef.current = found;
      return found;
    }
    return selectedItemRef.current;
  }, [selectedItemId, state.items]);

  // Compute prev/next for navigation
  const navInfo = useMemo(() => {
    if (!selectedItemId) return { hasPrev: false, hasNext: false, prevId: null as string | null, nextId: null as string | null };
    const origIdx = state.items.findIndex((i) => i.id === selectedItemId);
    if (origIdx < 0) return { hasPrev: false, hasNext: false, prevId: null as string | null, nextId: null as string | null };

    let prevId: string | null = null;
    for (let i = origIdx - 1; i >= 0; i--) {
      const candidate = state.items[i];
      if (candidate && !state.hiddenItemIds.has(candidate.id)) {
        prevId = candidate.id;
        break;
      }
    }

    let nextId: string | null = null;
    for (let i = origIdx + 1; i < state.items.length; i++) {
      const candidate = state.items[i];
      if (candidate && !state.hiddenItemIds.has(candidate.id)) {
        nextId = candidate.id;
        break;
      }
    }

    return { hasPrev: prevId !== null, hasNext: nextId !== null, prevId, nextId };
  }, [selectedItemId, state.items, state.hiddenItemIds]);

  // Close reader when user switches feeds, categories, or filters
  useEffect(() => {
    if (selectedItemId) {
      void commitMarkAsRead(selectedItemId);
      setSelectedItemId(null);
      selectedItemRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedFeedId, state.selectedCategoryId, state.filter]);

  const handleSelectItem = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
  }, []);

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
      if (selectedItemId) {
        void commitMarkAsRead(selectedItemId);
      }
      setSelectedItemId(targetId);
    },
    [navInfo, selectedItemId, commitMarkAsRead],
  );

  const handleBookmark = useCallback(
    (itemId: string) => {
      void toggleStar(itemId);
    },
    [toggleStar],
  );

  if (!state.isInitialized) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-airq-dark/40" />
        </div>
      </Layout>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <div className="bg-airq-light/95 rounded border-airq-dark border p-6 max-w-sm text-center">
            <p className="text-sm font-mono text-airq-dark/60">
              {state.error ?? 'FreshRSS not configured. Set NEXT_PUBLIC_FRESHRSS_URL, NEXT_PUBLIC_FRESHRSS_USER, and NEXT_PUBLIC_FRESHRSS_API_PASSWORD.'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex sm:px-6 sm:py-2 md:px-12 md:py-4 sm:gap-2">
        {/* ── Sidebar panel (desktop) ── */}
        <div className={`hidden sm:flex flex-col sm:w-[250px] flex-shrink-0 h-full ${PANEL} pt-3`}>
          <FeedSidebar />
        </div>

        {/* ── Article list panel ── */}
        <div className={`flex flex-col h-full min-w-0 sm:w-[400px] sm:flex-shrink-0 bg-airq-light/95 sm:rounded sm:border-airq-dark sm:border overflow-hidden ${
          selectedItem ? 'hidden sm:flex' : 'flex-1 sm:flex-initial'
        }`}>
          {state.view === 'manage' ? (
            <FeedManager />
          ) : (
            <ItemList
              selectedItemId={selectedItemId}
              onSelectItem={handleSelectItem}
            />
          )}
        </div>

        {/* ── Reader panel (desktop) ── */}
        <div className={`hidden sm:flex flex-col flex-1 min-w-0 h-full ${PANEL}`}>
          {selectedItem ? (
            <ArticleReader
              item={selectedItem}
              onClose={handleCloseReader}
              onNavigate={handleNavigate}
              onBookmark={handleBookmark}
              hasPrev={navInfo.hasPrev}
              hasNext={navInfo.hasNext}
              inline
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-airq-dark/30 text-sm font-mono">select an article</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile modal reader ── */}
      {selectedItem && !isDesktop && (
        <ArticleReader
          item={selectedItem}
          onClose={handleCloseReader}
          onNavigate={handleNavigate}
          onBookmark={handleBookmark}
          hasPrev={navInfo.hasPrev}
          hasNext={navInfo.hasNext}
        />
      )}
    </Layout>
  );
};

export default NewsFeed;
