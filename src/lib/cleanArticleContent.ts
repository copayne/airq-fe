/**
 * Post-sanitization content cleaner for RSS article HTML.
 * Runs AFTER DOMPurify to normalize article structure across feeds:
 * strips non-content elements, removes inline styles/classes,
 * deduplicates the title, and removes byline/date blocks that
 * we render separately in our own UI.
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

  // Byline / dateline blocks
  '[class*="byline"]',
  '[class*="Byline"]',
  '[class*="dateline"]',
  '[class*="meta-date"]',
  '[class*="post-date"]',
  '[class*="article-date"]',
  '[class*="article-meta"]',
  '[class*="entry-meta"]',
  '[class*="post-meta"]',
  '[class*="article-header"]',
  '[class*="article-info"]',

  // Tags / categories
  '[class*="tag-list"]',
  '[class*="post-tags"]',
  '[class*="article-tags"]',
  '[class*="entry-tags"]',
  '[class*="category-label"]',

  // Print / utility buttons
  '[class*="print"]',
  'button',

  // Header / branding
  '[class*="site-header"]',
  '[class*="site-name"]',
  '[class*="site-logo"]',
  '[class*="header-image"]',
  '[class*="masthead"]',
  '[class*="brand"]',
].join(', ');

const CONTAINER_TAGS = new Set([
  'DIV',
  'SPAN',
  'SECTION',
  'ARTICLE',
  'HEADER',
  'FOOTER',
  'UL',
  'OL',
]);

// Tags whose style/class attributes should be preserved
const PRESERVE_ATTR_TAGS = new Set(['PRE', 'CODE']);

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

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

/**
 * Strip all style and class attributes so content inherits
 * from Tailwind prose classes consistently.
 * Preserves attributes on code/pre blocks.
 */
function stripInlineStyles(root: HTMLElement): void {
  const all = root.querySelectorAll<HTMLElement>('*');
  for (const el of all) {
    if (PRESERVE_ATTR_TAGS.has(el.tagName)) continue;
    el.removeAttribute('style');
    el.removeAttribute('class');
  }
}

/**
 * Remove duplicate title heading from content.
 */
function removeDuplicateTitle(root: HTMLElement, title: string): void {
  const normalizedTitle = normalizeText(title);
  if (normalizedTitle.length === 0) return;

  const headings = root.querySelectorAll('h1, h2, h3');
  for (const heading of headings) {
    const headingText = normalizeText(heading.textContent ?? '');
    if (
      headingText === normalizedTitle ||
      normalizedTitle.includes(headingText) ||
      headingText.includes(normalizedTitle)
    ) {
      heading.remove();
      break;
    }
  }
}

/**
 * Remove leading elements that look like a byline:
 * short text blocks near the top containing "by", author names, or dates.
 */
function removeBylineElements(root: HTMLElement): void {
  const bylinePattern = /^by\s+/i;
  const dateOnlyPattern = /^\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,4})[\/\-.,\s\d]+$/i;

  // Check the first few child elements for byline-like content
  const children = Array.from(root.children) as HTMLElement[];
  for (const child of children.slice(0, 5)) {
    const text = (child.textContent ?? '').trim();
    // Skip substantive content
    if (text.length > 200) break;
    if (text.length === 0) continue;

    const tag = child.tagName;

    // Remove elements that are just a date
    if (
      (tag === 'P' || tag === 'DIV' || tag === 'SPAN' || tag === 'TIME') &&
      text.length < 60 &&
      dateOnlyPattern.test(text)
    ) {
      child.remove();
      continue;
    }

    // Remove "By Author Name" lines
    if (
      (tag === 'P' || tag === 'DIV' || tag === 'SPAN') &&
      text.length < 100 &&
      bylinePattern.test(text)
    ) {
      child.remove();
      continue;
    }

    // Once we hit a real paragraph or image, stop looking
    if (tag === 'P' && text.length > 60) break;
    if (tag === 'FIGURE' || tag === 'IMG') break;
  }
}

/**
 * Unwrap unnecessary single-child wrapper divs that add no semantic value.
 * e.g. <div><div><p>text</p></div></div> → <p>text</p>
 */
function unwrapRedundantWrappers(root: HTMLElement): void {
  let changed = true;
  while (changed) {
    changed = false;
    const divs = root.querySelectorAll<HTMLElement>('div, section, article');
    for (const div of divs) {
      if (div.children.length === 1 && (div.textContent ?? '').trim() === (div.children[0]?.textContent ?? '').trim()) {
        div.replaceWith(...Array.from(div.childNodes));
        changed = true;
        break;
      }
    }
  }
}

export function cleanArticleContent(html: string, title?: string): string {
  if (!html) return html;

  const div = document.createElement('div');
  div.innerHTML = html;

  // 1. Remove non-content elements by selector
  const targets = div.querySelectorAll(NON_CONTENT_SELECTORS);
  for (const el of targets) {
    el.remove();
  }

  // 2. Remove duplicate title
  if (title) {
    removeDuplicateTitle(div, title);
  }

  // 3. Strip inline styles and classes
  stripInlineStyles(div);

  // 4. Remove byline/date elements near the top
  removeBylineElements(div);

  // 5. Unwrap redundant wrapper divs
  unwrapRedundantWrappers(div);

  // 6. Clean up empty containers
  removeEmptyContainers(div);

  return div.innerHTML;
}
