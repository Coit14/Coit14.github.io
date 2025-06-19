import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const printfulApi = axios.create({
  baseURL: 'https://api.printful.com',
  headers: {
    'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
    'Content-Type': 'application/json',
    ...(process.env.PRINTFUL_STORE_ID && {
      'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID
    })
  },
});

// Add response interceptor for better error handling
printfulApi.interceptors.response.use(
  response => response,
  error => {
    console.error('Printful API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: {
          ...error.config?.headers,
          Authorization: 'REDACTED' // Don't log the actual token
        }
      }
    });
    throw error;
  }
);

export default printfulApi; 