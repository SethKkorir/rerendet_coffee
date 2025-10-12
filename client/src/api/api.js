// api/api.js - Add missing authentication functions
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
export const updateProfile = (profileData) => API.put('/auth/profile', profileData);
export const saveShippingInfo = (shippingData) => API.put('/auth/shipping-info', shippingData);

// ADD MISSING AUTH FUNCTIONS HERE:
export const resendVerificationCode = (emailData) => API.post('/auth/resend-verification', emailData);
export const checkEmail = (email) => API.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
export const forgotPassword = (emailData) => API.post('/auth/forgot-password', emailData);
export const resetPassword = (passwordData) => API.post('/auth/reset-password', passwordData);

// Alias functions for compatibility (use existing functions)
export const getUserProfile = getProfile; // Alias for getProfile
export const updateUserProfile = updateProfile; // Alias for updateProfile

// ---------- DASHBOARD ----------
export const getDashboardData = () => API.get('/dashboard/data');
export const updatePreferences = (preferencesData) => API.put('/dashboard/preferences', preferencesData);
export const updatePassword = (passwordData) => API.put('/dashboard/security/password', passwordData);
export const deleteAccount = (deleteData) => API.delete('/dashboard/account', { data: deleteData });

// Address endpoints
export const getAddresses = () => API.get('/dashboard/addresses');
export const addAddress = (addressData) => API.post('/dashboard/addresses', addressData);
export const updateAddress = (id, addressData) => API.put(`/dashboard/addresses/${id}`, addressData);
export const deleteAddress = (id) => API.delete(`/dashboard/addresses/${id}`);

// Payment method endpoints
export const getPaymentMethods = () => API.get('/dashboard/payment-methods');
export const addPaymentMethod = (paymentData) => API.post('/dashboard/payment-methods', paymentData);
export const updatePaymentMethod = (id, paymentData) => API.put(`/dashboard/payment-methods/${id}`, paymentData);
export const deletePaymentMethod = (id) => API.delete(`/dashboard/payment-methods/${id}`);

// Security endpoints
export const getSecuritySettings = () => API.get('/dashboard/security/settings');
export const enable2FA = () => API.post('/dashboard/security/2fa/enable');
export const verify2FA = (tokenData) => API.post('/dashboard/security/2fa/verify', tokenData);
export const disable2FA = (passwordData) => API.post('/dashboard/security/2fa/disable', passwordData);
export const getLoginHistory = () => API.get('/dashboard/security/login-history');

// Orders endpoints
export const getDashboardOrders = (params = {}) => API.get('/dashboard/orders', { params });

// ---------- PRODUCTS ----------
export const fetchProducts = () => API.get('/products');
export const getFeaturedProducts = () => API.get('/products/featured');
export const getProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (productData) => API.post('/products', productData);
export const processCheckout = (checkoutData) => API.post('/orders/checkout', checkoutData);
export const calculateShipping = (shippingData) => API.post('/orders/calculate-shipping', shippingData);

// ---------- ORDERS ----------
export const createOrder = (orderData) => API.post('/orders', orderData);
export const getOrders = () => API.get('/orders');
export const getMyOrders = () => API.get('/orders/my-orders');

// ---------- M-PESA ----------
export const initiateMpesaPayment = (paymentData) => API.post('/mpesa/stkpush', paymentData);

// ---------- CART ----------
export const getCart = () => API.get('/cart');
export const getCartSummary = () => API.get('/cart/summary');
export const addToCart = (data) => API.post('/cart/items', data);
export const updateCartItem = (itemId, data) => API.put(`/cart/items/${itemId}`, data);
export const removeFromCart = (itemId) => API.delete(`/cart/items/${itemId}`);
export const clearCart = () => API.delete('/cart');
export const mergeCarts = (data) => API.post('/cart/merge', data);

// Interceptor → add token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;