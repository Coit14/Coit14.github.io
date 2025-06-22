import printfulApi from '../config/printful.js';

const printfulService = {
  getProducts: async () => {
    const res = await printfulApi.get('/store/products');
    return res.data.result;
  },

  getProduct: async (id) => {
    const res = await printfulApi.get(`/store/products/${id}`);
    return res.data.result;
  },

  createOrder: async (orderData) => {
    try {
      // Validate shipping ID
      const shippingId = orderData.shipping?.method;
      if (!Number.isInteger(Number(shippingId)) || Number(shippingId) <= 0) {
        throw new Error('Invalid shipping ID provided');
      }

      // Prepare order data with correct shipping format
      const printfulOrderData = {
        ...orderData,
        shipping: shippingId // Just use the ID directly
      };

      console.log('📦 Creating Printful draft order with data:', JSON.stringify(printfulOrderData, null, 2));
      
      // First, create a draft order
      const draftOrder = await printfulApi.post('/orders', {
        ...printfulOrderData,
        status: 'draft'
      });

      console.log('✅ Draft order created:', draftOrder.data.result.id);

      // Then, confirm the order
      const confirmedOrder = await printfulApi.post(`/orders/${draftOrder.data.result.id}/confirm`);
      
      console.log('✅ Order confirmed:', confirmedOrder.data.result.id);
      return confirmedOrder.data.result;
    } catch (error) {
      console.error('❌ Error creating Printful order:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        orderData: JSON.stringify(orderData, null, 2)
      });
      throw new Error(error.response?.data?.error?.message || error.message || 'Failed to create order');
    }
  },

  getShippingRates: async (shippingData) => {
    try {
      // TODO: Remove before production – debugging Printful credentials
      console.log('[DEBUG] Printful API Key prefix:', process.env.PRINTFUL_API_KEY?.slice(0, 8) + '...');
      console.log('[DEBUG] Printful Store ID:', process.env.PRINTFUL_STORE_ID?.slice(0, 6) + '...');
      
      console.log('📦 Requesting shipping rates from Printful...');
      console.log('📦 API Key exists:', !!process.env.PRINTFUL_API_KEY);
      console.log('📦 Store ID:', process.env.PRINTFUL_STORE_ID || 'not set');
      
      // Ensure store ID is set
      if (!process.env.PRINTFUL_STORE_ID) {
        throw new Error('PRINTFUL_STORE_ID environment variable is required');
      }

      console.log('📦 Sending shipping request to Printful with data:', JSON.stringify(shippingData, null, 2));
      
      const res = await printfulApi.post('/shipping/rates', shippingData);
      
      console.log('📦 Printful response status:', res.status);
      console.log('📦 Printful response data:', JSON.stringify(res.data, null, 2));
      
      // Check if response has the expected structure
      if (!res.data || typeof res.data !== 'object') {
        console.error('❌ Invalid response structure from Printful shipping rates:', res.data);
        throw new Error('Invalid response structure from shipping rate calculation');
      }

      // Check if result exists and is an array (even if empty)
      if (!Array.isArray(res.data.result)) {
        console.error('❌ Invalid result format from Printful shipping rates:', res.data.result);
        throw new Error('Invalid result format from shipping rate calculation');
      }

      console.log('[DEBUG] Valid shipping rates received:', res.data.result);

      // Format and validate each rate
      const formattedRates = res.data.result.map(rate => {
        // Ensure rate is a valid number
        const rateValue = parseFloat(rate.rate);
        if (isNaN(rateValue)) {
          console.warn('⚠️ Invalid rate value received:', rate.rate);
          return null;
        }

        // Format delivery time
        const minDays = parseInt(rate.min_delivery_days, 10);
        const maxDays = parseInt(rate.max_delivery_days, 10);
        const deliveryTime = !isNaN(minDays) && !isNaN(maxDays)
          ? `${minDays}–${maxDays} days`
          : 'Delivery time varies';

        return {
          id: rate.id, // keep as string to support IDs like "STANDARD"
          name: rate.name,
          rate: rateValue.toFixed(2),
          delivery_time: deliveryTime,
          min_delivery_days: !isNaN(minDays) ? minDays : null,
          max_delivery_days: !isNaN(maxDays) ? maxDays : null
        };
      }).filter(rate => rate !== null && typeof rate.id === 'string' && rate.id.length > 0);

      if (formattedRates.length === 0) {
        throw new Error('No valid shipping rates available');
      }

      console.log('✅ Shipping rates retrieved successfully:', formattedRates);
      return formattedRates;
    } catch (error) {
      console.error('❌ Error getting shipping rates:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        request: shippingData,
        apiKeyExists: !!process.env.PRINTFUL_API_KEY,
        storeId: process.env.PRINTFUL_STORE_ID
      });
      
      // Provide more specific error messages based on the error type
      if (error.response?.status === 401) {
        throw new Error('Invalid Printful API key. Please check your configuration.');
      } else if (error.response?.status === 403) {
        throw new Error('Insufficient permissions. API key may not have shipping:calculate scope.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error?.message || 'Invalid request format';
        throw new Error(`Invalid request: ${errorMsg}`);
      } else if (error.response?.status === 404) {
        throw new Error('Shipping rates not available for this address and items.');
      } else {
        throw new Error(error.response?.data?.error?.message || error.message || 'Failed to calculate shipping rates');
      }
    }
  },

  getVariantById: async (productId, variantId) => {
    const product = await printfulService.getProduct(productId);
    return product.variants.find(v => v.id === variantId);
  }
};

export default printfulService; 