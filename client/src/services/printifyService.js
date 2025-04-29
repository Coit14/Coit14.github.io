import BASE_URL, { API_URL } from '../config/config';

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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch products');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getPublishedProducts:', error);
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
      if (!response.ok) throw new Error('Failed to fetch product');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting product:', error);
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish product');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error publishing product:', error);
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
      if (!response.ok) throw new Error('Failed to test connection');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}; 