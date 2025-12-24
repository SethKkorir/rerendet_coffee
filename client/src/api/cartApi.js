// // api/cartApi.js
// import api from './api';

// // Cart API functions
// export const getCart = () => {
//   return api.get('/api/cart');
// };

// export const getCartSummary = () => {
//   return api.get('/api/cart/summary');
// };

// export const addToCart = (data) => {
//   return api.post('/api/cart/items', data);
// };

// export const updateCartItem = (itemId, data) => {
//   return api.put(`/api/cart/items/${itemId}`, data);
// };

// export const removeFromCart = (itemId) => {
//   return api.delete(`/api/cart/items/${itemId}`);
// };

// export const clearCart = () => {
//   return api.delete('/api/cart');
// };

// export const mergeCarts = (data) => {
//   return api.post('/api/cart/merge', data);
// };

// export default {
//   getCart,
//   getCartSummary,
//   addToCart,
//   updateCartItem,
//   removeFromCart,
//   clearCart,
//   mergeCarts
// };