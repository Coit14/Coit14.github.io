// Update to use the Vercel URL
const API_BASE_URL = 'https://coit14-github-io.vercel.app/api';

// For debugging
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

/**
 * Fetches all published products from the shop
 * @returns {Promise<Array>} Array of products
 */
export const fetchShopProducts = async () => {
  try {
    const url = `${API_BASE_URL}/products`;
    console.log('Fetching products from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetches details for a specific product
 * @param {string} productId - The ID of the product
 * @returns {Promise<Object>} Product details
 */
export const getProductDetails = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

/**
 * Gets the primary image for a product
 * @param {Object} product - Product object
 * @returns {string} URL of the product image
 */
export const getProductImage = (product) => {
  if (!product?.images?.length) return '/images/placeholder.webp';
  const defaultImage = product.images.find(img => img.position === 'front') || product.images[0];
  return defaultImage.src;
};

/**
 * Gets all available sizes for a product
 * @param {Object} product - Product object
 * @returns {Array<string>} Array of available sizes
 */
export const getAvailableSizes = (product) => {
  if (!product?.variants) return [];
  return [...new Set(
    product.variants
      .filter(v => v.is_enabled && v.is_available)
      .map(v => v.options.size)
  )].sort();
};

/**
 * Gets all available colors for a product
 * @param {Object} product - Product object
 * @returns {Array<string>} Array of available colors
 */
export const getAvailableColors = (product) => {
  if (!product?.variants) return [];
  return [...new Set(
    product.variants
      .filter(v => v.is_enabled && v.is_available)
      .map(v => v.options.color)
  )];
};

/**
 * Gets the price for a specific variant
 * @param {Object} product - Product object
 * @param {string} size - Size variant
 * @param {string} color - Color variant
 * @returns {number|null} Price of the variant or null if not found
 */
export const getVariantPrice = (product, size, color) => {
  if (!product?.variants) return null;
  const variant = product.variants.find(v => 
    v.is_enabled && 
    v.is_available && 
    v.options.size === size && 
    v.options.color === color
  );
  return variant?.price || null;
};

/**
 * Gets the variant ID for a specific combination
 * @param {Object} product - Product object
 * @param {string} size - Size variant
 * @param {string} color - Color variant
 * @returns {string|null} Variant ID or null if not found
 */
export const getVariantId = (product, size, color) => {
  if (!product?.variants) return null;
  const variant = product.variants.find(v => 
    v.is_enabled && 
    v.is_available && 
    v.options.size === size && 
    v.options.color === color
  );
  return variant?.id || null;
};

// If you have any frontend route references, update them from:
// window.location.href = '/checkout';
// To:
// window.location.href = '#/checkout';
