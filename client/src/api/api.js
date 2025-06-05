// src/api/api.js
import axios from 'axios';

const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// Products API
export const fetchProducts = () => API.get('/products');
export const createProduct = (productData) => API.post('/products', productData);

// Auth API
export const register = (userData) => API.post('/users/register', userData);
export const login = (userData) => API.post('/users/login', userData);

// Orders API
export const createOrder = (orderData) => API.post('/orders', orderData);

// M-Pesa API
export const initiateMpesaPayment = (paymentData) => API.post('/mpesa/stkpush', paymentData);

// Add request interceptor to attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;