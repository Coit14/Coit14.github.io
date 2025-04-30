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

    calculateShipping: async (shopId, address, items) => {
        try {
            // Debug: Check available shops
            const shops = await printifyService.getShops();
            console.log("Available shops:", shops);

            // Debug block for shipping parameters
            console.log("Shipping Check:", {
                address,
                items: items.map(i => ({
                    product_id: i.id,
                    variant_id: i.variantId,
                    quantity: i.quantity
                }))
            });

            // Enhanced product and variant verification
            for (const item of items) {
                const product = await printifyService.getProduct(shopId, item.id);
                console.log("Fetched product for shipping:", {
                    product_id: product.id,
                    title: product.title,
                    total_variants: product.variants.length
                });

                // Find the specific variant
                const variant = product.variants.find(v => v.id === item.variantId);
                
                if (!variant) {
                    throw new Error(`Variant ${item.variantId} not found in product ${item.id}`);
                }

                console.log("Variant details:", {
                    variant_id: variant.id,
                    is_enabled: variant.is_enabled,
                    is_available: variant.is_available,
                    sku: variant.sku,
                    title: variant.title
                });

                if (!variant.is_enabled || !variant.is_available) {
                    throw new Error(`Variant ${item.variantId} is not available or enabled for product ${item.id}`);
                }
            }

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

    calculateTax: async (shopId, address, items) => {
        try {
            // Debug: Log tax calculation parameters
            console.log("Tax Calculation Check:", {
                shopId,
                address,
                items: items.map(i => ({
                    product_id: i.id,
                    variant_id: i.variantId,
                    quantity: i.quantity
                }))
            });

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

    createOrder: async (shopId, address, items, shippingMethod) => {
        try {
            // Debug: Log order creation parameters
            console.log("Order Creation Check:", {
                shopId,
                address,
                items: items.map(i => ({
                    product_id: i.id,
                    variant_id: i.variantId,
                    quantity: i.quantity
                })),
                shippingMethod
            });

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
            console.log(`[Publishing] Shop: ${shopId}, Product: ${productId}`);
            
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
            if (!product.title || !product.description || !product.variants || product.variants.length === 0 || !product.images || product.images.length === 0) {
                return {
                    success: false,
                    error: 'Product is not ready for publishing. Please ensure it has a title, description, images, and at least one variant.',
                    status: 400
                };
            }

            // Step 1: Update product tags
            console.log(`[Product ${productId}] Updating tags before publishing...`);
            try {
                const updateTagsResponse = await axios({
                    method: 'put',
                    url: `https://api.printify.com/v1/shops/${shopId}/products/${productId}.json`,
                    headers: {
                        'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        tags: ["coits", "root beer"]
                    }
                });
                console.log(`[Product ${productId}] Tags updated successfully`);
            } catch (tagsError) {
                console.error(`[Product ${productId}] Failed to update tags:`, {
                    message: tagsError.message,
                    status: tagsError.response?.status,
                    data: tagsError.response?.data
                });
                // Continue with publish attempt even if tags update fails
            }

            // Step 2: Proceed with publishing
            const publishResponse = await axios({
                method: 'post',
                url: `https://api.printify.com/v1/shops/${shopId}/products/${productId}/publish.json`,
                headers: {
                    'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    title: true,
                    description: true,
                    images: true,
                    variants: true,
                    tags: true
                }
            });

            console.log(`[Product ${productId}] Initial publish response:`, publishResponse.data);

            // Modified condition to ensure confirmation is sent
            // Since publishResponse.data is empty ({}), we'll use the response status instead
            if (publishResponse.status === 200) {
                console.log(`[Product ${productId}] Publish successful (status ${publishResponse.status})`);
                
                // Step 1: Send the standard publish confirmation
                try {
                    const confirmResponse = await axios({
                        method: 'post',
                        url: `https://api.printify.com/v1/shops/${shopId}/products/${productId}/publishing_succeeded.json`,
                        headers: {
                            'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log(`[Product ${productId}] Publishing confirmation successful:`, confirmResponse.data);
                } catch (confirmError) {
                    console.error(`[Product ${productId}] Failed to confirm publishing status:`, {
                        error: confirmError.message,
                        status: confirmError.response?.status,
                        data: confirmError.response?.data
                    });
                }

                // Step 2: Force confirm by setting "published: true"
                try {
                    const forceConfirmResponse = await axios({
                        method: 'put',
                        url: `https://api.printify.com/v1/shops/${shopId}/products/${productId}.json`,
                        headers: {
                            'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        data: {
                            published: true
                        }
                    });
                    console.log(`[Product ${productId}] Forced confirmation (published: true) complete.`);
                } catch (forceConfirmError) {
                    console.error(`[Product ${productId}] Forced publish confirmation failed:`, {
                        message: forceConfirmError.message,
                        status: forceConfirmError.response?.status,
                        data: forceConfirmError.response?.data
                    });
                    // Still continue as long as publish itself succeeded
                }
            } else {
                console.log(`[Product ${productId}] Publish response status ${publishResponse.status}, skipping confirmation`);
            }

            return {
                success: true,
                message: 'Product published successfully',
                productId,
                shopId,
                data: publishResponse.data
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
                if (error.response?.data?.errors?.reason) {
                    errorMessage = `Validation failed: ${error.response.data.errors.reason}`;
                } else {
                    errorMessage = 'Product validation failed. Please ensure all required fields are filled and valid.';
                }
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

    unpublishProduct: async (shopId, productId) => {
        try {
            // Make the request to unpublish
            const response = await axios({
                method: 'post',
                url: `https://api.printify.com/v1/shops/${shopId}/products/${productId}/unpublish.json`,
                headers: {
                    'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Unpublish response:', response.data);

            return {
                success: true,
                message: 'Product unpublished successfully',
                productId,
                shopId,
                data: response.data
            };
        } catch (error) {
            console.error('Unpublish error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

            // Provide specific error messages
            let errorMessage = error.response?.data?.message || error.message;
            if (error.response?.status === 404) {
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

    getProductDetails: async (shopId, productId) => {
        try {
            console.log(`🔍 Checking product details for shop ${shopId}, product ${productId}`);
            
            const response = await printifyApi.get(`/shops/${shopId}/products/${productId}.json`);
            const product = response.data;
            
            // Log critical shipping-related fields
            console.log('📦 Product Shipping Status:', {
                id: product.id,
                title: product.title,
                visible: product.visible,
                print_provider_id: product.print_provider_id,
                shipping_template: product.shipping_template,
                published: product.published,
                variants: product.variants.map(v => ({
                    id: v.id,
                    is_enabled: v.is_enabled,
                    is_available: v.is_available
                }))
            });

            // Check if product is ready for shipping
            const isReadyForShipping = product.visible && 
                                    product.print_provider_id && 
                                    product.shipping_template && 
                                    product.published;

            if (!isReadyForShipping) {
                console.warn('⚠️ Product not ready for shipping. Missing:', {
                    visible: !product.visible,
                    print_provider: !product.print_provider_id,
                    shipping_template: !product.shipping_template,
                    published: !product.published
                });
            }

            return {
                ...product,
                isReadyForShipping
            };
        } catch (error) {
            console.error('❌ Failed to get product details:', error);
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