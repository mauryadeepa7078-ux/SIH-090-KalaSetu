const QUEUE_KEY = 'kalasetu_offline_queue';
const CACHE_KEY = 'kalasetu_products_cache';

export const offlineStorage = {
  getPendingQueue() {
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading offline queue', e);
      return [];
    }
  },

  addToQueue(product) {
    const queue = this.getPendingQueue();
    // Ensure sync_status is PENDING
    const item = { ...product, sync_status: 'PENDING', local_queued_at: new Date().toISOString() };
    
    // Check if item exists in queue
    const idx = queue.findIndex(q => q.id === item.id);
    if (idx >= 0) {
      queue[idx] = item;
    } else {
      queue.unshift(item);
    }

    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    
    // Also update local cache so user immediately sees it
    this.updateCachedProduct(item);
    return item;
  },

  clearQueue() {
    localStorage.removeItem(QUEUE_KEY);
  },

  getCachedProducts() {
    try {
      const data = localStorage.getItem(CACHE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  setCachedProducts(products) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Error caching products', e);
    }
  },

  updateCachedProduct(product) {
    const cached = this.getCachedProducts();
    const idx = cached.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      cached[idx] = product;
    } else {
      cached.unshift(product);
    }
    this.setCachedProducts(cached);
  }
};
