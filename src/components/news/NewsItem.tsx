import React, { useCallback, useMemo } from 'react';
import { Bookmark, Check, ExternalLink } from 'lucide-react';
import type { RSSItem } from '~/services/FreshRSSService';
import { STARRED_TAG } from '~/services/FreshRSSService';
import { hasSubstantiveContent } from './ArticleReader';

const READ_TAG = 'user/-/state/com.google/read';

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
  onSelect: (item: RSSItem) => void;
  onBookmark: (itemId: string) => void;
  onMarkRead: (itemId: string) => void;
}

const NewsItem: React.FC<NewsItemProps> = React.memo(({ item, onSelect, onBookmark, onMarkRead }) => {
  const isRead = item.categories.includes(READ_TAG);
  const isStarred = item.categories.includes(STARRED_TAG);
  const articleUrl = item.canonical?.[0]?.href ?? item.origin?.htmlUrl ?? '#';
  const feedName = item.origin?.title ?? '';
  const dateStr = formatTimestamp(item.published);
  const isStub = useMemo(() => !hasSubstantiveContent(item.summary?.content ?? ''), [item.summary?.content]);

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
    <div
      className={`flex items-center pt-2 pb-1.5 px-3 border-b border-airq-dark/10 hover:bg-airq-dark/5 cursor-pointer transition-colors ${
        isRead ? 'opacity-60' : ''
      } ${!isRead ? 'border-l-2 border-l-airq-primary' : 'border-l-2 border-l-transparent'}`}
      onClick={handleClick}
    >
      {!isRead ? (
        <button
          onClick={handleMarkReadClick}
          className="w-4 h-4 flex items-center justify-center flex-shrink-0 mr-1.5 text-airq-dark/20 hover:text-green-600 transition-colors"
          title="Mark as read"
        >
          <Check className="w-3 h-3" />
        </button>
      ) : (
        <div className="w-4 h-4 flex-shrink-0 mr-1.5" />
      )}
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mr-1.5">
        {isStub ? (
          <ExternalLink className="w-3 h-3 text-airq-dark/30" />
        ) : (
          <button
            onClick={handleBookmarkClick}
            className={`transition-colors ${
              isStarred ? 'text-airq-contrast' : 'text-airq-dark/20 hover:text-airq-dark/50'
            }`}
            title={isStarred ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark className={`w-3 h-3 ${isStarred ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
      <div className="text-sm flex-shrink-0 font-mono flex items-center pr-3">
        <p className="text-airq-secondary flex-shrink-0 pr-3">{dateStr}</p>
        <p className="text-airq-secondary/80 truncate flex-1 min-w-0">{feedName}</p>
      </div>
      <span
        className={`text-sm text-airq-dark flex-1 truncate font-mono min-w-0 ${
          !isRead ? 'font-medium' : ''
        }`}
      >
        {item.title}
      </span>
      <button
        onClick={handleExternalClick}
        className="text-airq-dark/30 hover:text-airq-contrast flex-shrink-0 ml-2 p-0.5 transition-colors"
        title="Open in new tab"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

NewsItem.displayName = 'NewsItem';

export default NewsItem;
