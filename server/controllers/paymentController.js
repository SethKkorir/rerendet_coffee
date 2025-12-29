// controllers/paymentController.js
import Order from '../models/Order.js';
import PaymentMethod from '../models/PaymentMethod.js';
import sendEmail from '../utils/sendEmail.js';

// Process M-Pesa payment
// Process M-Pesa payment - MOVED TO mpesaController.js
// export async function processMpesaPayment(req, res) { ... }

// Process card payment
// Process card payment - MOVED TO stripeController.js
// export async function processCardPayment(req, res) { ... }

// Process cash on delivery
export async function processCashOnDelivery(req, res) {
  try {
    const { orderId } = req.body;

    // Update order for cash on delivery
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        status: 'confirmed'
      },
      { new: true }
    ).populate('user');

    // Send order confirmation email
    await sendOrderConfirmation(updatedOrder);

    res.json({
      success: true,
      message: 'Order confirmed with cash on delivery',
      data: {
        order: updatedOrder
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing cash on delivery order',
      error: error.message
    });
  }
}

// Send order confirmation email
async function sendOrderConfirmation(order) {
  try {
    const user = order.user;
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
          <strong>${item.name}</strong><br>
          <small style="color: #666;">Qty: ${item.quantity}</small>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
          KES ${item.itemTotal.toLocaleString()}
        </td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.6; 
            color: #1a1a1a; 
            margin: 0; 
            padding: 0; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff; 
          }
          .header { 
            background: #1a1a1a; 
            color: white; 
            padding: 2rem; 
            text-align: center; 
          }
          .content { 
            padding: 2rem; 
          }
          .order-card { 
            background: #f8f8f8; 
            border-radius: 12px; 
            padding: 1.5rem; 
            margin: 1.5rem 0; 
          }
          .order-table { 
            width: 100%; 
            border-collapse: collapse; 
          }
          .total-row { 
            border-top: 2px solid #e5e5e5; 
            font-weight: bold; 
            font-size: 1.1em; 
          }
          .status-badge { 
            background: #10b981; 
            color: white; 
            padding: 0.5rem 1rem; 
            border-radius: 20px; 
            display: inline-block; 
            font-weight: 600; 
          }
          .footer { 
            text-align: center; 
            padding: 2rem; 
            color: #666; 
            font-size: 0.9em; 
            border-top: 1px solid #e5e5e5; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>☕ Rerendet Coffee</h1>
            <h2>Order Confirmed!</h2>
            <p>Thank you for your order, ${order.shippingAddress.firstName}!</p>
          </div>
          
          <div class="content">
            <div class="status-badge">
              Order #${order.orderNumber} • ${order.status.toUpperCase()}
            </div>
            
            <div class="order-card">
              <h3 style="margin-top: 0;">Order Summary</h3>
              <table class="order-table">
                ${itemsHtml}
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
                    <strong>Subtotal</strong>
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
                    KES ${order.subtotal.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
                    <strong>Shipping</strong>
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
                    KES ${order.shippingCost.toLocaleString()}
                  </td>
                </tr>
                <tr class="total-row">
                  <td style="padding: 12px;">
                    <strong>Total</strong>
                  </td>
                  <td style="padding: 12px; text-align: right;">
                    <strong>KES ${order.total.toLocaleString()}</strong>
                  </td>
                </tr>
              </table>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1.5rem 0;">
              <div>
                <h4>Shipping Address</h4>
                <p>
                  ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                  ${order.shippingAddress.address}<br>
                  ${order.shippingAddress.city}<br>
                  ${order.shippingAddress.country}<br>
                  ${order.shippingAddress.phone}
                </p>
              </div>
              <div>
                <h4>Payment Method</h4>
                <p>
                  ${order.paymentMethod.toUpperCase()}<br>
                  ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  ${order.transactionId ? `<br>Ref: ${order.transactionId}` : ''}
                </p>
              </div>
            </div>

            <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; border-left: 4px solid #0ea5e9;">
              <strong>What's Next?</strong><br>
              We're preparing your order and will notify you when it ships. Expected delivery: 2-3 business days.
            </div>
          </div>

          <div class="footer">
            <p>Need help? Contact us at support@rerendetcoffee.com</p>
            <p>© 2024 Rerendet Coffee. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: order.shippingAddress.email,
      subject: `Order Confirmation - #${order.orderNumber}`,
      html: emailHtml
    });

    console.log(`✅ Order confirmation email sent to ${order.shippingAddress.email}`);

  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    // Don't throw to avoid blocking order processing
  }
}

