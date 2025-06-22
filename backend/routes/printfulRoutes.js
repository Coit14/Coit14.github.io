import express from 'express';
import printfulService from '../services/printfulService.js';

const router = express.Router();

router.get('/products', async (req, res) => {
  try {
    const products = await printfulService.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const product = await printfulService.getProduct(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate shipping rates
router.post('/shipping-rates', async (req, res) => {
  try {
    const { recipient, items } = req.body;

    // Validate required fields
    if (!recipient || !items || !Array.isArray(items)) {
      return res.status(400).json({ 
        error: 'Invalid request format',
        details: 'Request must include recipient and items array'
      });
    }

    // Validate recipient fields
    const requiredRecipientFields = ['address1', 'city', 'country_code', 'state_code', 'zip'];
    const missingFields = requiredRecipientFields.filter(field => !recipient[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required recipient fields',
        details: `Missing: ${missingFields.join(', ')}`
      });
    }

    // Validate items
    if (!items.every(item => item.variant_id && item.quantity > 0)) {
      return res.status(400).json({
        error: 'Invalid items format',
        details: 'Each item must have a valid variant_id and quantity > 0'
      });
    }

    // Format the request for Printful's API
    const shippingData = {
      recipient: {
        ...recipient,
        // Ensure proper formatting
        state_code: recipient.state_code.toUpperCase(),
        country_code: recipient.country_code.toUpperCase(),
        zip: recipient.zip.toString()
      },
      items: items.map(item => ({
        variant_id: parseInt(item.variant_id, 10),
        quantity: parseInt(item.quantity, 10)
      }))
    };

    console.log('📦 Calculating shipping rates with payload:', JSON.stringify(shippingData, null, 2));

    const rates = await printfulService.getShippingRates(shippingData);

    // Validate response
    if (!Array.isArray(rates) || rates.length === 0) {
      console.warn('⚠️ No shipping rates returned from Printful');
      return res.status(404).json({
        error: 'No shipping rates available',
        details: 'No shipping methods available for this address and items'
      });
    }

    // Validate each rate has required fields
    const validRates = rates.filter(rate => 
      rate && 
      typeof rate.id === 'string' && 
      rate.id.length > 0 &&
      typeof rate.rate === 'string' &&
      parseFloat(rate.rate) >= 0
    );

    if (validRates.length === 0) {
      console.warn('⚠️ No valid shipping rates in response:', rates);
      return res.status(500).json({
        error: 'Invalid shipping rates received',
        details: 'Received shipping rates were invalid or malformed'
      });
    }

    console.log('✅ Shipping rates calculated successfully:', validRates);
    res.status(200).json(validRates);
  } catch (error) {
    console.error('❌ Error calculating shipping rates:', error);
    res.status(500).json({ 
      error: 'Failed to calculate shipping rates',
      details: error.response?.data?.error || error.message
    });
  }
});

// Create a new order
router.post('/create-order', async (req, res) => {
  try {
    const { recipient, items, shipping } = req.body;

    // Validate required fields
    if (!recipient || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    // Format the order data for Printful's API
    const orderData = {
      recipient,
      items: items.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity
      })),
      shipping: shipping ? {
        method: shipping.method,
        rate: shipping.rate
      } : undefined
    };

    const order = await printfulService.createOrder(orderData);
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

export default router; 