import axios from 'axios';
import { API_URL } from '../config/config.js';

const BASE_URL = `${API_URL}/api`;

export const getPublishedProducts = async () => {
  const res = await axios.get(`${BASE_URL}/products`);
  return res.data;
};

export const getProduct = async (id) => {
  const res = await axios.get(`${BASE_URL}/printful/products/${id}`);
  return res.data;
}; 