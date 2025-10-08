// controllers/paymentController.js
import Order from '../models/Order.js';
import axios from 'axios';

// Process M-Pesa payment
export async function processMpesaPayment(req, res) {
  try {
    const { phone, amount, orderId } = req.body;

    // Validate phone number
    if (!phone.startsWith('+254') || phone.length !== 13) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Use +254 format'
      });
    }

    // In a real implementation, you would integrate with Safaricom M-Pesa API
    // This is a mock implementation
    const mpesaResponse = await simulateMpesaSTKPush(phone, amount);

    if (mpesaResponse.success) {
      // Update order payment status
      await Order.findByIdAndUpdate(orderId, {
        'paymentInfo.status': 'completed',
        'paymentInfo.transactionId': mpesaResponse.transactionId,
        'paymentInfo.completedAt': new Date()
      });

      res.json({
        success: true,
        message: 'M-Pesa payment initiated successfully',
        data: {
          transactionId: mpesaResponse.transactionId,
          instructions: 'Check your phone to complete payment'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'M-Pesa payment failed',
        error: mpesaResponse.error
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing M-Pesa payment',
      error: error.message
    });
  }
};

// Process card payment
export async function processCardPayment(req, res) {
  try {
    const { cardNumber, expiry, cvv, name, amount, orderId } = req.body;

    // Validate card details
    if (!validateCardNumber(cardNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card number'
      });
    }

    // Simulate card payment processing
    const paymentResult = await simulateCardPayment({
      cardNumber,
      expiry,
      cvv,
      name,
      amount
    });

    if (paymentResult.success) {
      // Update order payment status
      await Order.findByIdAndUpdate(orderId, {
        'paymentInfo.status': 'completed',
        'paymentInfo.transactionId': paymentResult.transactionId,
        'paymentInfo.completedAt': new Date()
      });

      res.json({
        success: true,
        message: 'Card payment processed successfully',
        data: {
          transactionId: paymentResult.transactionId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Card payment failed',
        error: paymentResult.error
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing card payment',
      error: error.message
    });
  }
};

// Mock M-Pesa STK Push simulation
async function simulateMpesaSTKPush(phone, amount) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate successful payment 90% of the time
  const success = Math.random() > 0.1;

  if (success) {
    return {
      success: true,
      transactionId: 'MPE' + Date.now(),
      message: 'STK Push sent successfully'
    };
  } else {
    return {
      success: false,
      error: 'Payment request cancelled by user'
    };
  }
}

// Mock card payment simulation
async function simulateCardPayment(cardDetails) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate successful payment 85% of the time
  const success = Math.random() > 0.15;

  if (success) {
    return {
      success: true,
      transactionId: 'CRD' + Date.now(),
      message: 'Payment authorized'
    };
  } else {
    return {
      success: false,
      error: 'Insufficient funds'
    };
  }
}

// Basic card number validation
function validateCardNumber(cardNumber) {
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^[0-9]{13,16}$/.test(cleaned);
}