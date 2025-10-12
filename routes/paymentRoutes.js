// routes/paymentRoutes.js
import express from 'express';
import {
  processMpesaPayment,
  processCardPayment,
  processCashOnDelivery
} from '../controllers/paymentController.js';

const router = express.Router();

// Process payments
router.post('/mpesa', processMpesaPayment);
router.post('/card', processCardPayment);
router.post('/cash-on-delivery', processCashOnDelivery);

// Get payment methods for user
router.get('/methods/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const paymentMethods = await PaymentMethod.find({ 
      user: userId, 
      isActive: true 
    }).sort({ isDefault: -1, createdAt: -1 });
    
    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment methods',
      error: error.message
    });
  }
});

// Set default payment method
router.patch('/methods/:methodId/set-default', async (req, res) => {
  try {
    const { methodId } = req.params;
    const { userId } = req.body;

    await PaymentMethod.updateMany(
      { user: userId },
      { $set: { isDefault: false } }
    );

    await PaymentMethod.findByIdAndUpdate(methodId, {
      isDefault: true
    });

    res.json({
      success: true,
      message: 'Default payment method updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating default payment method',
      error: error.message
    });
  }
});

export default router;