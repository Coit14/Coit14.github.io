import { refreshCache } from '../services/cacheService.js';

export async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { type } = req.body;

    console.log(`📦 Printful Webhook: ${type}`);

    if (['product_updated', 'product_synced'].includes(type)) {
      console.log('Refreshing product cache due to webhook trigger...');
      await refreshCache();
    }

    res.status(200).json({ message: 'Webhook received', type });
  } catch (error) {
    console.error('Error in Printful webhook handler:', error);
    res.status(200).json({ message: 'Webhook error logged' });
  }
} 