import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  image: {
    type: String,
    required: [true, 'Product image is required'],
    validate: {
      validator: function(url) {
        // Basic URL validation
        return url && url.length > 0;
      },
      message: 'Product image URL is invalid'
    }
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    set: function(price) {
      // Round to 2 decimal places for currency
      return Math.round(price * 100) / 100;
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [1000, 'Quantity cannot exceed 1000'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number'
    }
  },
  sku: {
    type: String,
    trim: true
  },
  weight: {
    type: Number,
    min: 0,
    default: 0 // in grams
  },
  variant: {
    type: String,
    trim: true,
    maxlength: [100, 'Variant cannot exceed 100 characters']
  },
  addedAt: {
    type: Date,
    default: Date.now,
    immutable: true // Cannot be changed once set
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  _id: false // Disable automatic _id for subdocuments to use our custom ID
}, {
  // Generate custom _id for cart items
  _id: true
});

// Pre-save middleware for cart items
cartItemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for item subtotal
cartItemSchema.virtual('subtotal').get(function() {
  return Math.round((this.price * this.quantity) * 100) / 100;
});

// Method to check if item quantity can be updated
cartItemSchema.methods.canUpdateQuantity = function(newQuantity, availableStock) {
  return newQuantity >= 1 && newQuantity <= 1000 && newQuantity <= availableStock;
};

// Method to update quantity with validation
cartItemSchema.methods.updateQuantity = function(newQuantity, availableStock) {
  if (!this.canUpdateQuantity(newQuantity, availableStock)) {
    throw new Error(`Invalid quantity: ${newQuantity}. Available stock: ${availableStock}`);
  }
  this.quantity = newQuantity;
  this.updatedAt = new Date();
  return this;
};

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true,
    index: true
  },
  sessionId: {
    type: String,
    index: true,
    sparse: true // For guest carts
  },
  items: {
    type: [cartItemSchema],
    default: [],
    validate: {
      validator: function(items) {
        // Check for duplicate products in cart
        const productIds = items.map(item => item.product.toString());
        return new Set(productIds).size === productIds.length;
      },
      message: 'Duplicate products are not allowed in cart'
    }
  },
  // Pricing breakdown
  subtotal: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    set: function(value) {
      return Math.round(value * 100) / 100;
    }
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    set: function(value) {
      return Math.round(value * 100) / 100;
    }
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    set: function(value) {
      return Math.round(value * 100) / 100;
    }
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
    set: function(value) {
      return Math.round(value * 100) / 100;
    }
  },
  discountCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    set: function(value) {
      return Math.round(value * 100) / 100;
    }
  },
  // Cart metadata
  currency: {
    type: String,
    default: 'KES',
    uppercase: true,
    enum: {
      values: ['KES', 'USD', 'EUR', 'GBP'],
      message: 'Currency {VALUE} is not supported'
    }
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'sw'] // English, Swahili
  },
  // Cart status and analytics
  status: {
    type: String,
    default: 'active',
    enum: {
      values: ['active', 'abandoned', 'converted', 'merged'],
      message: 'Status {VALUE} is not supported'
    },
    index: true
  },
  abandonedAt: {
    type: Date
  },
  convertedAt: {
    type: Date
  },
  // Shipping information (pre-filled if available)
  shippingMethod: {
    type: String,
    trim: true
  },
  estimatedDelivery: {
    type: String,
    trim: true
  },
  // Analytics fields
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastViewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove internal fields from JSON output
      delete ret.__v;
      delete ret.sessionId;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.sessionId;
      return ret;
    }
  }
});

// Compound indexes for better query performance
cartSchema.index({ user: 1, status: 1 });
cartSchema.index({ updatedAt: 1, status: 1 });
cartSchema.index({ sessionId: 1, status: 1 });

// ==================== VIRTUAL PROPERTIES ====================

cartSchema.virtual('itemsCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.virtual('uniqueItemsCount').get(function() {
  return this.items.length;
});

cartSchema.virtual('totalWeight').get(function() {
  return this.items.reduce((total, item) => total + (item.weight * item.quantity), 0);
});

cartSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.updatedAt) / (1000 * 60 * 60 * 24));
});

cartSchema.virtual('isEligibleForFreeShipping').get(function() {
  return this.subtotal >= 5000; // Free shipping over KSh 5000
});

cartSchema.virtual('hasItems').get(function() {
  return this.items.length > 0;
});

cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// ==================== INSTANCE METHODS ====================

/**
 * Calculate all cart totals and update the cart
 */
cartSchema.methods.calculateTotals = function() {
  // Calculate subtotal from all items
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  // Calculate shipping (free over KSh 5000)
  this.shippingPrice = this.isEligibleForFreeShipping ? 0 : 500;

  // Calculate tax (16% VAT on subtotal)
  this.taxPrice = Math.round(this.subtotal * 0.16 * 100) / 100;

  // Calculate final total
  this.totalPrice = this.subtotal + this.shippingPrice + this.taxPrice - this.discountAmount;

  return this;
};

/**
 * Find item by product ID
 */
cartSchema.methods.findItemByProductId = function(productId) {
  return this.items.find(item => 
    item.product.toString() === productId.toString()
  );
};

/**
 * Find item by cart item ID
 */
cartSchema.methods.findItemById = function(itemId) {
  return this.items.id(itemId);
};

/**
 * Add item to cart or update quantity if exists
 */
