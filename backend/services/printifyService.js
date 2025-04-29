import printifyApi from '../utils/printifyApi.js';
import axios from 'axios';
import PRINTIFY_CONFIG from '../config/printify.js';

const printifyService = {
    getShops: async () => {
        try {
            console.log('Making request to Printify API...');
            const response = await printifyApi.get('/shops.json');
            console.log('Response status:', response.status);
            console.log('Response data:', JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('Printify API Error Details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            throw printifyService.handleError(error);
        }
    },

    getProducts: async (shopId) => {
        try {
            console.log(`Fetching products for shop ${shopId}...`);
            const response = await printifyApi.get(`/shops/${shopId}/products.json`);
            console.log(`Found ${response.data.data.length} products`);
            return response.data;
        } catch (error) {
            throw printifyService.handleError(error);
        }
    },

    getProduct: async (shopId, productId) => {
        try {
            const response = await printifyApi.get(`/shops/${shopId}/products/${productId}.json`);
            return response.data;
        } catch (error) {
            throw printifyService.handleError(error);
        }
    },

    deleteProduct: async (shopId, productId) => {
        try {
            console.log(`Deleting product ${productId} from shop ${shopId}...`);
            
            // Make the request directly with axios instead of using printifyApi instance
            const response = await axios({
                method: 'delete',
                url: `${process.env.PRINTIFY_API_URL}/shops/${shopId}/products/${productId}.json`,
                headers: {
                    'Authorization': `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                validateStatus: function (status) {
                    // Consider both 200 and 404 as successful responses
                    return status === 200 || status === 404;
                }
            });

            // If we get here, either the delete was successful or the product didn't exist
            return {
                success: true,
                message: response.status === 404 
                    ? 'Product already deleted or does not exist'
                    : 'Product deleted successfully',
                productId,
                shopId
            };
            
        } catch (error) {
            console.error('Delete error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            
            // Return a consistent error format
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                status: error.response?.status || 500
            };
        }
    },

    deleteAllProducts: async (shopId) => {
        try {
            console.log(`Fetching all products from shop ${shopId}...`);
            
            // First get all products
            const productsResponse = await printifyApi.get(`/shops/${shopId}/products.json`);
            const products = productsResponse.data.data;
            
            console.log(`Found ${products.length} products to delete`);
            
            // Delete each product
            const results = await Promise.all(
                products.map(async (product) => {
                    try {
                        await printifyService.deleteProduct(shopId, product.id);
                        return {
                            id: product.id,
                            success: true
                        };
                    } catch (error) {
                        return {
                            id: product.id,
                            success: false,
                            error: error.message
                        };
                    }
                })
            );
            
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            
            return {
                success: true,
                message: `Deleted ${successful} products${failed > 0 ? `, ${failed} failed` : ''}`,
                results
            };
            
        } catch (error) {
            console.error('Failed to delete all products:', error);
            return {
                success: false,
                error: error.message,
                status: error.response?.status || 500
            };
        }
    },

    calculateShipping: async (address, items) => {
        try {
            const response = await printifyApi.post('/orders/shipping-rates', {
                address,
                items: items.map(item => ({
                    product_id: item.id,
                    variant_id: item.variantId,
                    quantity: item.quantity
                }))
            });
            return response.data;
        } catch (error) {
            throw printifyService.handleError(error);
        }
    },

    calculateTax: async (address, items) => {
        try {
            const response = await printifyApi.post('/orders/taxes', {
                address,
                items: items.map(item => ({
                    product_id: item.id,
                    variant_id: item.variantId,
                    quantity: item.quantity
                }))
            });
            return response.data;
        } catch (error) {
            throw printifyService.handleError(error);
        }
    },

    createOrder: async (address, items, shippingMethod) => {
        try {
            const response = await printifyApi.post('/orders.json', {
                external_id: `order_${Date.now()}`,
                shipping_method: shippingMethod.id,
                address,
                items: items.map(item => ({
                    product_id: item.id,
                    variant_id: item.variantId,
                    quantity: item.quantity
                }))
            });
            return response.data;
        } catch (error) {
            throw printifyService.handleError(error);
        }
    },

    handleError: (error) => {
        // Don't transform 404 errors
        if (error.response?.status === 404) {
            return error;
        }
        
        const errorMessage = error.response?.data?.message || error.message;
        console.error('Printify API Error:', errorMessage);
        return new Error(errorMessage);
    }
};

export default printifyService;