// routes/paymentRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  processMpesaPayment, 
  processCardPayment 
} from '../controllers/paymentController.js';

const router = express.Router();

router.post('/mpesa', protect, processMpesaPayment);
router.post('/card', protect, processCardPayment);

export default router;