import { refreshCache } from '../services/cacheService.js';

// Webhook handler for Printify events
export async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const webhookEvent = req.body;
    
    // Only log event type and ID
    console.log('Received Printify webhook:', {
      type: webhookEvent.type,
      id: webhookEvent.id,
      timestamp: webhookEvent.created_at
    });

    // Refresh cache for relevant product events
    if (['product:created', 'product:updated', 'product:published', 'product:unpublished', 'product:deleted'].includes(webhookEvent.type)) {
      console.log('Product change detected, refreshing cache...');
      await refreshCache();
      console.log('Cache refresh complete');
    }

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).json({ 
      message: 'Webhook received successfully',
      event: webhookEvent.type
    });
  } catch (error) {
    // Log any errors but still return 200 to acknowledge receipt
    console.error('Error processing webhook:', error);
    res.status(200).json({ message: 'Webhook received' });
  }
} 