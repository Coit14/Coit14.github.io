import axios from 'axios';
import PRINTIFY_CONFIG from '../config/printify.js';
import printifyService from '../services/printifyService.js';
import { getCachedProducts } from '../services/cacheService.js';

export const printifyController = {
    // Get all published products
    getPublishedProducts: async (req, res) => {
        try {
            // Get products from cache instead of API
            const products = getCachedProducts();
            
            // No additional filtering needed - cache is already filtered
            return res.json(products);
        } catch (error) {
            console.error('Error fetching products from cache:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch products',
                details: error.message
            });
        }
    },

    // Get specific product
    getProduct: async (req, res) => {
        try {
            const { productId } = req.params;
            
            // Get from cache and find specific product
            const products = getCachedProducts();
            const product = products.find(p => p.id === productId);
            
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            return res.json(product);
        } catch (error) {
            console.error('Error fetching product from cache:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch product',
                details: error.message
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