import { printifyController } from '../controllers/printifyController.js';

export async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('Fetching products from Printify...');
      await printifyController.getPublishedProducts(req, res);
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