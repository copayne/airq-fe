# Puryear Gazette v2 — Feature Expansion Report

## Current State (v1.0)

The Gazette is a FreshRSS-backed RSS reader with: feed sidebar with categories, article list with infinite scroll, modal article reader with prev/next navigation, bookmarking/starring, mark-as-read (optimistic with batch flush), content sanitization (DOMPurify + custom cleaner), unread counts, filter toggles (unread/all/starred), sort order toggle, 2-minute auto-refresh polling, keyboard nav (arrow keys in reader), mobile-responsive layout, and subdomain routing (`news.*`).

It's a solid v1. The features below are ranked by how much they'd improve the daily reading experience without adding bloat.

---

## Tier 1 — High Impact, Core UX

### 1. Keyboard-Driven Navigation
**What**: Full keyboard shortcut system for the article list — not just inside the reader modal. `j`/`k` to move between articles, `o` or `Enter` to open, `s` to star, `m` to mark read, `v` to open original, `Space` to scroll/advance. Visual focus indicator on the active article row.

**Why it matters**: This is the single biggest speed improvement for daily reading. Power users of Miniflux, NetNewsWire, and Google Reader (RIP) all cite keyboard nav as the reason they stick with a reader. Currently the Gazette requires a mouse click for every action.

**Pros**: Dramatically faster reading sessions. No new API calls. Relatively contained implementation — event listener on the list container + focus state tracking.
**Cons**: Needs careful handling of focus vs. scroll position. Must not conflict with browser shortcuts. Accessibility consideration for screen readers.
**Difficulty**: Medium. Event handling + scroll-into-view + state tracking. ~150-200 lines across ItemList and NewsItem.

---

### 2. Search (DONE)
**What**: Search bar in the sidebar or header that filters articles by title and content. FreshRSS's Google Reader API supports search via the `stream/contents` endpoint with query parameters. Start with basic text search, optionally add `intitle:`, `author:` prefixes later.

**Why it matters**: "I read something about X last week" is the most common reason people re-open their reader. Without search, starred items become the only way to find anything, which doesn't scale.

**Pros**: FreshRSS already indexes content server-side — this is mostly a UI addition. Instant value for anyone with more than a few feeds.
**Cons**: FreshRSS's Google Reader API search is limited compared to its native web UI search. Complex operators (regex, boolean) may not work through the API. May need a custom API endpoint if advanced search is needed.
**Difficulty**: Medium. Search input + debounced query + results display. The API plumbing exists, it's mostly UI work.

---

### 3. Dark Mode
**What**: Dark color scheme that respects `prefers-color-scheme` system setting, with a manual toggle. Apply a `theme-news-dark` class that remaps the airq CSS variables to dark equivalents. Article content needs its own dark treatment (inverted backgrounds, adjusted link colors).

**Why it matters**: Baseline expectation for any 2026 reading app. Night reading without dark mode is genuinely unpleasant. Every major RSS reader has this.

