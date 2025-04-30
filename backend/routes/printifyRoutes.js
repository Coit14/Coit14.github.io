import express from 'express';
import printifyService from '../services/printifyService.js';
import { getCachedProducts, refreshCache } from '../services/cacheService.js';

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
        // Get the shop ID first
        const shops = await printifyService.getShops();
        if (!shops || !shops.length) {
            console.error('No shops found');
            return res.status(500).json({ error: 'No shop found' });
        }
        const shopId = shops[0].id;

        const { address, items } = req.body;
        // Call Printify API to calculate shipping with shopId
        const response = await printifyService.calculateShipping(shopId, address, items);
        res.json(response.data);
    } catch (error) {
        console.error('Failed to calculate shipping:', error);
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

// Add route to publish a product
router.post('/products/:id/publish', async (req, res) => {
    try {
        console.log('Attempting to publish product:', req.params.id);
        
        const shops = await printifyService.getShops();
        if (!shops || !shops.length) {
            console.error('No shops found');
            return res.status(500).json({ error: 'No shop found' });
        }
        
        const shopId = shops[0].id;
        const productId = req.params.id;
        
        console.log(`Publishing product ${productId} from shop ${shopId}`);
        
        const result = await printifyService.publishProduct(shopId, productId);
        console.log('Publish result:', result);
        
        if (result.success) {
            // Refresh the cache after successful publish
            await refreshCache();
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Failed to publish product:', {
            productId: req.params.id,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error: 'Failed to publish product',
            details: error.message
        });
    }
});

// Add route to delete a product
router.delete('/products/:id', async (req, res) => {
    try {
        console.log('Attempting to delete product:', req.params.id);
        
        const shops = await printifyService.getShops();
        if (!shops || !shops.length) {
            console.error('No shops found');
            return res.status(500).json({ error: 'No shop found' });
        }
        
        const shopId = shops[0].id;
        const productId = req.params.id;
        
        console.log(`Deleting product ${productId} from shop ${shopId}`);
        
        const result = await printifyService.deleteProduct(shopId, productId);
        console.log('Delete result:', result);
        
        if (result.success) {
            // Refresh the cache after successful deletion
            await refreshCache();
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Failed to delete product:', {
            productId: req.params.id,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error: 'Failed to delete product',
            details: error.message
        });
    }
});

// Add route to unpublish a product
router.post('/products/:id/unpublish', async (req, res) => {
    try {
        console.log('Attempting to unpublish product:', req.params.id);
        
        const shops = await printifyService.getShops();
        if (!shops || !shops.length) {
            console.error('No shops found');
            return res.status(500).json({ error: 'No shop found' });
        }
        
        const shopId = shops[0].id;
        const productId = req.params.id;
        
        console.log(`Unpublishing product ${productId} from shop ${shopId}`);
        
        const result = await printifyService.unpublishProduct(shopId, productId);
        console.log('Unpublish result:', result);
        
        if (result.success) {
            // Refresh the cache after successful unpublish
            await refreshCache();
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Failed to unpublish product:', {
            productId: req.params.id,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error: 'Failed to unpublish product',
            details: error.message
        });
    }
});

export default router;