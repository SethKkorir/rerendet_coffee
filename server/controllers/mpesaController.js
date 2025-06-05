// controllers/mpesaController.js
const axios = require('axios');
const Order = require('../models/Order');

// @desc    Initiate M-Pesa payment
// @route   POST /api/mpesa/stkpush
// @access  Private
exports.initiateSTKPush = async (req, res, next) => {
  const { phone, amount, orderId } = req.body;
  
  try {
    // In a real implementation, this would call the M-Pesa API
    // For demo purposes, we'll simulate a successful response
    
    // Update order as paid
    const order = await Order.findById(orderId);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: `MP${Date.now()}`,
        status: 'success',
        update_time: Date.now(),
        phone_number: phone
      };
      
      await order.save();
    }

    res.json({
      success: true,
      message: 'M-Pesa payment initiated successfully',
      data: {
        CheckoutRequestID: `ws_CO_${Date.now()}`,
        ResponseCode: '0',
        ResponseDescription: 'Success'
      }
    });
  } catch (err) {
    next(err);
  }
};