// Update user's M-Pesa payment method
async function updateUserPaymentMethod(userId, type, phone) {
  try {
    await PaymentMethod.findOneAndUpdate(
      { user: userId, type: 'mpesa' },
      {
        user: userId,
        type: 'mpesa',
        name: 'M-Pesa',
        phone: phone,
        isDefault: true,
        isActive: true
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error updating M-Pesa payment method:', error);
  }
}

// Save card payment method
async function saveCardPaymentMethod(userId, cardDetails) {
  try {
    await PaymentMethod.findOneAndUpdate(
      { user: userId, type: 'card', 'card.last4': cardDetails.last4 },
      {
        user: userId,
        type: 'card',
        name: `${cardDetails.brand} •••• ${cardDetails.last4}`,
        card: {
          last4: cardDetails.last4,
          brand: cardDetails.brand,
          expiryMonth: cardDetails.expiryMonth,
          expiryYear: cardDetails.expiryYear
        },
        isDefault: true,
        isActive: true
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error saving card payment method:', error);
  }
}

// Mock payment simulations (same as before)
async function simulateMpesaSTKPush(phone, amount) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const success = Math.random() > 0.1;

  if (success) {
    return {
      success: true,
      transactionId: 'MPE' + Date.now()
    };
  } else {
    return {
      success: false,
      error: 'Payment request cancelled by user'
    };
  }
}

async function simulateCardPayment(cardDetails, amount) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const success = Math.random() > 0.15;

  if (success) {
    return {
      success: true,
      transactionId: 'CRD' + Date.now()
    };
  } else {
    return {
      success: false,
      error: 'Insufficient funds'
    };
  }
}

function validateCardDetails(cardDetails) {
  return cardDetails &&
    cardDetails.last4 &&
    cardDetails.brand &&
    cardDetails.expiryMonth &&
    cardDetails.expiryYear;
}

export default {
  // processMpesaPayment,
  // processCardPayment,
  processCashOnDelivery,
  processAirtelPayment,
  getAirtelPaymentStatus
};

// Process Airtel Money payment
export async function processAirtelPayment(req, res) {
  try {
    const { phoneNumber, amount, orderId, userId } = req.body;

    // Validate phone number (Airtel usually starts with +25473... or +25478...)
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Mock Airtel payment simulation
    const airtelResponse = await simulateAirtelPush(phoneNumber, amount);

    if (airtelResponse.success) {
      // Update order with payment details
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentMethod: 'airtel',
          paymentStatus: 'paid', // Instant for mock
          transactionId: airtelResponse.transactionId,
          status: 'confirmed'
        },
        { new: true }
      ).populate('user');

      // Send order confirmation email
      await sendOrderConfirmation(updatedOrder);

      // Update user's payment method if needed
      await updateUserPaymentMethod(userId, 'airtel', phoneNumber);

      res.json({
        success: true,
        message: 'Airtel Money payment successful',
        data: {
          transactionId: airtelResponse.transactionId,
          order: updatedOrder,
          paymentId: airtelResponse.transactionId
        }
      });
    } else {
      // Update order with failed payment status
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed'
      });

      res.status(400).json({
        success: false,
        message: 'Airtel Money payment failed',
        error: airtelResponse.error
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing Airtel Money payment',
      error: error.message
    });
  }
}

// Get Airtel Payment Status (Mock)
export async function getAirtelPaymentStatus(req, res) {
  const { paymentId } = req.params;
  // Mock response
  res.json({
    success: true,
    data: {
      status: 'COMPLETED',
      paymentId
    }
  });
}

async function simulateAirtelPush(phone, amount) {
  await new Promise(resolve => setTimeout(resolve, 2000));
  const success = true; // High success rate for mock

  if (success) {
    return {
      success: true,
      transactionId: 'AIR' + Date.now()
    };
  } else {
    return {
      success: false,
      error: 'Transaction failed'
    };
  }
}