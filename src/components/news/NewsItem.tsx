import React, { useCallback, useMemo } from 'react';
import { Bookmark, Check, ExternalLink } from 'lucide-react';
import type { RSSItem } from '~/services/FreshRSSService';
import { READ_TAG, STARRED_TAG } from '~/services/FreshRSSService';
import { hasSubstantiveContent, estimateReadingTime } from '~/lib/articleUtils';

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const isToday = date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();

  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  }
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

interface NewsItemProps {
  item: RSSItem;
  alsoFrom?: string[];
  isSelected?: boolean;
  onSelect: (item: RSSItem) => void;
  onBookmark: (itemId: string) => void;
  onMarkRead: (itemId: string) => void;
}

const NewsItem: React.FC<NewsItemProps> = React.memo(({ item, alsoFrom, isSelected, onSelect, onBookmark, onMarkRead }) => {
  const isRead = item.categories.includes(READ_TAG);
  const isStarred = item.categories.includes(STARRED_TAG);
  const articleUrl = item.canonical?.[0]?.href ?? item.origin?.htmlUrl ?? '#';
  const feedName = item.origin?.title ?? '';
  const dateStr = formatTimestamp(item.published);
  const content = item.summary?.content ?? '';
  const isStub = useMemo(() => !hasSubstantiveContent(content), [content]);
  const readingTime = useMemo(() => isStub ? null : estimateReadingTime(content), [content, isStub]);

  const handleClick = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);

  const handleExternalClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(articleUrl, '_blank', 'noopener,noreferrer');
    },
    [articleUrl],
  );

  const handleBookmarkClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onBookmark(item.id);
    },
    [item.id, onBookmark],
  );

  const handleMarkReadClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMarkRead(item.id);
    },
    [item.id, onMarkRead],
  );

  return (
    <>
      {/* ── Mobile layout: headline + meta row ── */}
      <div
        className={`sm:hidden flex flex-col gap-0.5 pt-2 pb-1.5 px-3 border-b border-airq-dark/10 hover:bg-airq-dark/5 cursor-pointer transition-colors ${
          isRead ? 'opacity-60' : ''
        } ${!isRead ? 'border-l-2 border-l-airq-primary' : 'border-l-2 border-l-transparent'}`}
        onClick={handleClick}
      >
        <span
          className={`text-xs text-airq-dark font-mono truncate ${
            !isRead ? 'font-medium' : ''
          }`}
        >
          {item.title}
        </span>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-airq-secondary truncate min-w-0">
            {feedName}{feedName && dateStr ? ' · ' : ''}{dateStr}{readingTime ? ` · ${readingTime}` : ''}
            {alsoFrom && (
              <span className="text-airq-dark/30" title={`Also from: ${alsoFrom.join(', ')}`}> +{alsoFrom.length}</span>
            )}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isRead && (
              <button
                onClick={handleMarkReadClick}
                className="p-0.5 text-airq-dark/20 hover:text-green-600 transition-colors"
                title="Mark as read"
              >
                <Check className="w-3 h-3" />
              </button>
            )}
            {isStub ? (
              <ExternalLink className="w-3 h-3 text-airq-dark/30" />
            ) : (
              <button
                onClick={handleBookmarkClick}
                className={`p-0.5 transition-colors ${
                  isStarred ? 'text-airq-contrast' : 'text-airq-dark/20 hover:text-airq-dark/50'
                }`}
                title={isStarred ? 'Remove bookmark' : 'Bookmark'}
              >
                <Bookmark className={`w-3 h-3 ${isStarred ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop/tablet layout: headline + meta row ── */}
      <div
        className={`hidden sm:flex flex-col gap-0.5 pt-2 pb-1.5 px-3 border-b border-airq-dark/10 cursor-pointer transition-colors ${
          isSelected ? 'bg-airq-dark/10' : 'hover:bg-airq-dark/5'
        } ${isRead ? 'opacity-60' : ''} ${!isRead ? 'border-l-2 border-l-airq-primary' : 'border-l-2 border-l-transparent'}`}
        onClick={handleClick}
      >
        <span
          className={`text-sm text-airq-dark font-mono truncate ${
            !isRead ? 'font-medium' : ''
          }`}
        >
          {item.title}
        </span>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          {/* Actions */}
          {!isRead && (
            <button
              onClick={handleMarkReadClick}
              className="p-0.5 text-airq-dark/20 hover:text-green-600 transition-colors"
              title="Mark as read"
            >
              <Check className="w-3 h-3" />
            </button>
          )}
          {isStub ? (
            <ExternalLink className="w-3 h-3 text-airq-dark/30" />
          ) : (
            <button
              onClick={handleBookmarkClick}
              className={`p-0.5 transition-colors ${
                isStarred ? 'text-airq-contrast' : 'text-airq-dark/20 hover:text-airq-dark/50'
              }`}
              title={isStarred ? 'Remove bookmark' : 'Bookmark'}
            >
              <Bookmark className={`w-3 h-3 ${isStarred ? 'fill-current' : ''}`} />
            </button>
          )}
          <button
            onClick={handleExternalClick}
            className="p-0.5 text-airq-dark/20 hover:text-airq-contrast transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
          {/* Meta */}
          <span className="text-airq-secondary truncate min-w-0">
            {feedName}{feedName && dateStr ? ' · ' : ''}{dateStr}{readingTime ? ` · ${readingTime}` : ''}
          </span>
          {alsoFrom && (
            <span className="text-airq-dark/30 flex-shrink-0" title={`Also from: ${alsoFrom.join(', ')}`}>
              +{alsoFrom.length}
            </span>
          )}
        </div>
      </div>
    </>
  );
});

NewsItem.displayName = 'NewsItem';

export default NewsItem;
