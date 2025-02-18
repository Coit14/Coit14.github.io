import axios from 'axios';
import PRINTIFY_CONFIG from '../config/printify.js';

const printifyApi = axios.create({
    baseURL: 'https://api.printify.com/v1',
    headers: {
        'Authorization': `Bearer ${PRINTIFY_CONFIG.API_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

// Add request logging
printifyApi.interceptors.request.use(request => {
    console.log('Making request to:', request.url);
    console.log('Request headers:', JSON.stringify(request.headers, null, 2));
    return request;
});

// Add response logging
printifyApi.interceptors.response.use(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response;
}, error => {
    console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
    });
    return Promise.reject(error);
});

const printifyService = {
    // Get shop information
    getShops: async () => {
        try {
            const response = await printifyApi.get('/shops.json');
            return response.data;
        } catch (error) {
            console.error('Failed to get shops:', {
                status: error.response?.status,
                message: error.message
            });
            throw error;
        }
    },

    // Get all products for a shop
    getShopProducts: async (shopId) => {
        try {
            const response = await printifyApi.get(`/shops/${shopId}/products.json`);
            // Return the entire response data
            return response;
        } catch (error) {
            console.error('Failed to get products:', {
                status: error.response?.status,
                message: error.message
            });
            throw error;
        }
    },

    // Get catalog blueprints
    getCatalogBlueprints: async () => {
        const response = await printifyApi.get('/catalog/blueprints.json');
        return response.data;
    },

    // Get specific product details
    getProduct: async (shopId, productId) => {
        const response = await printifyApi.get(`/shops/${shopId}/products/${productId}.json`);
        return response.data;
    },

    // Get publishing status of a product
    getPublishingStatus: async (shopId, productId) => {
        const response = await printifyApi.get(`/shops/${shopId}/products/${productId}/publishing.json`);
        return response.data;
    }
};

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const SHOP_ID = process.env.SHOP_ID;

export const checkPublishingStatus = async () => {
    try {
        const response = await axios.get(`https://api.printify.com/v1/shops/${SHOP_ID}/products.json`, {
            headers: {
                'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data.data.filter(product => product.status === 'publishing');
    } catch (error) {
        console.error('Error checking publishing status:', error);
        throw error;
    }
};

export const publishProduct = async (productId) => {
    try {
        const response = await axios.post(
            `https://api.printify.com/v1/shops/${SHOP_ID}/products/${productId}/publish.json`,
            {},  // empty body
            {
                headers: {
                    'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error(`Error publishing product ${productId}:`, error);
        throw error;
    }
};

export default printifyService;