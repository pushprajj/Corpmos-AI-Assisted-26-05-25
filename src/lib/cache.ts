interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  useLocalStorage?: boolean;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

class Cache {
  private static instance: Cache;
  private memoryCache: Map<string, CacheItem<any>>;
  private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.memoryCache = new Map();
  }

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  private getLocalStorageKey(key: string): string {
    return `cache_${key}`;
  }

  private isExpired(item: CacheItem<any>): boolean {
    if (!item.ttl) return false;
    return Date.now() - item.timestamp > item.ttl;
  }

  public async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    // Try memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && !this.isExpired(memoryItem)) {
      return memoryItem.data;
    }

    // Try localStorage if enabled
    if (options.useLocalStorage) {
      const localStorageKey = this.getLocalStorageKey(key);
      const storedItem = localStorage.getItem(localStorageKey);
      if (storedItem) {
        const item: CacheItem<T> = JSON.parse(storedItem);
        if (!this.isExpired(item)) {
          // Update memory cache
          this.memoryCache.set(key, item);
          return item.data;
        }
        // Remove expired item
        localStorage.removeItem(localStorageKey);
      }
    }

    return null;
  }

  public async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.defaultTTL,
    };

    // Update memory cache
    this.memoryCache.set(key, item);

    // Update localStorage if enabled
    if (options.useLocalStorage) {
      const localStorageKey = this.getLocalStorageKey(key);
      localStorage.setItem(localStorageKey, JSON.stringify(item));
    }
  }

  public async delete(key: string, options: CacheOptions = {}): Promise<void> {
    this.memoryCache.delete(key);
    if (options.useLocalStorage) {
      localStorage.removeItem(this.getLocalStorageKey(key));
    }
  }

  public async clear(options: CacheOptions = {}): Promise<void> {
    this.memoryCache.clear();
    if (options.useLocalStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      }
    }
  }
}

export const cache = Cache.getInstance(); 