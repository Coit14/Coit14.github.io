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

export default router; 