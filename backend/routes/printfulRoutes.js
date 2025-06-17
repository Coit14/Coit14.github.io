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
      return res.status(400).json({ error: 'Invalid request format' });
    }

    // Format the request for Printful's API
    const shippingData = {
      recipient,
      items: items.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity
      }))
    };

    const rates = await printfulService.getShippingRates(shippingData);
    res.json(rates);
  } catch (error) {
    console.error('Error calculating shipping rates:', error);
    res.status(500).json({ error: error.message || 'Failed to calculate shipping rates' });
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