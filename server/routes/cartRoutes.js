// routes/cartRoutes.js
import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  mergeCarts
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.route('/')
  .get(getCart)
  .delete(clearCart);

router.route('/summary')
  .get(getCartSummary);

router.route('/items')
  .post(addToCart);

router.route('/merge')
  .post(mergeCarts);

router.route('/items/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router;