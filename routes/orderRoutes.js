// routes/orderRoutes.js
import express from 'express';
import {
  processCheckout,
  getUserOrders,
  getOrderById,
  calculateShippingCost
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All order routes require authentication

router.post('/checkout', processCheckout);
// router
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);
router.post('/calculate-shipping', calculateShippingCost);

export default router;