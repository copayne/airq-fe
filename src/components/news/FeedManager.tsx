import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Plus, ExternalLink, ChevronRight } from 'lucide-react';
import { useRSS } from '~/context/RSSContext';
import { useToast } from '~/components/common/Toast';
import { getRelativeTime } from '~/utils/dateUtils';
import type { RSSFeed } from '~/services/FreshRSSService';

interface FeedFormState {
  url: string;
  title: string;
  categoryId: string;
}

const emptyForm: FeedFormState = { url: '', title: '', categoryId: '' };

function feedHealth(timestampMs: number | undefined): { label: string; color: string } {
  if (!timestampMs) return { label: 'no data', color: 'bg-airq-dark/20' };
  const hoursAgo = (Date.now() - timestampMs) / 3600000;
  if (hoursAgo < 24) return { label: 'active', color: 'bg-green-500' };
  if (hoursAgo < 48) return { label: 'idle', color: 'bg-yellow-500' };
  return { label: 'stale', color: 'bg-red-400' };
}

function timestampToRelative(timestampMs: number | undefined): string {
  if (!timestampMs) return 'never';
  return getRelativeTime(new Date(timestampMs).toISOString(), 'never');
}

const sidebarItemClass = (isSelected: boolean) =>
  `w-full flex items-center gap-2 px-4 py-2 text-left transition-colors ${
    isSelected
      ? 'bg-airq-dark/10 border-l-2 border-l-airq-secondary'
      : 'hover:bg-airq-dark/5 border-l-2 border-l-transparent'
  }`;

interface FeedListItemProps {
  feed: RSSFeed;
  isSelected: boolean;
  healthColor: string;
  healthLabel: string;
  onSelect: () => void;
}

