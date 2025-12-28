// controllers/checkoutController.js
const Order = require('../models/Order');
const Product = require('../models/Product');
const crypto = require('crypto');

// Security middleware
const validateSecurityToken = (req, res, next) => {
  const { securityToken, timestamp } = req.body;
  
  // Check if request is within reasonable time window (5 minutes)
  if (Date.now() - timestamp > 300000) {
    return res.status(419).json({
      success: false,
      message: 'Session expired. Please refresh and try again.'
    });
  }
  
  // Basic token validation (in production, use JWT or similar)
  if (!securityToken || securityToken.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Invalid security token'
    });
  }
  
  next();
};

// Create new order with enhanced security
exports.createOrder = [
  validateSecurityToken,
  async (req, res) => {
    try {
      const {
        items,
        shippingInfo,
        paymentMethod,
        subtotal,
        deliveryFee,
        total,
        mpesaPhone,
        securityToken,
        timestamp
      } = req.body;

      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Order items are required'
        });
      }

      // Validate and calculate totals
      let calculatedSubtotal = 0;
      const orderItems = [];
      const productUpdates = [];

      for (const item of items) {
        const product = await Product.findById(item.productId || item._id);
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.name} not found`
          });
        }

        if (product.inventory.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.name}. Only ${product.inventory.stock} available.`
          });
        }

        calculatedSubtotal += product.price * item.quantity;
        orderItems.push({
          product: item.productId || item._id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
          image: product.images?.[0]?.url || product.image
        });

        // Prepare stock update
        productUpdates.push({
          updateOne: {
            filter: { _id: item.productId || item._id },
            update: { $inc: { 'inventory.stock': -item.quantity } }
          }
        });
      }

      // Validate totals match
      const calculatedTotal = calculatedSubtotal + deliveryFee;
      if (Math.abs(calculatedTotal - total) > 1) { // Allow small rounding differences
        return res.status(400).json({
          success: false,
          message: 'Order total validation failed'
        });
      }

      // Generate unique order number
      const orderNumber = 'RC' + Date.now() + crypto.randomBytes(2).toString('hex').toUpperCase();

      // Create order
      const order = new Order({
        user: req.user._id,
        orderNumber,
        items: orderItems,
        shippingInfo: {
          ...shippingInfo,
          deliveryFee
        },
        paymentInfo: {
          method: paymentMethod,
          status: 'pending',
          mpesaPhone: paymentMethod === 'mpesa' ? mpesaPhone : undefined,
          securityToken: crypto.createHash('sha256').update(securityToken).digest('hex')
        },
        pricing: {
          subtotal: calculatedSubtotal,
          deliveryFee,
          total: calculatedTotal
        },
        status: 'confirmed'
      });

      const createdOrder = await order.save();

      // Update product stock
      if (productUpdates.length > 0) {
        await Product.bulkWrite(productUpdates);
      }

      // Populate order for response
      await createdOrder.populate('items.product', 'name images price');

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: createdOrder,
        orderId: createdOrder._id,
        orderNumber: createdOrder.orderNumber
      });

    } catch (error) {
      console.error('Order creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating order',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
      });
    }
  }
];

// Get user orders with pagination
exports.getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('items.product', 'name images');

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get order by ID with enhanced security
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name images price category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user or user is admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    // Sanitize sensitive data
    const orderData = order.toObject();
    if (orderData.paymentInfo) {
      delete orderData.paymentInfo.securityToken;
      // Only show last 4 digits of card if exists
      if (orderData.paymentInfo.cardLast4) {
        orderData.paymentInfo.cardNumber = `**** **** **** ${orderData.paymentInfo.cardLast4}`;
      }
    }

    res.json({
      success: true,
      data: orderData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (!['confirmed', 'pending'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.stock': item.quantity } }
      );
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};