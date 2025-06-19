/**
 * Performance Optimization Utilities
 * Optimizations for cross-organization resource discovery
 */

// Cache for cross-organization search results
const crossOrgCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

/**
 * Enhanced caching with LRU eviction
 */
export class LRUCache {
  constructor(maxSize = MAX_CACHE_SIZE) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      
      // Check if expired
      if (Date.now() - value.timestamp > CACHE_DURATION) {
        this.cache.delete(key);
        return null;
      }
      
      return value.data;
    }
    return null;
  }

  set(key, data) {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Global cache instances
export const resourceCache = new LRUCache(50);
export const manifestCache = new LRUCache(100);
export const organizationCache = new LRUCache(20);

/**
 * Debounced search function to prevent excessive API calls
 */
export function createDebouncedSearch(searchFunction, delay = 300) {
  let timeoutId;
  
  return function debouncedSearch(...args) {
    clearTimeout(timeoutId);
    
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await searchFunction(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}

/**
 * Batch API requests to reduce network overhead
 */
export class RequestBatcher {
  constructor(batchSize = 5, delay = 100) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.processing = false;
  }

  async add(requestFunction, ...args) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFunction,
        args,
        resolve,
        reject
      });

      if (!this.processing) {
        this.processBatch();
      }
    });
  }

  async processBatch() {
    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      
      // Process batch in parallel
      const promises = batch.map(async ({ requestFunction, args, resolve, reject }) => {
        try {
          const result = await requestFunction(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      await Promise.allSettled(promises);
      
      // Small delay between batches
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }

    this.processing = false;
  }
}

// Global request batcher
export const apiRequestBatcher = new RequestBatcher();

/**
 * Progressive loading for large resource lists
 */
export class ProgressiveLoader {
  constructor(items, pageSize = 20) {
    this.items = items;
    this.pageSize = pageSize;
    this.currentPage = 0;
    this.loadedItems = [];
  }

  getNextPage() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    const page = this.items.slice(start, end);
    
    this.loadedItems.push(...page);
    this.currentPage++;
    
    return {
      items: page,
      hasMore: end < this.items.length,
      totalLoaded: this.loadedItems.length,
      totalItems: this.items.length
    };
  }

  getAllLoaded() {
    return this.loadedItems;
  }

  reset() {
    this.currentPage = 0;
    this.loadedItems = [];
  }
}

/**
 * Resource preloading for anticipated user actions
 */
export class ResourcePreloader {
  constructor() {
    this.preloadQueue = new Set();
    this.preloadedData = new Map();
  }

  async preload(key, loadFunction) {
    if (this.preloadQueue.has(key) || this.preloadedData.has(key)) {
      return;
    }

    this.preloadQueue.add(key);

    try {
      // Use requestIdleCallback if available for non-critical preloading
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(async () => {
          const data = await loadFunction();
          this.preloadedData.set(key, data);
          this.preloadQueue.delete(key);
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(async () => {
          const data = await loadFunction();
          this.preloadedData.set(key, data);
          this.preloadQueue.delete(key);
        }, 0);
      }
    } catch (error) {
      console.warn('Preload failed for', key, error);
      this.preloadQueue.delete(key);
    }
  }

  get(key) {
    return this.preloadedData.get(key);
  }

  has(key) {
    return this.preloadedData.has(key);
  }
}

// Global preloader
export const resourcePreloader = new ResourcePreloader();

/**
 * Memory usage monitoring and optimization
 */
export class MemoryMonitor {
  constructor() {
    this.memoryThreshold = 50 * 1024 * 1024; // 50MB threshold
    this.checkInterval = 30000; // Check every 30 seconds
    this.monitoring = false;
  }

  startMonitoring() {
    if (this.monitoring || typeof performance === 'undefined' || !performance.memory) {
      return;
    }

    this.monitoring = true;
    this.intervalId = setInterval(() => {
      this.checkMemoryUsage();
    }, this.checkInterval);
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.monitoring = false;
    }
  }

  checkMemoryUsage() {
    if (performance.memory && performance.memory.usedJSHeapSize > this.memoryThreshold) {
      console.warn('High memory usage detected, clearing caches');
      this.clearCaches();
      
      // Force garbage collection if available (dev tools)
      if (window.gc) {
        window.gc();
      }
    }
  }

  clearCaches() {
    resourceCache.clear();
    manifestCache.clear();
    organizationCache.clear();
    crossOrgCache.clear();
  }
}

// Global memory monitor
export const memoryMonitor = new MemoryMonitor();

/**
 * Performance metrics collection
 */
export class PerformanceTracker {
  constructor() {
    this.metrics = new Map();
  }

  startTimer(label) {
    this.metrics.set(label, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  endTimer(label) {
    const metric = this.metrics.get(label);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      // Log slow operations
      if (metric.duration > 2000) {
        console.warn(`Slow operation detected: ${label} took ${metric.duration.toFixed(2)}ms`);
      }
      
      return metric.duration;
    }
    return null;
  }

  getMetric(label) {
    return this.metrics.get(label);
  }

  getAllMetrics() {
    const results = {};
    for (const [label, metric] of this.metrics.entries()) {
      results[label] = {
        duration: metric.duration,
        startTime: metric.startTime,
        endTime: metric.endTime
      };
    }
    return results;
  }

  clear() {
    this.metrics.clear();
  }
}

// Global performance tracker
export const performanceTracker = new PerformanceTracker();

/**
 * Optimized search with caching and debouncing
 */
export function createOptimizedSearch(searchFunction, options = {}) {
  const {
    cacheKey = 'search',
    debounceDelay = 300,
    enableCache = true,
    enablePreload = false
  } = options;

  const debouncedSearch = createDebouncedSearch(searchFunction, debounceDelay);

  return async function optimizedSearch(query, ...args) {
    const fullCacheKey = `${cacheKey}:${query}:${JSON.stringify(args)}`;
    
    // Check cache first
    if (enableCache) {
      const cached = resourceCache.get(fullCacheKey);
      if (cached) {
        return cached;
      }
    }

    // Start performance tracking
    const timerLabel = `search:${query}`;
    performanceTracker.startTimer(timerLabel);

    try {
      // Execute search
      const results = await debouncedSearch(query, ...args);
      
      // Cache results
      if (enableCache) {
        resourceCache.set(fullCacheKey, results);
      }

      // Preload related resources if enabled
      if (enablePreload && results.length > 0) {
        results.slice(0, 3).forEach(result => {
          const preloadKey = `resource:${result.organization}/${result.id}`;
          resourcePreloader.preload(preloadKey, () => 
            // Preload function would be passed in options
            Promise.resolve(result)
          );
        });
      }

      return results;
    } finally {
      performanceTracker.endTimer(timerLabel);
    }
  };
}

/**
 * Initialize performance optimizations
 */
export function initializePerformanceOptimizations() {
  // Start memory monitoring in development
  if (process.env.NODE_ENV === 'development') {
    memoryMonitor.startMonitoring();
  }

  // Clear caches on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      memoryMonitor.clearCaches();
    });

    // Expose performance tools in development
    if (process.env.NODE_ENV === 'development') {
      window._performanceTools = {
        resourceCache,
        manifestCache,
        organizationCache,
        performanceTracker,
        memoryMonitor,
        clearAllCaches: () => memoryMonitor.clearCaches(),
        getMetrics: () => performanceTracker.getAllMetrics()
      };
    }
  }

  console.log('🚀 Performance optimizations initialized');
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  initializePerformanceOptimizations();
} 