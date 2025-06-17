import { getCachedProducts } from '../services/cacheService.js';

export async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('Fetching products from cache...');
      const products = getCachedProducts();
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(404).json({ error: 'No products available' });
      }
      return res.json(products);
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch products',
        details: error.message 
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 