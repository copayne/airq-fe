import { useRef, useCallback } from 'react';
import { debounce } from '../utils/debounce';

export function useDebouncedRefetch(refetch: () => void, delay: number) {
  const debouncedRefetchRef = useRef(debounce(refetch, delay));

  const triggerRefetch = useCallback(() => {
    debouncedRefetchRef.current();
  }, []);

  return triggerRefetch;
}