import axios from 'axios';
import PRINTIFY_CONFIG from '../config/printify.js';

const printifyApi = axios.create({
    baseURL: PRINTIFY_CONFIG.API_BASE_URL,
    headers: PRINTIFY_CONFIG.HEADERS
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

// Export the axios instance
export default printifyApi;

// Note: Service methods have been moved to services/printifyService.js