import { useState, useEffect } from 'react';
import { cache } from '@/lib/cache';

interface UseCachedFetchOptions<T> {
  key: string;
  fetchFn: () => Promise<T>;
  ttl?: number;
  useLocalStorage?: boolean;
  enabled?: boolean;
}

export function useCachedFetch<T>({
  key,
  fetchFn,
  ttl = 5 * 60 * 1000, // 5 minutes default
  useLocalStorage = false,
  enabled = true,
}: UseCachedFetchOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!enabled) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Try to get data from cache
        const cachedData = await cache.get<T>(key, { useLocalStorage });
        if (cachedData) {
          if (isMounted) {
            setData(cachedData);
            setIsLoading(false);
          }
          return;
        }

        // Fetch fresh data
        const freshData = await fetchFn();
        
        // Cache the fresh data
        await cache.set(key, freshData, { ttl, useLocalStorage });

        if (isMounted) {
          setData(freshData);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An error occurred'));
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [key, fetchFn, ttl, useLocalStorage, enabled]);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const freshData = await fetchFn();
      await cache.set(key, freshData, { ttl, useLocalStorage });
      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch };
} 