const FeedListItem: React.FC<FeedListItemProps> = ({ feed, isSelected, healthColor, healthLabel, onSelect }) => (
  <button
    onClick={onSelect}
    className={sidebarItemClass(isSelected)}
  >
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${healthColor}`} title={healthLabel} />
    <span className="text-sm font-mono text-airq-dark truncate flex-1">{feed.title}</span>
    <ChevronRight className="w-3 h-3 text-airq-dark/20 flex-shrink-0 sm:hidden" />
  </button>
);

const FeedManager: React.FC = () => {
  const { state, subscribeFeed, editSubscription, unsubscribeFeed, setView } = useRSS();
  const { feeds, categories, unreadCounts, feedTimestamps } = state;
  const { showToast } = useToast();

  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [form, setForm] = useState<FeedFormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mode, setMode] = useState<'browse' | 'add'>('browse');
  const urlInputRef = useRef<HTMLInputElement>(null);

  const selectedFeed = useMemo(
    () => feeds.find((f) => f.id === selectedFeedId) ?? null,
    [feeds, selectedFeedId],
  );

  useEffect(() => {
    if (selectedFeed) {
      setForm({
        url: selectedFeed.url,
        title: selectedFeed.title,
        categoryId: selectedFeed.categories[0]?.id ?? '',
      });
      setConfirmDelete(false);
      setMode('browse');
    }
  }, [selectedFeed]);

  const feedsByCategory = useMemo(() => {
    const grouped = new Map<string, RSSFeed[]>();
    const uncategorized: RSSFeed[] = [];

    for (const feed of feeds) {
      if (feed.categories.length === 0) {
        uncategorized.push(feed);
      } else {
        for (const cat of feed.categories) {
          const list = grouped.get(cat.id) ?? [];
          list.push(feed);
          grouped.set(cat.id, list);
        }
      }
    }

    return { grouped, uncategorized };
  }, [feeds]);

  const handleStartAdd = useCallback(() => {
    setSelectedFeedId(null);
    setForm(emptyForm);
    setMode('add');
    setTimeout(() => urlInputRef.current?.focus(), 0);
  }, []);

  const handleAdd = useCallback(async () => {
    if (!form.url.trim()) return;
    setIsSubmitting(true);
    try {
      await subscribeFeed(
        form.url.trim(),
        form.title.trim() || undefined,
        form.categoryId ? form.categoryId : undefined,
      );
      showToast('success', 'Feed added');
      setForm(emptyForm);
      setMode('browse');
    } catch {
      showToast('error', 'Failed to add feed');
    }
    setIsSubmitting(false);
  }, [form, subscribeFeed, showToast]);

  const handleSave = useCallback(async () => {
    if (!selectedFeed) return;
    setIsSubmitting(true);
    try {
      const urlChanged = form.url.trim() !== selectedFeed.url;

      if (urlChanged) {
        await unsubscribeFeed(selectedFeed.id);
        await subscribeFeed(
          form.url.trim(),
          form.title.trim() || undefined,
          form.categoryId ? form.categoryId : undefined,
        );
        setSelectedFeedId(null);
      } else {
        const currentCatId = selectedFeed.categories[0]?.id;
        const newTitle = form.title.trim() !== selectedFeed.title ? form.title.trim() : undefined;
        const addCat = form.categoryId && form.categoryId !== currentCatId ? form.categoryId : undefined;
        const removeCat = currentCatId && form.categoryId !== currentCatId ? currentCatId : undefined;

        if (newTitle ?? addCat ?? removeCat) {
          await editSubscription(selectedFeed.id, newTitle, addCat, removeCat);
        }
      }
      showToast('success', 'Feed updated');
    } catch {
      showToast('error', 'Failed to update feed');
    }
    setIsSubmitting(false);
  }, [selectedFeed, form, editSubscription, subscribeFeed, unsubscribeFeed, showToast]);

  const handleDelete = useCallback(async () => {
    if (!selectedFeed) return;
    try {
      await unsubscribeFeed(selectedFeed.id);
      showToast('success', 'Feed removed');
      setSelectedFeedId(null);
      setConfirmDelete(false);
    } catch {
      showToast('error', 'Failed to remove feed');
    }
  }, [selectedFeed, unsubscribeFeed, showToast]);

  const hasChanges = useMemo(() => {
    if (!selectedFeed) return false;
    return (
      form.url.trim() !== selectedFeed.url ||
      form.title.trim() !== selectedFeed.title ||
      (form.categoryId ?? '') !== (selectedFeed.categories[0]?.id ?? '')
    );
  }, [selectedFeed, form]);

  const handleSelectFeed = useCallback((feedId: string) => {
    setSelectedFeedId(feedId);
    setMode('browse');
  }, []);

  const renderFeedList = (feedList: RSSFeed[]) =>
    feedList.map((feed) => {
      const health = feedHealth(feedTimestamps.get(feed.id));
      return (
        <FeedListItem
          key={feed.id}
          feed={feed}
          isSelected={selectedFeedId === feed.id}
          healthColor={health.color}
          healthLabel={health.label}
          onSelect={() => handleSelectFeed(feed.id)}
        />
      );
    });

  const isAddMode = mode === 'add';
  const showDetail = isAddMode || selectedFeed !== null;

  return (
    <div className="flex flex-col h-full sm:flex-row">
      {/* ── Feed list panel ── */}
      <div className={`flex flex-col border-r border-airq-dark/10 sm:w-72 flex-shrink-0 ${showDetail ? 'hidden sm:flex' : 'flex flex-1'}`}>
        {/* List header */}
        <div className="border-b border-airq-dark/10 px-4 py-2 flex justify-between items-center flex-shrink-0">
          <span className="text-sm font-mono font-medium text-airq-dark">Feeds</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleStartAdd}
              className="flex items-center gap-1 text-xs font-mono text-airq-contrast hover:underline transition-colors"
            >
              <Plus className="w-3 h-3" />
              add
            </button>
            <button
              onClick={() => setView('feed')}
              className="text-xs font-mono text-airq-dark/40 hover:text-airq-dark/70 transition-colors"
            >
              done
            </button>
          </div>
        </div>

        {/* Feed list */}
        <div className="overflow-y-auto flex-1">
          {categories.map((cat) => {
            const catFeeds = feedsByCategory.grouped.get(cat.id) ?? [];
            if (catFeeds.length === 0) return null;

            return (
              <div key={cat.id}>
                <div className="px-4 py-1.5 text-[10px] font-mono text-airq-dark/40 uppercase tracking-widest mt-2 first:mt-0">
                  {cat.label}
                </div>
                {renderFeedList(catFeeds)}
              </div>
            );
          })}

          {feedsByCategory.uncategorized.length > 0 && (
            <div>
              <div className="px-4 py-1.5 text-[10px] font-mono text-airq-dark/40 uppercase tracking-widest mt-2">
                Uncategorized
              </div>
              {renderFeedList(feedsByCategory.uncategorized)}
            </div>
          )}

          {feeds.length === 0 && (
            <div className="flex items-center justify-center h-32">
              <span className="text-airq-dark/40 text-sm font-mono">No feeds</span>
            </div>
          )}
        </div>

        {/* Feed count */}
        <div className="border-t border-airq-dark/10 px-4 py-2 flex-shrink-0">
          <span className="text-[10px] font-mono text-airq-dark/30">{feeds.length} feed{feeds.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Detail / edit panel ── */}
      {showDetail ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Detail header */}
          <div className="border-b border-airq-dark/10 px-4 py-2 flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => { setSelectedFeedId(null); setMode('browse'); }}
              className="sm:hidden text-xs font-mono text-airq-dark/40 hover:text-airq-dark/70 transition-colors"
            >
              back
            </button>
            <span className="text-sm font-mono font-medium text-airq-dark flex-1 truncate">
              {isAddMode ? 'New Feed' : selectedFeed?.title ?? ''}
            </span>
            {selectedFeed && !isAddMode && (
              <a
                href={selectedFeed.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-airq-dark/30 hover:text-airq-contrast transition-colors"
                title="Visit site"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-5 max-w-lg">
              {/* Feed status (edit mode only) */}
              {selectedFeed && !isAddMode && (() => {
                const health = feedHealth(feedTimestamps.get(selectedFeed.id));
                const unread = unreadCounts.get(selectedFeed.id) ?? 0;
                return (
                  <div className="flex items-center gap-4 text-[11px] font-mono text-airq-dark/50">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${health.color}`} />
                      {health.label}
                    </span>
                    <span>updated {timestampToRelative(feedTimestamps.get(selectedFeed.id))}</span>
                    <span>{unread} unread</span>
                  </div>
                );
              })()}

              {/* URL */}
              <div>
                <label className="block text-[10px] font-mono text-airq-dark/40 uppercase tracking-widest mb-1.5">
                  Feed URL
                </label>
                <input
                  ref={urlInputRef}
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter' && isAddMode) void handleAdd(); }}
                  placeholder="https://example.com/feed.xml"
                  className="w-full text-sm font-mono bg-transparent border-b border-airq-dark/15 focus:border-airq-secondary outline-none py-1.5 text-airq-dark placeholder:text-airq-dark/25 transition-colors"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] font-mono text-airq-dark/40 uppercase tracking-widest mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={isAddMode ? 'Auto-detected if empty' : 'Feed title'}
                  className="w-full text-sm font-mono bg-transparent border-b border-airq-dark/15 focus:border-airq-secondary outline-none py-1.5 text-airq-dark placeholder:text-airq-dark/25 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-mono text-airq-dark/40 uppercase tracking-widest mb-1.5">
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full text-sm font-mono bg-transparent border-b border-airq-dark/15 focus:border-airq-secondary outline-none py-1.5 text-airq-dark transition-colors"
                >
                  <option value="">None</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                {isAddMode ? (
                  <>
                    <button
                      onClick={() => void handleAdd()}
                      disabled={!form.url.trim() || isSubmitting}
                      className="text-xs font-mono text-airq-contrast hover:underline transition-colors disabled:opacity-40 disabled:no-underline"
                    >
                      {isSubmitting ? 'adding...' : 'add feed'}
                    </button>
                    <button
                      onClick={() => { setMode('browse'); setForm(emptyForm); }}
                      className="text-xs font-mono text-airq-dark/40 hover:text-airq-dark/70 transition-colors"
                    >
                      cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => void handleSave()}
                      disabled={!hasChanges || isSubmitting}
                      className="text-xs font-mono text-airq-contrast hover:underline transition-colors disabled:opacity-30 disabled:no-underline"
                    >
                      {isSubmitting ? 'saving...' : 'save changes'}
                    </button>
                    {hasChanges && (
                      <button
                        onClick={() => {
                          if (selectedFeed) {
                            setForm({
                              url: selectedFeed.url,
                              title: selectedFeed.title,
                              categoryId: selectedFeed.categories[0]?.id ?? '',
                            });
                          }
                        }}
                        className="text-xs font-mono text-airq-dark/40 hover:text-airq-dark/70 transition-colors"
                      >
                        discard
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Delete zone */}
              {selectedFeed && !isAddMode && (
                <div className="pt-6 mt-6 border-t border-airq-dark/10">
                  {confirmDelete ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-airq-dark/50">Remove this feed?</span>
                      <button
                        onClick={() => void handleDelete()}
                        className="text-xs font-mono text-red-500 hover:underline transition-colors"
                      >
                        remove
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="text-xs font-mono text-airq-dark/40 hover:text-airq-dark/70 transition-colors"
                      >
                        cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="text-xs font-mono text-airq-dark/30 hover:text-red-500 transition-colors"
                    >
                      remove feed
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center">
          <span className="text-airq-dark/30 text-sm font-mono">Select a feed to edit</span>
        </div>
      )}
    </div>
  );
};

export default FeedManager;
