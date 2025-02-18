const axios = require('axios');
const printifyConfig = require('../config/printify');
const printifyService = require('../services/printifyService');

const printifyController = {
    // Get all published products
    getPublishedProducts: async (req, res) => {
        try {
            const shops = await printifyService.getShops();
            const shopId = shops[0]?.id;
            
            if (!shopId) {
                return res.status(404).json({ error: 'No shop found' });
            }

            const products = await printifyService.getProducts(shopId);
            const publishedProducts = products.data
                .filter(product => product.is_published)
                .map(product => ({
                    id: product.id,
                    title: product.title,
                    description: product.description,
                    images: product.images,
                    variants: product.variants
                        .filter(v => v.is_enabled && v.is_available)
                }));

            res.json(publishedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    },

    // Get specific product
    getProduct: async (req, res) => {
        try {
            const { productId } = req.params;
            const response = await axios.get(
                `${printifyConfig.PRINTIFY_API_BASE_URL}/shops/${printifyConfig.SHOP_ID}/products/${productId}.json`,
                { headers: printifyConfig.HEADERS }
            );
            res.json(response.data);
        } catch (error) {
            res.status(500).json({ 
                error: 'Failed to fetch product',
                details: error.response?.data || error.message
            });
        }
    },

    // Test connection
    testConnection: async (req, res) => {
        try {
            const response = await axios.get(
                `${printifyConfig.PRINTIFY_API_BASE_URL}/shops/${printifyConfig.SHOP_ID}.json`,
                { headers: printifyConfig.HEADERS }
            );
            res.json({ 
                success: true, 
                shop: response.data 
            });
        } catch (error) {
            res.status(500).json({ 
                error: 'Failed to connect to Printify',
                details: error.response?.data || error.message
            });
        }
    }
};

module.exports = printifyController;