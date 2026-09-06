const API_BASE = '/api';

export const api = {
  // Products
  async getProducts(category, search) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async saveProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Failed to save product');
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  async syncBatch(products) {
    const res = await fetch(`${API_BASE}/products/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products })
    });
    if (!res.ok) throw new Error('Failed to sync products');
    return res.json();
  },

  async resetDemo() {
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

  // AI Pipeline
  async processPhotoStudio(formData) {
    const res = await fetch(`${API_BASE}/ai/photo-studio`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Photo Studio processing failed');
    return res.json();
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

  // Marketplace & GeM
  async getRFQs() {
    const res = await fetch(`${API_BASE}/marketplace/rfqs`);
    if (!res.ok) throw new Error('Failed to fetch RFQs');
    return res.json();
  },

  async updateRFQStatus(rfqId, status) {
    const res = await fetch(`${API_BASE}/marketplace/rfqs/${rfqId}/status?status=${encodeURIComponent(status)}`, {
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
  }
};

