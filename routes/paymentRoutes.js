// routes/paymentRoutes.js
import express from 'express';
import {
  initiateMpesaPayment,
  mpesaCallback,
  checkMpesaPaymentStatus
} from '../controllers/mpesaController.js';
import {
  initiateAirtelPayment,
  airtelCallback,
  checkAirtelPaymentStatus
} from '../controllers/airtelController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// M-Pesa routes
router.post('/mpesa/stk-push', protect, initiateMpesaPayment);
router.post('/mpesa-callback', mpesaCallback);
router.get('/mpesa/status/:paymentId', protect, checkMpesaPaymentStatus);

// Airtel Money routes
router.post('/airtel/request', protect, initiateAirtelPayment);
router.post('/airtel-callback', airtelCallback);
router.get('/airtel/status/:paymentId', protect, checkAirtelPaymentStatus);

export default router;