import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { ExternalLink, ChevronLeft, ChevronRight, Bookmark, X } from 'lucide-react';
import { Modal } from '~/components/common/Modal';
import { cleanArticleContent } from '~/lib/cleanArticleContent';
import { STARRED_TAG } from '~/services/FreshRSSService';
import type { RSSItem } from '~/services/FreshRSSService';

const MIN_CONTENT_LENGTH = 100;

function hasSubstantiveContent(html: string): boolean {
  if (!html || html.trim().length < MIN_CONTENT_LENGTH) return false;
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent ?? '';
  return text.trim().length >= MIN_CONTENT_LENGTH;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ArticleReaderProps {
  item: RSSItem;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onBookmark: (itemId: string) => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const ArticleReader: React.FC<ArticleReaderProps> = ({ item, onClose, onNavigate, onBookmark, hasPrev, hasNext }) => {
  const articleUrl = item.canonical?.[0]?.href ?? item.origin?.htmlUrl ?? '#';
  const feedName = item.origin?.title ?? '';
  const publishDate = formatDate(item.published);
  const isStarred = item.categories.includes(STARRED_TAG);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const sanitizedContent = useMemo(() => {
    const raw = item.summary?.content ?? '';
    const purified = DOMPurify.sanitize(raw, { ADD_ATTR: ['target'] });
    return cleanArticleContent(purified);
  }, [item.summary?.content]);

  const handlePrev = useCallback(() => onNavigate('prev'), [onNavigate]);
  const handleNext = useCallback(() => onNavigate('next'), [onNavigate]);
  const handleBookmark = useCallback(() => onBookmark(item.id), [onBookmark, item.id]);

  // Keyboard navigation — left/right arrows
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) handlePrev();
      if (e.key === 'ArrowRight' && hasNext) handleNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [hasPrev, hasNext, handlePrev, handleNext]);

  // Scroll to top when article changes
  useEffect(() => {
    mobileScrollRef.current?.scrollTo(0, 0);
  }, [item.id]);

  return (
    <Modal isOpen onClose={onClose} title={feedName} size="xl" mobileFullScreen>
      <div className="flex flex-col h-full sm:h-auto sm:gap-4">
        {/* ── Mobile top bar ── */}
        <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-airq-dark/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1 -ml-1 text-airq-dark/60"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono text-airq-dark/50 truncate mx-3 flex-1 text-center">{feedName}</span>
          <button
            onClick={handleBookmark}
            className={`p-1 -mr-1 transition-colors ${
              isStarred ? 'text-airq-contrast' : 'text-airq-dark/30'
            }`}
            title={isStarred ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark className={`w-5 h-5 ${isStarred ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* ── Desktop navigation + meta bar ── */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className="p-1 rounded transition-colors disabled:opacity-20 enabled:hover:bg-airq-dark/10 text-airq-dark/60"
              title="Previous article"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="p-1 rounded transition-colors disabled:opacity-20 enabled:hover:bg-airq-dark/10 text-airq-dark/60"
              title="Next article"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-airq-dark/50 font-mono ml-1">{publishDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBookmark}
              className={`inline-flex items-center gap-1 text-xs font-mono transition-colors ${
                isStarred ? 'text-airq-contrast' : 'text-airq-dark/40 hover:text-airq-dark/70'
              }`}
              title={isStarred ? 'Remove bookmark' : 'Bookmark'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isStarred ? 'fill-current' : ''}`} />
              {isStarred ? 'bookmarked' : 'bookmark'}
            </button>
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-airq-contrast hover:underline font-mono"
            >
              open original
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div ref={mobileScrollRef} className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-0 py-4 sm:py-0">
          {/* Mobile meta line */}
          <div className="sm:hidden flex items-center gap-2 text-xs text-airq-dark/50 font-mono mb-3">
            <span>{publishDate}</span>
            <span>·</span>
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-airq-contrast inline-flex items-center gap-1"
            >
              open original
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Title */}
          <h1 className="text-lg font-semibold text-airq-dark font-mono leading-tight mb-4 sm:mb-0">
            {item.title}
          </h1>

          {/* Article content */}
          <div
            className="prose prose-sm max-w-none text-airq-dark prose-headings:text-airq-dark prose-a:text-airq-contrast prose-a:no-underline hover:prose-a:underline prose-img:rounded mt-4 sm:mt-0"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>

        {/* ── Mobile bottom nav ── */}
        <div className="sm:hidden flex items-center justify-between px-4 py-3 border-t border-airq-dark/10 flex-shrink-0">
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            className="flex items-center gap-1 text-sm font-mono text-airq-dark/60 disabled:opacity-20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            prev
          </button>
          <button
            onClick={onClose}
            className="text-sm font-mono text-airq-dark/60 transition-colors"
          >
            close
          </button>
          <button
            onClick={handleNext}
            disabled={!hasNext}
            className="flex items-center gap-1 text-sm font-mono text-airq-dark/60 disabled:opacity-20 transition-colors"
          >
            next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export { hasSubstantiveContent };
export default ArticleReader;
