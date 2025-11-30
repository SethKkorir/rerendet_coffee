// api/api.js - Add missing authentication functions
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // include cookies if server uses them
});

// ---- Auth ----
export const register = (payload) => API.post('/auth/register', payload);
export const verifyEmail = (payload) => API.post('/auth/verify-email', payload);
export const resendVerificationCode = (payload) => API.post('/auth/resend-verification', payload); // adjust endpoint if different
export const googleAuth = (payload) => API.post('/auth/google', payload); // adjust endpoint if different
export const login = (payload) => API.post('/auth/login', payload);
export const logout = () => API.post('/auth/logout');
export const checkEmail = (params) => API.get('/auth/check-email', { params });
export const forgotPassword = (payload) => API.post('/auth/forgot-password', payload);
export const resetPassword = (payload) => API.post('/auth/reset-password', payload);
export const reauth = (payload) => API.post('/auth/reauth', payload);
export const initChangeEmail = (payload) => API.post('/auth/profile/init-change-email', payload);
export const verifyPendingEmail = (params) => API.get('/auth/profile/verify-pending-email', { params });
export const updateName = (payload) => API.post('/auth/profile/update-name', payload);
export const changePassword = (payload) => API.post('/auth/profile/change-password', payload);

// ---- Profile ----
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (payload) => API.put('/auth/profile', payload);
export const saveShippingInfo = (payload) => API.put('/auth/shipping-info', payload);

// ---- Orders / Checkout ----
export const createOrder = (payload) => API.post('/orders/checkout', payload);
export const getMyOrders = () => API.get('/orders/my');
export const getOrderById = (orderId) => API.get(`/orders/${orderId}`);

// ---- Payments ----
export const processMpesaPayment = (payload) => API.post('/payments/mpesa', payload);
export const processCardPayment = (payload) => API.post('/payments/card', payload);
export const processCashOnDelivery = (payload) => API.post('/payments/cash-on-delivery', payload);
export const getPaymentMethods = (userId) => API.get(`/payments/methods/${userId}`);
export const setDefaultPaymentMethod = (methodId) => API.patch(`/payments/methods/${methodId}/set-default`);

// ---- Products / Admin (examples) ----
export const fetchProducts = (params) => API.get('/products', { params });
export const getProductById = (id) => API.get(`/products/${id}`);

// Default export for reuse
export default API;