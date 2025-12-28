import express from 'express';
import { handleMpesaWebhook, handleStripeWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// MPESA STK Push Callback
router.post('/mpesa', handleMpesaWebhook);

// Stripe Webhook
router.post('/stripe', handleStripeWebhook);

export default router;
