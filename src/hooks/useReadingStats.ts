import { useCallback, useMemo, useState } from 'react';
import { estimateReadingMinutes } from '~/lib/articleUtils';
import { formatMinutes } from '~/utils/dateUtils';

const STORAGE_KEY = 'gazette_reading_stats';

interface DailyRecord {
  c: number;
  t: number;
  f: Record<string, number>;
}

type StatsStore = Record<string, DailyRecord>;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getStore(): StatsStore {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as StatsStore;
  } catch {
    return {};
  }
}

function saveStore(store: StatsStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage full or unavailable
  }
}

export { formatMinutes };

export function useReadingStats() {
  const [revision, setRevision] = useState(0);

  const recordRead = useCallback((feedName: string, contentHtml: string) => {
    const store = getStore();
    const key = todayKey();
    const existing = store[key] ?? { c: 0, t: 0, f: {} };
    const minutes = estimateReadingMinutes(contentHtml);

    existing.c += 1;
    existing.t += minutes;
    existing.f[feedName] = (existing.f[feedName] ?? 0) + 1;
    store[key] = existing;
    saveStore(store);
    setRevision((r) => r + 1);
  }, []);

  const stats = useMemo(() => {
    // revision is used to trigger recomputation after recordRead
    void revision;
    const store = getStore();
    const today = todayKey();
    const now = new Date();

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const weekStartKey = weekStart.toISOString().slice(0, 10);

    let todayCount = 0;
    let todayTime = 0;
    let weekCount = 0;
    let weekTime = 0;
    let allCount = 0;
    let allTime = 0;
    const feedTotals: Record<string, number> = {};

    const sortedDays = Object.keys(store).sort();

    for (const day of sortedDays) {
      const rec = store[day]!;
      allCount += rec.c;
      allTime += rec.t;

      if (day === today) {
        todayCount = rec.c;
        todayTime = rec.t;
      }
      if (day >= weekStartKey) {
        weekCount += rec.c;
        weekTime += rec.t;
      }

      for (const [name, count] of Object.entries(rec.f)) {
        feedTotals[name] = (feedTotals[name] ?? 0) + count;
      }
    }

    let streak = 0;
    const check = new Date(now);
    if (!store[today]) {
      check.setDate(check.getDate() - 1);
    }
    while (true) {
      const key = check.toISOString().slice(0, 10);
      const rec = store[key];
      if (rec && rec.c > 0) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }

    const topFeeds = Object.entries(feedTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return {
      today: { count: todayCount, timeMin: todayTime },
      week: { count: weekCount, timeMin: weekTime },
      allTime: { count: allCount, timeMin: allTime },
      streak,
      topFeeds,
    };
  }, [revision]);

  return { recordRead, stats };
}
