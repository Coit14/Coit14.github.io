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
      console.log('📦 Creating Printful draft order with data:', JSON.stringify(orderData, null, 2));
      
      // First, create a draft order
      const draftOrder = await printfulApi.post('/orders', {
        ...orderData,
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
      throw new Error(error.response?.data?.error?.message || 'Failed to create order');
    }
  },

  getShippingRates: async (shippingData) => {
    try {
      const res = await printfulApi.post('/shipping/rates', shippingData);
      
      // Format the response to include only necessary information
      return res.data.result.map(rate => ({
        id: rate.id,
        name: rate.name,
        cost: rate.rate,
        min_delivery_days: rate.min_delivery_days,
        max_delivery_days: rate.max_delivery_days
      }));
    } catch (error) {
      console.error('Error getting shipping rates:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to calculate shipping rates');
    }
  },

  getVariantById: async (productId, variantId) => {
    const product = await printfulService.getProduct(productId);
    return product.variants.find(v => v.id === variantId);
  }
};

export default printfulService; 