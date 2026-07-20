// High-Performance In-Memory Cache with Stale-While-Revalidate pattern
const memoryCache = new Map();

export function getCachedData(cacheKey) {
  const cached = memoryCache.get(cacheKey);
  return cached ? cached.data : null;
}

export function setCachedData(cacheKey, data) {
  memoryCache.set(cacheKey, { data, timestamp: Date.now() });
}

export function invalidateCache(cacheKeyPrefix) {
  if (!cacheKeyPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(cacheKeyPrefix)) {
      memoryCache.delete(key);
    }
  }
}

export async function fetchWithCache(url, options = {}, ttlMs = 60000) {
  const cacheKey = typeof url === 'string' ? url : url.toString();
  const cached = memoryCache.get(cacheKey);
  const now = Date.now();

  // Fast path: Return cached data immediately if fresh
  if (cached && (now - cached.timestamp < ttlMs)) {
    return cached.data;
  }

  // Network fetch with stale fallback
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (cached) return cached.data;
      throw new Error(`HTTP Error ${response.status}`);
    }
    const data = await response.json();
    memoryCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    if (cached) return cached.data;
    throw err;
  }
}
