import axios from 'axios';
import PRINTIFY_CONFIG from '../config/printify.js';

const printifyApi = axios.create({
    baseURL: PRINTIFY_CONFIG.API_BASE_URL,
    headers: PRINTIFY_CONFIG.HEADERS
});

// Add minimal request logging
printifyApi.interceptors.request.use(request => {
    console.log('Making request to:', request.url);
    return request;
});

// Add minimal response logging
printifyApi.interceptors.response.use(response => {
    console.log('Response status:', response.status);
    
    // Only log counts for product endpoints
    if (response.config.url.includes('/products')) {
        if (Array.isArray(response.data?.data)) {
            console.log('Response contains:', response.data.data.length, 'items');
        } else {
            console.log('Response contains: single item');
        }
    }
    
    return response;
}, error => {
    console.error('API Error:', {
        message: error.message,
        status: error.response?.status
    });
    return Promise.reject(error);
});

// Export the axios instance
export default printifyApi;

// Note: Service methods have been moved to services/printifyService.js