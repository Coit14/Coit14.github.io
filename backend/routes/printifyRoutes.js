import express from 'express';
import printifyService from '../utils/printifyApi.js';
import { getCachedProducts } from '../services/cacheService.js';

const router = express.Router();

// Get all products
router.get('/products', async (req, res) => {
    try {
        // Get products directly from cache
        const products = getCachedProducts();
        console.log(`Serving ${products.length} products from cache`);
        res.json(products);
    } catch (error) {
        console.error('Error serving products from cache:', {
            message: error.message
        });
        res.status(500).json({ 
            error: 'Failed to fetch products',
            details: error.message
        });
    }
});

// Get catalog blueprints
router.get('/catalog/blueprints', async (req, res) => {
    try {
        const blueprints = await printifyService.getCatalogBlueprints();
        res.json(blueprints);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch blueprints',
            details: error.response?.data || error.message
        });
    }
});

// Get specific product
router.get('/products/:id', async (req, res) => {
    try {
        const products = getCachedProducts();
        const product = products.find(p => p.id === req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch product',
            details: error.message
        });
    }
});

// Add these new routes
router.post('/shipping-rates', async (req, res) => {
    try {
        const { address, items } = req.body;
        // Call Printify API to calculate shipping
        const response = await printifyService.calculateShipping(address, items);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to calculate shipping' });
    }
});

router.post('/calculate-tax', async (req, res) => {
    try {
        const { address, items } = req.body;
        const response = await printifyService.calculateTax(address, items);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to calculate tax' });
    }
});

router.post('/create-order', async (req, res) => {
    try {
        const { address, items, shippingMethod } = req.body;
        const order = await printifyService.createOrder(address, items, shippingMethod);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Delete specific products - this needs direct API access
router.delete('/products/delete-specific', async (req, res) => {
    try {
        const shops = await printifyService.getShops();
        const shopId = shops[0].id;
        
        // Get products from cache for comparison
        const products = getCachedProducts();
        
        // Find products to delete
        const productsToDelete = products.filter(product => 
            product.title === "Coit's Classic Logo Hoodie" || 
            product.title === "Coit's Classic Logo Tee"
        );

        // Delete each product
        const results = await Promise.all(
            productsToDelete.map(async (product) => {
                try {
                    const result = await printifyService.deleteProduct(shopId, product.id);
                    return {
                        id: product.id,
                        title: product.title,
                        success: true
                    };
                } catch (error) {
                    return {
                        id: product.id,
                        title: product.title,
                        success: false,
                        error: error.message
                    };
                }
            })
        );

        res.json({
            message: 'Products deleted',
            deletedProducts: results
        });
        
    } catch (error) {
        console.error('Failed to delete products:', error);
        res.status(500).json({ 
            error: 'Failed to delete products',
            details: error.message
        });
    }
});

export default router;