cartSchema.methods.addOrUpdateItem = function(product, quantity, variant = null) {
  const existingItem = this.findItemByProductId(product._id);
  
  if (existingItem) {
    // Update existing item
    existingItem.quantity += quantity;
    existingItem.updatedAt = new Date();
  } else {
    // Add new item
    this.items.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || product.image,
      price: product.price,
      quantity: quantity,
      sku: product.sku,
      weight: product.weight || 0,
      variant: variant,
      addedAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  this.calculateTotals();
  this.markModified('items');
  return existingItem ? 'updated' : 'added';
};

/**
 * Update item quantity with validation
 */
cartSchema.methods.updateItemQuantity = function(itemId, newQuantity, availableStock) {
  const item = this.findItemById(itemId);
  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (newQuantity < 1) {
    this.removeItem(itemId);
    return 'removed';
  }

  if (newQuantity > availableStock) {
    throw new Error(`Only ${availableStock} items available in stock`);
  }

  item.quantity = newQuantity;
  item.updatedAt = new Date();
  this.calculateTotals();
  this.markModified('items');
  
  return 'updated';
};

/**
 * Remove item from cart
 */
cartSchema.methods.removeItem = function(itemId) {
  const initialLength = this.items.length;
  this.items.pull(itemId);
  
  if (this.items.length < initialLength) {
    this.calculateTotals();
    return true;
  }
  return false;
};

/**
 * Clear all items from cart
 */
cartSchema.methods.clear = function() {
  this.items = [];
  this.subtotal = 0;
  this.shippingPrice = 0;
  this.taxPrice = 0;
  this.discountAmount = 0;
  this.discountCode = undefined;
  this.totalPrice = 0;
  return this;
};

/**
 * Apply discount to cart
 */
cartSchema.methods.applyDiscount = function(discountCode, discountAmount) {
  this.discountCode = discountCode;
  this.discountAmount = Math.min(discountAmount, this.subtotal);
  this.calculateTotals();
  return this;
};

/**
 * Remove discount from cart
 */
cartSchema.methods.removeDiscount = function() {
  this.discountCode = undefined;
  this.discountAmount = 0;
  this.calculateTotals();
  return this;
};

/**
 * Mark cart as abandoned
 */
cartSchema.methods.markAsAbandoned = function() {
  this.status = 'abandoned';
  this.abandonedAt = new Date();
  return this;
};

/**
 * Mark cart as converted (purchased)
 */
cartSchema.methods.markAsConverted = function() {
  this.status = 'converted';
  this.convertedAt = new Date();
  return this;
};

/**
 * Get cart summary for quick display
 */
cartSchema.methods.getSummary = function() {
  return {
    itemsCount: this.itemsCount,
    uniqueItemsCount: this.uniqueItemsCount,
    subtotal: this.subtotal,
    shippingPrice: this.shippingPrice,
    taxPrice: this.taxPrice,
    discountAmount: this.discountAmount,
    totalPrice: this.totalPrice,
    currency: this.currency,
    hasItems: this.hasItems
  };
};

/**
 * Check if cart contains a specific product
 */
cartSchema.methods.containsProduct = function(productId) {
  return this.items.some(item => item.product.toString() === productId.toString());
};

// ==================== STATIC METHODS ====================

/**
 * Find cart by user ID with population
 */
cartSchema.statics.findByUserId = function(userId, options = {}) {
  const query = this.findOne({ user: userId });
  
  if (options.populateItems) {
    query.populate('items.product', 'name images price countInStock isActive sku weight');
  }
  
  return query;
};

/**
 * Find cart by session ID (for guest users)
 */
cartSchema.statics.findBySessionId = function(sessionId, options = {}) {
  const query = this.findOne({ sessionId, status: 'active' });
  
  if (options.populateItems) {
    query.populate('items.product', 'name images price countInStock isActive sku weight');
  }
  
  return query;
};

/**
 * Find abandoned carts older than specified days
 */
cartSchema.statics.findAbandonedCarts = function(days = 3) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({
    status: 'active',
    updatedAt: { $lt: cutoffDate },
    items: { $exists: true, $not: { $size: 0 } }
  }).populate('items.product', 'name price');
};

/**
 * Cleanup old abandoned carts
 */
cartSchema.statics.cleanupOldCarts = async function(daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  const result = await this.deleteMany({
    $or: [
      // Empty carts older than cutoff
      { 
        items: { $size: 0 },
        updatedAt: { $lt: cutoffDate }
      },
      // Abandoned carts older than cutoff
      {
        status: 'abandoned',
        abandonedAt: { $lt: cutoffDate }
      }
    ]
  });
  
  return result;
};

/**
 * Get cart statistics
 */
cartSchema.statics.getCartStatistics = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        totalCarts: [
          { $count: 'count' }
        ],
        activeCarts: [
          { $match: { status: 'active', items: { $exists: true, $not: { $size: 0 } } } },
          { $count: 'count' }
        ],
        abandonedCarts: [
          { $match: { status: 'abandoned' } },
          { $count: 'count' }
        ],
        averageCartValue: [
          { $match: { totalPrice: { $gt: 0 } } },
          { $group: { _id: null, average: { $avg: '$totalPrice' } } }
        ],
        cartsByItemCount: [
          { $addFields: { itemCount: { $size: '$items' } } },
          { $group: { _id: '$itemCount', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]
      }
    }
  ]);
  
  return stats[0];
};

// ==================== MIDDLEWARE ====================

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('discountAmount')) {
    this.calculateTotals();
  }
  
  // Update lastViewedAt if cart is being viewed
  if (this.isModified('viewCount')) {
    this.lastViewedAt = new Date();
  }
  
  next();
});

// Pre-validate middleware to ensure data consistency
cartSchema.pre('validate', function(next) {
  // Ensure items array exists
  if (!this.items) {
    this.items = [];
  }
  
  // Ensure pricing fields are set
  if (this.subtotal === undefined) this.subtotal = 0;
  if (this.shippingPrice === undefined) this.shippingPrice = 0;
  if (this.taxPrice === undefined) this.taxPrice = 0;
  if (this.totalPrice === undefined) this.totalPrice = 0;
  
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;