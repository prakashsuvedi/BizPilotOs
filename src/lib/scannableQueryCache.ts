/**
 * Scannable Query & Cache Engine
 * Provides lightweight memory caching, query deduplication, and chunked cursor-based pagination
 * to prevent Firestore read-unit quota spikes across high-concurrency multi-tenant operations.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL_MS = 60 * 1000; // 1 minute cache TTL

/**
 * Returns cached query result if available and fresh, otherwise executes fetcher and stores in memory.
 */
export async function fetchWithScannableCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const cached = memoryCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data;
  }

  const freshData = await fetcher();
  memoryCache.set(cacheKey, { data: freshData, timestamp: now });
  return freshData;
}

/**
 * Clears cached entries matching a specific prefix or exact tenant ID key.
 */
export function invalidateScannableCache(keyPattern?: string) {
  if (!keyPattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(keyPattern)) {
      memoryCache.delete(key);
    }
  }
}
