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
            console.log(`📦 DELETE /shops/${shopId}/products/${productId}.json`);
            
            const response = await printifyApi.delete(`/shops/${shopId}/products/${productId}.json`);
            console.log("✅ Product deleted successfully");
            return response.data;
        } catch (error) {
            console.error("❌ Delete API error:", {
                status: error.response?.status,
                message: error.response?.data?.error || error.message,
                endpoint: error.config?.url,
                method: error.config?.method
            });
            throw error;
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

    calculateShipping: async (shopId, address, items) => {
        try {
            console.log(`📦 Requesting shipping rates for ${items.length} item(s)`);
            
            // Get shipping rates for each item
            const shippingRates = await Promise.all(items.map(async (item) => {
                try {
                    // Get full product data to extract blueprint and provider IDs
                    const product = await printifyService.getProduct(shopId, item.id);
                    const variant = product.variants.find(v => v.id === item.variantId);
                    
                    if (!variant) {
                        throw new Error(`Variant ${item.variantId} not found in product ${item.id}`);
                    }

                    if (!variant.is_enabled || !variant.is_available) {
                        throw new Error(`Variant ${item.variantId} is not available or enabled for product ${item.id}`);
                    }

                    const blueprintId = product.blueprint_id;
                    const printProviderId = product.print_provider_id;

                    console.log(`[Shipping] Product: ${product.title}, blueprint: ${blueprintId}, provider: ${printProviderId}, variant: ${item.variantId}`);

                    // Call V2 shipping endpoint
                    const response = await printifyApi.get(`/v2/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/shipping/standard.json`);
                    
                    // Find shipping rate for the variant and country
                    const shippingRate = response.data.find(rate => 
                        rate.variant_id === item.variantId && 
                        (rate.country === address.country || rate.country === 'REST_OF_THE_WORLD')
                    );

                    if (!shippingRate) {
                        console.warn(`⚠️ No shipping rate found for variant ${item.variantId} to ${address.country}`);
                        return null;
                    }

                    return {
                        id: `${item.id}-${item.variantId}`,
                        name: 'Standard Shipping',
                        cost: shippingRate.first_item.amount,
                        min_delivery_days: shippingRate.handling_time.from,
                        max_delivery_days: shippingRate.handling_time.to
                    };
                } catch (error) {
                    console.error(`❌ Error getting shipping rate for item ${item.id}:`, error.message);
                    return null;
                }
            }));

            // Filter out any null results and combine rates
            const validRates = shippingRates.filter(rate => rate !== null);
            
            if (validRates.length === 0) {
                throw new Error('No valid shipping rates found for any items');
            }

            console.log('✅ Shipping rates received:', validRates);
            return validRates;
        } catch (error) {
            console.error("❌ Shipping API error:", {
                status: error.response?.status,
                message: error.response?.data?.error || error.message,
                endpoint: error.config?.url,
                method: error.config?.method
            });
            throw error;
        }
    },

    calculateTax: async (shopId, address, items) => {
        try {
            console.log("📦 POST /orders/taxes");
            
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
            console.error("❌ Tax API error:", {
                status: error.response?.status,
                message: error.response?.data?.error || error.message,
                endpoint: error.config?.url,
                method: error.config?.method
            });
            throw error;
        }
    },

    createOrder: async (shopId, address, items, shippingMethod) => {
        try {
            console.log("📦 POST /orders.json");
            
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
            console.error("❌ Order API error:", {
                status: error.response?.status,
                message: error.response?.data?.error || error.message,
                endpoint: error.config?.url,
                method: error.config?.method
            });
            throw error;
        }
    },

    publishProduct: async (shopId, productId) => {
        try {
            console.log(`📦 POST /shops/${shopId}/products/${productId}/publish.json`);
            
            const response = await printifyApi.post(`/shops/${shopId}/products/${productId}/publish.json`);
            console.log("✅ Product published successfully");
            return response.data;
        } catch (error) {
            console.error("❌ Publish API error:", {
                status: error.response?.status,
                message: error.response?.data?.error || error.message,
                endpoint: error.config?.url,
                method: error.config?.method
            });
            throw error;
        }
    },

    unpublishProduct: async (shopId, productId) => {
        try {
            console.log(`📦 POST /shops/${shopId}/products/${productId}/unpublish.json`);
            
            const response = await printifyApi.post(`/shops/${shopId}/products/${productId}/unpublish.json`);
            console.log("✅ Product unpublished successfully");
            return response.data;
        } catch (error) {
            console.error("❌ Unpublish API error:", {
                status: error.response?.status,
                message: error.response?.data?.error || error.message,
                endpoint: error.config?.url,
                method: error.config?.method
            });
            throw error;
        }
    },

    getProductDetails: async (shopId, productId) => {
        try {
            console.log(`🔍 GET /shops/${shopId}/products/${productId}.json`);
            
            const response = await printifyApi.get(`/shops/${shopId}/products/${productId}.json`);
            const product = response.data;
            
            // Check if product is ready for shipping
            const isReadyForShipping = product.visible && 
                                    product.print_provider_id && 
                                    product.shipping_template && 
                                    product.published;

            if (!isReadyForShipping) {
                console.warn('⚠️ Product not ready for shipping:', {
                    id: product.id,
                    title: product.title,
                    missing: {
                        visible: !product.visible,
                        print_provider: !product.print_provider_id,
                        shipping_template: !product.shipping_template,
                        published: !product.published
                    }
                });
            }

            return {
                ...product,
                isReadyForShipping
            };
        } catch (error) {
            console.error("❌ Product API error:", {
                status: error.response?.status,
                message: error.response?.data?.error || error.message,
                endpoint: error.config?.url,
                method: error.config?.method
            });
            throw error;
        }
    },

    handleError: (error) => {
        // Don't transform 404 errors
        if (error.response?.status === 404) {
            return error;
        }
        
        console.error("❌ Printify API error:", {
            status: error.response?.status,
            message: error.response?.data?.error || error.message,
            endpoint: error.config?.url,
            method: error.config?.method
        });
        
        return new Error(error.response?.data?.error || error.message);
    }
};

export default printifyService;