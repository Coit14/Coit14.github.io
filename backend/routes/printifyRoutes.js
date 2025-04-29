import express from 'express';
import printifyService from '../utils/printifyApi.js';

const router = express.Router();

// Get all products
router.get('/products', async (req, res) => {
    try {
        // First get shops
        const shops = await printifyService.getShops();
        
        if (!shops || !shops.length) {
            return res.status(404).json({ error: 'No shop found' });
        }

        const shopId = shops[0].id;
        console.log('Using shop ID:', shopId);

        // Get products for the shop
        const productsResponse = await printifyService.getShopProducts(shopId);
        
        // Debug log to see exactly what we're getting
        console.log('Raw products response:', JSON.stringify(productsResponse, null, 2));

        // Safely access the products array
        const productsData = productsResponse?.data?.data || [];
        
        if (!Array.isArray(productsData)) {
            console.error('Products data is not an array:', productsData);
            return res.status(500).json({ error: 'Invalid products data format' });
        }

        const products = productsData.map(product => ({
            id: product.id,
            title: product.title,
            description: product.description,
            images: product.images,
            variants: (product.variants || [])
                .filter(v => v.is_enabled && v.is_available)
                .map(v => ({
                    id: v.id,
                    price: v.price,
                    options: v.options
                }))
        }));

        console.log(`Found ${products.length} products, sending to frontend`);
        
        // Send the products array directly
        res.json(products);
        
    } catch (error) {
        console.error('Full error:', error);
        console.error('Error in /products route:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
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
        const shops = await printifyService.getShops();
        if (!shops || !shops.length) {
            return res.status(404).json({ error: 'No shop found' });
        }

        const product = await printifyService.getProduct(shops[0].id, req.params.id);
        res.json(product);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch product',
            details: error.response?.data || error.message
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

// Add this new route
router.delete('/products/delete-specific', async (req, res) => {
    try {
        const shops = await printifyService.getShops();
        const shopId = shops[0].id;
        
        // Get all products
        const productsResponse = await printifyService.getProducts(shopId);
        const products = productsResponse.data;
        
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