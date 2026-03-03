/**
 * Post-sanitization content cleaner for RSS article HTML.
 * Runs AFTER DOMPurify to strip non-article cruft (share buttons,
 * tracking pixels, newsletter forms, etc.) while preserving
 * actual article content.
 */

const NON_CONTENT_SELECTORS = [
  // Tracking pixels — 1x1 or tiny hidden images
  'img[width="1"]',
  'img[height="1"]',
  'img[width="0"]',
  'img[height="0"]',

  // Social sharing
  '[class*="share"]',
  '[class*="Share"]',
  '[class*="social"]',
  'a[href*="twitter.com/intent"]',
  'a[href*="facebook.com/sharer"]',
  'a[href*="linkedin.com/sharing"]',
  'a[href*="reddit.com/submit"]',
  'a[href*="mailto:?subject="]',

  // Comments
  '[class*="comment"]',
  '[id*="comment"]',
  '[class*="disqus"]',
  '[id*="disqus"]',

  // Related / recommended articles
  '[class*="related"]',
  '[class*="Related"]',
  '[class*="recommended"]',
  '[class*="suggested"]',

  // Newsletter / subscribe forms
  '[class*="newsletter"]',
  '[class*="subscribe"]',
  '[class*="signup"]',
  'form',

  // Copyright / legal
  '[class*="copyright"]',
  '[class*="Copyright"]',

  // Table of contents
  '[class*="toc"]',
  '[class*="table-of-contents"]',
  '[id*="toc"]',

  // Navigation (next/prev)
  '[class*="pagination"]',
  '[class*="pager"]',
  '[class*="nav-post"]',
  '[class*="post-nav"]',

  // Read more / continue reading links
  '[class*="read-more"]',
  '[class*="readmore"]',
  '[class*="continue-reading"]',

  // Author bio blocks
  '[class*="author-bio"]',
  '[class*="about-author"]',
  '[class*="author-info"]',

  // Print / utility buttons
  '[class*="print"]',
  'button',
].join(', ');

const CONTAINER_TAGS = new Set([
  'DIV',
  'SPAN',
  'SECTION',
  'ARTICLE',
  'UL',
  'OL',
]);

function removeEmptyContainers(root: HTMLElement): void {
  let changed = true;
  while (changed) {
    changed = false;
    const elements = root.querySelectorAll<HTMLElement>('*');
    for (const el of elements) {
      if (
        CONTAINER_TAGS.has(el.tagName) &&
        el.children.length === 0 &&
        (el.textContent ?? '').trim() === ''
      ) {
        el.remove();
        changed = true;
      }
    }
  }
}

export function cleanArticleContent(html: string): string {
  if (!html) return html;

  const div = document.createElement('div');
  div.innerHTML = html;

  const targets = div.querySelectorAll(NON_CONTENT_SELECTORS);
  for (const el of targets) {
    el.remove();
  }

  removeEmptyContainers(div);

  return div.innerHTML;
}
