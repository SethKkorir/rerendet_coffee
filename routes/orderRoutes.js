// routes/orderRoutes.js - NEW FILE
import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
  calculateShippingCost
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/shipping-cost', calculateShippingCost);

// Protected routes
router.use(protect);

// Customer routes
router.post('/', createOrder);
router.get('/my', getUserOrders);
router.get('/:id', getOrderById);

// Admin routes
router.get('/', admin, getOrders);
router.put('/:id/status', admin, updateOrderStatus);

export default router;