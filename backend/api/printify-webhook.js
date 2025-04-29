// Webhook handler for Printify events
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // Log the incoming webhook event
    const webhookEvent = req.body;
    console.log('Received webhook event from Printify:', webhookEvent);

    // Check if it's one of our targeted event types
    if (webhookEvent.type === 'product:created' || webhookEvent.type === 'product:published') {
      console.log(`Processing ${webhookEvent.type} event:`, {
        eventId: webhookEvent.id,
        timestamp: webhookEvent.created_at,
        data: webhookEvent.data
      });
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