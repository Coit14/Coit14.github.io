const axios = require('axios');
const printifyConfig = require('../config/printify');
const printifyService = require('../services/printifyService');

const printifyController = {
    // Get all published products
    getPublishedProducts: async (req, res) => {
        try {
            console.log('Getting shops...');
            const response = await axios.get(
                'https://api.printify.com/v1/shops.json',
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Shops response:', response.data);
            const shopId = response.data[0]?.id;
            
            if (!shopId) {
                console.log('No shop found');
                return res.status(404).json({ error: 'No shop found' });
            }

            console.log('Getting products for shop:', shopId);
            const productsResponse = await axios.get(
                `https://api.printify.com/v1/shops/${shopId}/products.json`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Products response:', productsResponse.data);
            const publishedProducts = productsResponse.data.data
                .filter(product => product.visible && !product.is_deleted)
                .map(product => ({
                    id: product.id,
                    title: product.title,
                    description: product.description,
                    images: product.images,
                    tags: product.tags,
                    variants: product.variants
                        .filter(v => v.is_enabled)
                }));

            console.log('Filtered products:', publishedProducts);
            return res.json(publishedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch products',
                details: error.response?.data || error.message
            });
        }
    },

    // Get specific product
    getProduct: async (req, res) => {
        try {
            const { productId } = req.params;
            
            // First get the shop ID
            const shopResponse = await axios.get(
                'https://api.printify.com/v1/shops.json',
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const shopId = shopResponse.data[0]?.id;
            
            if (!shopId) {
                return res.status(404).json({ error: 'No shop found' });
            }

            // Then get the product using the shop ID
            const response = await axios.get(
                `https://api.printify.com/v1/shops/${shopId}/products/${productId}.json`,
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return res.json(response.data);
        } catch (error) {
            console.error('Error fetching product:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch product',
                details: error.response?.data || error.message
            });
        }
    },

    // Test connection
    testConnection: async (req, res) => {
        try {
            const response = await axios.get(
                'https://api.printify.com/v1/shops.json',
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return res.json({
                success: true,
                message: "Printify connection successful",
                shopId: process.env.SHOP_ID,
                shops: response.data
            });
        } catch (error) {
            console.error('Printify Error Details:', {
                message: error.message,
                config: error.config,
                response: error.response?.data
            });
            
            return res.status(500).json({
                success: false,
                message: "Printify connection failed",
                error: error.response?.data || error.message
            });
        }
    }
};

module.exports = { printifyController };