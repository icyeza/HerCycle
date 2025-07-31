import axios from './axios';

export const fetchProducts = () => axios.get('/products');
export const fetchProductById = (id) => axios.get(`/products/${id}`);