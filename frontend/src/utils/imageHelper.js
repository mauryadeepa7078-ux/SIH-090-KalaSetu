// Centralized image resolution and fallback helper for KalaSetu

const BACKEND_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
  : 'https://kalasetu-backend-0zy2.onrender.com';

export const CATEGORY_FALLBACK_IMAGES = {
  'Handloom Saree': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'Terracotta Pottery': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
  'Brass Dokra Craft': 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=800&q=80',
  'Madhubani Painting': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'Blue Pottery': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  'Wood Carving': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
  'Leather Craft': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
  'Zari Embroidery': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  'Indian Handicraft': 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=800&q=80'
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

/**
 * Returns a high-resolution, authentic category fallback photo
 */
export const getCategoryFallbackImage = (category) => {
  if (!category) return DEFAULT_IMAGE;
  return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES['Indian Handicraft'] || DEFAULT_IMAGE;
};

/**
 * Robust image resolution for any product item:
 * 1. Checks base64 enhanced data (highest priority from AI Photo Studio)
 * 2. Checks enhanced_image_url (formats relative paths to absolute backend URL)
 * 3. Checks original_image_data / original_image_url
 * 4. Checks images array and image property
 * 5. Falls back to authentic category photo
 */
export const getProductImage = (product) => {
  if (!product) return DEFAULT_IMAGE;

  // 1. Base64 data URIs (infallible cross-domain)
  if (product.enhanced_image_data && product.enhanced_image_data.startsWith('data:image')) {
    return product.enhanced_image_data;
  }

  // 2. Enhanced Image URL
  let img = product.enhanced_image_url;

  // 3. Original Image Data
  if (!img && product.original_image_data && product.original_image_data.startsWith('data:image')) {
    return product.original_image_data;
  }

  // 4. Original Image URL
  if (!img) {
    img = product.original_image_url;
  }

  // 5. Images Array
  if (!img && Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
    img = product.images[0];
  }

  // 6. Direct image property
  if (!img && product.image) {
    img = product.image;
  }

  // If no image specified, use authentic category fallback
  if (!img) {
    return getCategoryFallbackImage(product.category);
  }

  // If relative path from backend (e.g. /static/uploads/... or /static/processed/...)
  if (typeof img === 'string' && img.startsWith('/static/')) {
    return `${BACKEND_BASE_URL}${img}`;
  }

  return img;
};
