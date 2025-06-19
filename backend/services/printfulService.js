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
      console.log('📦 Requesting shipping rates from Printful...');
      
      // If no store ID is set, get it first
      if (!process.env.PRINTFUL_STORE_ID) {
        const storeInfo = await printfulApi.get('/store');
        process.env.PRINTFUL_STORE_ID = storeInfo.data.result.id;
        printfulApi.defaults.headers['X-PF-Store-Id'] = process.env.PRINTFUL_STORE_ID;
      }

      const res = await printfulApi.post('/shipping/rates', shippingData);
      
      if (!res.data?.result || !Array.isArray(res.data.result)) {
        console.error('❌ Invalid response from Printful shipping rates:', res.data);
        throw new Error('Invalid response from shipping rate calculation');
      }

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
          id: parseInt(rate.id, 10),
          name: rate.name,
          rate: rateValue.toFixed(2),
          delivery_time: deliveryTime,
          min_delivery_days: !isNaN(minDays) ? minDays : null,
          max_delivery_days: !isNaN(maxDays) ? maxDays : null
        };
      }).filter(rate => rate !== null && !isNaN(rate.id) && rate.id > 0);

      if (formattedRates.length === 0) {
        throw new Error('No valid shipping rates available');
      }

      console.log('✅ Shipping rates retrieved successfully:', formattedRates);
      return formattedRates;
    } catch (error) {
      console.error('❌ Error getting shipping rates:', {
        message: error.message,
        response: error.response?.data,
        request: shippingData
      });
      throw new Error(error.response?.data?.error?.message || error.message || 'Failed to calculate shipping rates');
    }
  },

  getVariantById: async (productId, variantId) => {
    const product = await printfulService.getProduct(productId);
    return product.variants.find(v => v.id === variantId);
  }
};

export default printfulService; 