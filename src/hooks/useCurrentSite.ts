import { useRouter } from 'next/router';

export type SiteType = 'air' | 'news' | 'security';

export function useCurrentSite(): SiteType {
  const router = useRouter();

  // Check pathname first (works in dev)
  if (router.pathname.startsWith('/news')) return 'news';
  if (router.pathname.startsWith('/security')) return 'security';

  // Check subdomain (works in production)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.startsWith('news.')) return 'news';
    if (hostname.startsWith('security.')) return 'security';
  }

  return 'air';
}

// Convenience hooks for backward compatibility and cleaner conditionals
export function useIsNewsSite(): boolean {
  return useCurrentSite() === 'news';
}

export function useIsSecuritySite(): boolean {
  return useCurrentSite() === 'security';
}
