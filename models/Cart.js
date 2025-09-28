// models/Cart.js
import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  itemsCount: {
    type: Number,
    required: true,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0
  },
  finalPrice: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.itemsCount = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + item.totalPrice, 0);
  
  // Calculate shipping (free over $50, otherwise $5.99)
  this.shippingPrice = this.totalPrice > 50 ? 0 : 5.99;
  
  // Calculate tax (8.5%)
  this.taxPrice = Math.round((this.totalPrice * 0.085) * 100) / 100;
  
  this.finalPrice = this.totalPrice + this.shippingPrice + this.taxPrice;
  
  next();
});

// Calculate item total price before saving items
cartItemSchema.pre('save', function(next) {
  this.totalPrice = this.price * this.quantity;
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;