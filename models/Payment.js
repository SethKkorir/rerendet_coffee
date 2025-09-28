// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['mpesa', 'airtel_money', 'card', 'cash_on_delivery']
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KES',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  // M-Pesa specific fields
  mpesaTransactionId: String,
  mpesaReceiptNumber: String,
  mpesaPhoneNumber: String,
  
  // Airtel Money specific fields
  airtelTransactionId: String,
  airtelReference: String,
  airtelPhoneNumber: String,
  
  // Generic payment fields
  transactionId: String,
  referenceNumber: String,
  phoneNumber: String,
  
  paymentDate: Date,
  failureReason: String,
  
  // For callback handling
  callbackData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;