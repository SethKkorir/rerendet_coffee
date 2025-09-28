// routes/cartRoutes.js
import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCart)
  .delete(protect, clearCart);

router.route('/items')
  .post(protect, addToCart);

router.route('/items/:itemId')
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

export default router;