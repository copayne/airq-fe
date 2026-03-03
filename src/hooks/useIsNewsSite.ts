import { useRouter } from 'next/router';

/** Detect if we're on the news site via pathname or subdomain. */
export function useIsNewsSite(): boolean {
  const router = useRouter();
  if (router.pathname.startsWith('/news')) return true;
  if (typeof window !== 'undefined') return window.location.hostname.startsWith('news.');
  return false;
}
