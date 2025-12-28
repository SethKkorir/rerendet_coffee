import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['mpesa', 'card'],
    required: true
  },
  name: {
    type: String,
    required: [true, 'Payment method name is required'],
    trim: true,
    maxlength: [50, 'Payment method name cannot exceed 50 characters']
  },
  // For M-Pesa
  phone: {
    type: String
  },
  // For cards
  card: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index
paymentMethodSchema.index({ user: 1, isDefault: 1 }, { 
  partialFilterExpression: { isDefault: true } 
});

// Pre-save middleware to handle default payment method
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault && this.isActive) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

export default PaymentMethod;