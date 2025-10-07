// api/api.js
import axios from 'axios';

const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// ---------- AUTH ----------
export const register = (userData) => API.post('/auth/register', userData);
export const verifyEmail = (verifyData) => API.post('/auth/verify-email', verifyData);
export const login = (userData) => API.post('/auth/login', userData);
export const googleAuth = (userData) => API.post('/auth/google', userData);
export const logout = () => API.post('/auth/logout');
export const getProfile = () => API.get('/auth/profile');

// ---------- PRODUCTS ----------
export const fetchProducts = () => API.get('/products');
export const getFeaturedProducts = () => API.get('/products/featured');
export const getProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (productData) => API.post('/products', productData);

// ---------- ORDERS ----------
export const createOrder = (orderData) => API.post('/orders', orderData);
export const getOrders = () => API.get('/orders');
export const getMyOrders = () => API.get('/orders/my-orders');

// ---------- M-PESA ----------
export const initiateMpesaPayment = (paymentData) => API.post('/mpesa/stkpush', paymentData);

// Interceptor → add token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;