**Pros**: CSS-only for the chrome. Respecting system preference means zero-config for most users. The airq design system already uses CSS variables, so remapping is straightforward.
**Cons**: Article HTML content from RSS feeds has its own inline styles that fight dark mode. Needs careful handling of images (don't invert), code blocks, and blockquotes. Testing across many feeds is tedious.
**Difficulty**: Medium. CSS variable remapping is easy; sanitizing/adapting article content colors is the harder part.

---

### 4. Feed Management (Subscribe/Unsubscribe) (DONE)
**What**: Add and remove feed subscriptions from the Gazette UI. FreshRSS's Google Reader API supports `subscription/quickadd` (subscribe by URL) and `subscription/edit` (unsubscribe, rename, move to category). Simple form: paste a URL, assign to a category, done.

**Why it matters**: Currently the only way to manage feeds is through the FreshRSS web UI directly. This breaks the experience — you have to leave the Gazette, log into FreshRSS, manage feeds there, then come back.

**Pros**: Completes the self-contained reader experience. The API endpoints exist and are well-documented. Feed discovery (auto-detecting RSS from a website URL) could be added later.
**Cons**: Need to handle error cases (invalid URL, feed already subscribed, unreachable site). Category management (create/rename/delete) adds scope.
**Difficulty**: Medium. API calls are simple. UI needs a modal/form for subscribe + confirmation for unsubscribe.

---

## Tier 2 — Meaningful Enhancements

### 5. Reading Time Estimation (DONE)
**What**: Show estimated reading time next to each article (e.g., "3 min"). Calculate from word count at ~200-250 WPM. Display in the article list row and in the reader header.

**Why it matters**: Helps with the "do I have time to read this now?" decision. Especially useful for longer articles. FreshRSS has an extension for this, but calculating client-side from the summary content is trivial.

**Pros**: Zero API calls. Pure client-side calculation from existing `summary.content`. Tiny implementation footprint.
**Cons**: Estimates are approximate — doesn't account for images, embedded media, or reading speed variation. Content from partial feeds will undercount.
**Difficulty**: Low. A utility function + two render spots. ~20 lines of code.

---

### 6. Article Deduplication (DONE)
**What**: Detect and collapse duplicate articles (same story from multiple feeds). Compare by normalized title similarity and/or canonical URL. Show the first occurrence with a "also from: Feed B, Feed C" indicator, or group them.

**Why it matters**: Anyone subscribed to multiple news sources sees the same breaking story 5-10 times. This is the #1 complaint about RSS readers in user forums. No major reader handles it well.

**Pros**: Significant reduction in reading noise. Makes high-feed-count setups actually usable. Differentiates the Gazette from basically every other reader.
**Cons**: Title similarity is fuzzy — false positives risk hiding unique articles. Needs tuning. Canonical URL matching is more reliable but not all feeds include it. Performance consideration with large item sets.
**Difficulty**: Medium-High. String similarity algorithm (Levenshtein or n-gram), grouping logic, UI for collapsed groups. Needs to be fast enough for 50+ item lists.

---

### 7. Three-Pane / Split View (Desktop)
**What**: Instead of sidebar + list with a modal reader, offer a three-pane layout: sidebar | article list | article content side-by-side. Clicking an article shows it inline in the right pane without a modal. This is the classic NetNewsWire / Thunderbird / Outlook pattern.

**Why it matters**: The modal pattern works but interrupts flow — you open, read, close, open next, read, close. A split view lets you scan and read without context switches. Most desktop RSS power users prefer this layout.

**Pros**: Faster reading flow on desktop. No modal open/close overhead. Can keep scanning the list while reading.
**Cons**: Doesn't work on mobile — need to keep the current modal pattern as fallback. More complex layout management. Sidebar + list + content pane can feel cramped on smaller screens.
**Difficulty**: Medium. Layout restructuring + responsive breakpoint logic. Reader component needs to work both as inline pane and modal.

---

### 8. OPML Import/Export
**What**: Import and export feed subscriptions as OPML files. FreshRSS supports OPML natively. Export lets users back up their feed list; import lets them migrate from another reader.

**Why it matters**: Standard interoperability feature. Anyone migrating from Feedly, Inoreader, or another reader expects OPML import. It's also a backup mechanism.

**Pros**: FreshRSS handles the actual OPML processing — the Gazette just needs to provide the UI (file picker for import, download button for export). Very contained scope.
**Cons**: FreshRSS's OPML endpoint may need a direct request rather than going through the Google Reader API. Need to handle large OPML files and provide feedback during import.
**Difficulty**: Low-Medium. File upload + API call for import; API call + file download for export.

---

### 9. Feed Health Indicators (DONE)
**What**: Show last-updated timestamp and error status for each feed in the sidebar. Highlight feeds that haven't updated in >48 hours or are returning errors. FreshRSS tracks this data internally.

**Why it matters**: Dead feeds silently accumulate. Users don't realize a feed broke 3 months ago until they wonder why they haven't seen articles from it. Surfacing health saves manual checking.

**Pros**: Helps users maintain a healthy feed list. Can drive the unsubscribe decision for abandoned feeds.
**Cons**: May need a custom API endpoint — FreshRSS's Google Reader API doesn't directly expose feed error metadata. Could clutter the sidebar if too prominent.
**Difficulty**: Medium. Depends on how much FreshRSS exposes via API. May need a custom proxy endpoint that queries FreshRSS's internal database.

---

### 10. Per-Feed Settings (DONE)
**What**: Right-click or settings icon on a feed to rename it, move it to a different category, or set a custom refresh interval. Uses FreshRSS's `subscription/edit` API endpoint.

**Why it matters**: Feed titles from RSS are often ugly or unhelpful ("RSS Feed", "Blog", truncated titles). Renaming improves scanability. Moving between categories enables reorganization without leaving the Gazette.

**Pros**: API support exists. Improves feed management without needing the FreshRSS admin UI.
**Cons**: Context menus or settings panels add UI complexity. Need to handle the "edit" interaction pattern cleanly.
**Difficulty**: Medium. API is straightforward; UI design (context menu vs. modal) is the main consideration.

---

## Tier 3 — Nice-to-Have

### 11. Reading Statistics (DONE)
**What**: A stats page or widget showing: articles read per day/week, time spent reading, most-read feeds, reading streak. Track client-side via localStorage or a lightweight API.

**Why it matters**: Gamification light — gives users a sense of progress and helps identify which feeds are actually worth keeping. Several users cite this as a "delightful" feature in Inoreader and NewsBlur.

**Pros**: Fun and informative. Could inform feed cleanup decisions ("I never read this feed").
**Cons**: Client-side tracking won't persist across devices. Server-side tracking adds complexity. Privacy consideration — some users don't want reading habits tracked.
**Difficulty**: Medium. Client-side with localStorage is simple but limited. Server-side needs a data model.

---

### 13. Saved Searches / Smart Feeds
**What**: Save a search query as a virtual feed that appears in the sidebar. "All articles about climate change" or "Unread from News category older than 2 days." FreshRSS calls these "User Queries."

**Why it matters**: Power-user feature that turns a reader into a monitoring tool. Especially useful for topic tracking across many feeds.

**Pros**: FreshRSS supports this concept natively. Adds an organizational axis beyond folders.
**Cons**: Depends on search (feature #2) being implemented first. UI for creating/editing queries adds complexity. Might be over-engineering for a personal reader with <50 feeds.
**Difficulty**: Medium. Builds on search. Needs persistence (via FreshRSS API or localStorage) and sidebar integration.

---

### 14. Labels / Tags
**What**: Tag articles with custom labels (orthogonal to feed categories). An article can have multiple labels. Use FreshRSS's label system via the Google Reader API's `edit-tag` endpoint.

**Why it matters**: Categories organize feeds; labels organize articles. "This article about AI is from my Tech feed but I want to tag it 'research' and 'AI'." More flexible than starring alone.

**Pros**: FreshRSS API supports labels natively. Enables cross-feed organization.
**Cons**: Adds UI complexity — where do labels appear? How do you filter by them? Tag management (create/rename/delete) is another surface. Risk of over-complicating a clean reader.
**Difficulty**: Medium. API support exists but UI design needs thought to avoid clutter.

---

## Recommended Implementation Order

If building incrementally, this sequence respects dependencies and maximizes value per sprint:

| Phase | Features | Rationale |
|-------|----------|-----------|
| **v1.1** | Keyboard shortcuts + Reading time + Dark mode | Biggest daily-use improvements. No API changes needed. |
| **v1.2** | Search + Feed management (subscribe/unsubscribe) | Makes the Gazette self-contained. No more switching to FreshRSS UI. |
| **v1.3** | Three-pane layout + OPML import/export | Desktop reading flow + interoperability. |
| **v2.0** | Deduplication + Feed health + Per-feed settings | Quality-of-life for users with many feeds. |
| **v2.1** | Reading stats + Saved searches + Labels | Power-user features. Only if the reader is used daily and feels too basic. |
