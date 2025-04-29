import BASE_URL, { API_URL } from '../config/config';

class PrintifyError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'PrintifyError';
    this.status = status;
    this.details = details;
  }
}

const handleResponse = async (response) => {
  let errorMessage = 'An unexpected error occurred';
  let errorDetails = null;

  try {
    const data = await response.json();
    if (!response.ok) {
      errorMessage = data.error || data.message || 'Request failed';
      errorDetails = data.details || null;
      throw new PrintifyError(errorMessage, response.status, errorDetails);
    }
    return data;
  } catch (error) {
    if (error instanceof PrintifyError) {
      throw error;
    }
    throw new PrintifyError(errorMessage, response.status, errorDetails);
  }
};

export const printifyService = {
  // Get all published products
  getPublishedProducts: async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error in getPublishedProducts:', {
        message: error.message,
        status: error.status,
        details: error.details
      });
      throw error;
    }
  },

  // Get specific product
  getProduct: async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error in getProduct:', {
        productId,
        message: error.message,
        status: error.status,
        details: error.details
      });
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/printify/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error in deleteProduct:', {
        productId,
        message: error.message,
        status: error.status,
        details: error.details
      });
      throw error;
    }
  },

  // Publish a product
  publishProduct: async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/printify/products/${productId}/publish`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error in publishProduct:', {
        productId,
        message: error.message,
        status: error.status,
        details: error.details
      });
      throw error;
    }
  },

  // Test Printify connection
  testConnection: async () => {
    try {
      const response = await fetch(`${API_URL}/api/printify-test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Error in testConnection:', {
        message: error.message,
        status: error.status,
        details: error.details
      });
      throw error;
    }
  }
}; 