import axios from 'axios';

const API = '/api/printful';

export const getPublishedProducts = async () => {
  const res = await axios.get(`${API}/products`);
  return res.data;
};

export const getProduct = async (id) => {
  const res = await axios.get(`${API}/products/${id}`);
  return res.data;
}; 