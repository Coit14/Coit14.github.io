import axios from 'axios';

export const getPublishedProducts = async () => {
  const res = await axios.get('/api/products');
  return res.data;
};

export const getProduct = async (id) => {
  const res = await axios.get(`/api/printful/products/${id}`);
  return res.data;
}; 