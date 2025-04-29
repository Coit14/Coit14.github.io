import printifyApi from '../utils/printifyApi.js';
import axios from 'axios';
import PRINTIFY_CONFIG from '../config/printify.js';

const printifyService = {
    getShops: async () => {
        try {
            const response = await printifyApi.get('/shops.json');
            return response.data;
        } catch (error) {
            console.error('Printify API Error Details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                message: error.message
            });
            throw printifyService.handleError(error);
        }
    },

    getProducts: async (shopId) => {
        try {
            const response = await printifyApi.get(`/shops/${shopId}/products.json`);
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
            // Make the request directly with axios instead of using printifyApi instance
            const response = await axios({
                method: 'delete',
                url: `https://api.printify.com/v1/shops/${shopId}/products/${productId}.json`,
                headers: {
                    'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
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
                status: error.response?.status
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
            // First get all products
            const productsResponse = await printifyApi.get(`/shops/${shopId}/products.json`);
            const products = productsResponse.data.data;
            
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

    publishProduct: async (shopId, productId) => {
        try {
            // First, check if the product exists and is ready to publish
            const productResponse = await axios({
                method: 'get',
                url: `https://api.printify.com/v1/shops/${shopId}/products/${productId}.json`,
                headers: {
                    'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            // Check if product has required fields for publishing
            const product = productResponse.data;
            if (!product.title || !product.description || !product.variants || product.variants.length === 0) {
                return {
                    success: false,
                    error: 'Product is not ready for publishing. Please ensure it has a title, description, and at least one variant.',
                    status: 400
                };
            }

            // Proceed with publishing
            const response = await axios({
                method: 'post',
                url: `https://api.printify.com/v1/shops/${shopId}/products/${productId}/publish.json`,
                headers: {
                    'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    title: product.title,
                    description: product.description,
                    shipping_template: product.shipping_template || 1,
                    print_provider_id: product.print_provider?.id || product.print_provider_id
                }
            });

            console.log('Publish response:', response.data);

            return {
                success: true,
                message: 'Product published successfully',
                productId,
                shopId,
                data: response.data
            };
        } catch (error) {
            console.error('Publish error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

            // Provide more specific error messages based on the error response
            let errorMessage = error.response?.data?.message || error.message;
            if (error.response?.status === 400) {
                errorMessage = 'Product validation failed. Please ensure all required fields are filled and valid.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Product not found. It may have been deleted.';
            }

            return {
                success: false,
                error: errorMessage,
                status: error.response?.status || 500,
                details: error.response?.data
            };
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