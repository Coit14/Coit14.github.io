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
    const res = await printfulApi.post('/orders', orderData);
    return res.data.result;
  },

  getShippingRates: async (shippingData) => {
    const res = await printfulApi.post('/shipping/rates', shippingData);
    return res.data.result;
  },

  getVariantById: async (productId, variantId) => {
    const product = await printfulService.getProduct(productId);
    return product.variants.find(v => v.id === variantId);
  }
};

export default printfulService; 