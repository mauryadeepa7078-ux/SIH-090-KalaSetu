const API_BASE = import.meta.env.VITE_API_BASE || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '/api'
    : 'https://kalasetu-backend-0zy2.onrender.com/api'
);

export const api = {
  // Products
  async getProducts(category, search) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const url = `${API_BASE}/products${params.toString() ? `?${params.toString()}` : ''}`;
    console.log(`[API] Fetching products from: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[API] getProducts failed (${res.status}):`, errText);
      throw new Error(`Failed to fetch products: ${res.status}`);
    }
    const data = await res.json();
    console.log(`[API] getProducts successfully fetched ${Array.isArray(data) ? data.length : (data?.products?.length || 0)} items.`);
    return data;
  },

  async getProductById(id) {
    console.log(`[API] Fetching product by ID: ${id}`);
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async saveProduct(productData) {
    console.log(`[API] [STEP 2: API CALLED] Calling POST ${API_BASE}/products with payload:`, productData);
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    console.log(`[API] [STEP 4: RESPONSE RECEIVED] Status=${res.status} ${res.statusText}`);
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[API-ERROR] Save product failed:', res.status, errBody);
      throw new Error(`Failed to save product (${res.status}): ${errBody}`);
    }
    const data = await res.json();
    console.log('[API] [STEP 5: WRITE CONFIRMED] Save product succeeded:', data);
    return data;
  },

  async deleteProduct(id) {
    console.log(`[API] Deleting product ID: ${id}`);
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  async syncBatch(products) {
    console.log(`[API] Batch syncing ${products.length} products...`);
    const res = await fetch(`${API_BASE}/products/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products })
    });
    if (!res.ok) throw new Error('Failed to sync products');
    return res.json();
  },

  async resetDemo() {
    console.log('[API] Calling reset-demo endpoint...');
    const res = await fetch(`${API_BASE}/products/reset-demo`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },

  async getCertificate(id) {
    const res = await fetch(`${API_BASE}/products/${id}/certificate`);
    if (!res.ok) throw new Error('Certificate not found');
    return res.json();
  },

  // Cloud Backend Warm-Up & Keep-Alive
  async pingHealth() {
    try {
      const healthUrl = `${API_BASE.replace(/\/api$/, '')}/api/health`;
      console.log(`[API] Waking up/pinging backend: ${healthUrl}`);
      const res = await fetch(healthUrl, { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        console.log('[API] Backend warm-up ping successful:', data);
        return data;
      }
    } catch (e) {
      console.warn('[API] Backend warm-up ping failed (server may still be starting):', e.message);
    }
    return null;
  },

  // AI Pipeline
  async processPhotoStudio(formData) {
    console.log(`[API] [PHOTO-STUDIO] Sending photo to ${API_BASE}/ai/photo-studio...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 75000); // 75s timeout for cold start safety
    try {
      const res = await fetch(`${API_BASE}/ai/photo-studio`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      console.log(`[API] [PHOTO-STUDIO] Response status: ${res.status}`);
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.error('[API-ERROR] Photo studio failed:', res.status, errText);
        throw new Error(`Photo Studio processing failed (${res.status}): ${errText}`);
      }
      const data = await res.json();
      console.log('[API] [PHOTO-STUDIO] Processed photo received successfully:', data);
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Photo Studio request timed out after 75s. Please retry.');
      }
      throw err;
    }
  },


  async transcribeVoice(audioBlob, filename = 'voice.webm') {
    const formData = new FormData();
    formData.append('file', audioBlob, filename);
    const res = await fetch(`${API_BASE}/ai/transcribe-voice`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Speech transcription failed');
    return res.json();
  },

  async generateCatalog(payload) {
    const res = await fetch(`${API_BASE}/ai/generate-catalog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Catalog generation failed');
    return res.json();
  },

  async calculatePricing(payload) {
    const res = await fetch(`${API_BASE}/ai/calculate-pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Pricing calculation failed');
    return res.json();
  },

  // Marketplace & Orders
  async getOrders(artisanName) {
    const params = new URLSearchParams();
    if (artisanName) params.append('artisan_name', artisanName);
    const url = `${API_BASE}/marketplace/orders${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async createOrder(orderData) {
    console.log('[API] Creating new order:', orderData);
    const res = await fetch(`${API_BASE}/marketplace/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`Failed to create order: ${err}`);
    }
    return res.json();
  },

  async updateOrderStatus(orderId, status, stageIndex = null) {
    console.log(`[API] Updating order ${orderId} to status=${status}, stage=${stageIndex}`);
    const params = new URLSearchParams();
    params.append('status', status);
    if (stageIndex !== null) params.append('stage_index', stageIndex);
    const res = await fetch(`${API_BASE}/marketplace/orders/${orderId}/status?${params.toString()}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // Marketplace & GeM
  async getRFQs() {
    const res = await fetch(`${API_BASE}/marketplace/rfqs`);
    if (!res.ok) throw new Error('Failed to fetch RFQs');
    return res.json();
  },

  async createRFQ(rfqData) {
    console.log('[API] Creating new RFQ:', rfqData);
    const res = await fetch(`${API_BASE}/marketplace/rfqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rfqData)
    });
    if (!res.ok) throw new Error('Failed to create RFQ');
    return res.json();
  },

  async updateRFQStatus(rfqId, status, stageIndex = null) {
    const params = new URLSearchParams();
    params.append('status', status);
    if (stageIndex !== null) params.append('stage_index', stageIndex);
    const res = await fetch(`${API_BASE}/marketplace/rfqs/${rfqId}/status?${params.toString()}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to update RFQ status');
    return res.json();
  },

  async toggleGeMPublish(productId) {
    const res = await fetch(`${API_BASE}/marketplace/products/${productId}/toggle-gem`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to toggle GeM publishing');
    return res.json();
  },

  async getGeMExport(productId) {
    const res = await fetch(`${API_BASE}/marketplace/gem-export/${productId}`);
    if (!res.ok) throw new Error('Failed to fetch GeM export');
    return res.json();
  },

  // WhatsApp Simulation
  async simulateWhatsApp(payload) {
    const res = await fetch(`${API_BASE}/whatsapp/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('WhatsApp simulation failed');
    return res.json();
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Update 4: Conversational AI Voice Assistant / Advisor
  async chatWithAssistant(query, lang = 'hi', role = 'artisan', context = '') {
    const res = await fetch(`${API_BASE}/ai/assistant-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, lang, role, context })
    });
    if (!res.ok) throw new Error('Assistant chat failed');
    return res.json();
  },

  // Authentication & Security (Phase 1)
  async register(userData) {
    console.log('[API] Registering user with backend:', userData?.username);
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || `Registration failed (${res.status})`);
    }
    return res.json();
  },

  async login(identifier, password) {
    console.log('[API] Authenticating with backend:', identifier);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || `Login failed (${res.status})`);
    }
    return res.json();
  },

  async getMe(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Session invalid or expired');
    return res.json();
  },

  async resetPassword(identifier, newPassword) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, new_password: newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Password reset failed' }));
      throw new Error(err.detail || `Password reset failed (${res.status})`);
    }
    return res.json();
  }
};


