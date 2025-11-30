// controllers/orderController.js - ADD MISSING IMPORT
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { calculateShipping } from '../utils/shippingCalculator.js';
import mongoose from 'mongoose';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { 
      shippingAddress, 
      paymentMethod, 
      items, 
      subtotal,
      shippingCost,
      totalAmount,
      notes 
    } = req.body;

    const userId = req.user._id;

    console.log('🛒 Creating order for user:', userId);
    console.log('📦 Order items:', items?.length);

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddress || !paymentMethod) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment method are required'
      });
    }

    // Generate order number manually
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Process order items and validate stock
    let calculatedSubtotal = 0;
    const orderItems = [];
    const stockUpdates = [];

    for (const item of items) {
      // Validate item structure
      if (!item.product || !item.name || !item.price || !item.quantity || !item.size) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Invalid item data. All item fields are required.'
        });
      }

      const product = await Product.findById(item.product).session(session);
      
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.name}`
        });
      }

      // Check stock availability
      if (product.inventory.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.inventory.stock}, Requested: ${item.quantity}`
        });
      }

      const itemPrice = parseFloat(item.price);
      const itemQuantity = parseInt(item.quantity);
      const itemTotal = itemPrice * itemQuantity;
      calculatedSubtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: item.name,
        price: itemPrice,
        quantity: itemQuantity,
        size: item.size,
        image: item.image || product.images?.[0]?.url || '/default-product.jpg',
        itemTotal: itemTotal
      });

      stockUpdates.push({
        productId: product._id,
        quantity: itemQuantity,
        currentStock: product.inventory.stock
      });
    }

    // Calculate final amounts
    const finalSubtotal = calculatedSubtotal > 0 ? calculatedSubtotal : (parseFloat(subtotal) || 0);
    const finalShippingCost = parseFloat(shippingCost) || 0;
    const finalTotal = parseFloat(totalAmount) || (finalSubtotal + finalShippingCost);

    console.log('💰 Order amounts:', {
      subtotal: finalSubtotal,
      shipping: finalShippingCost,
      total: finalTotal
    });

    // Create order
    const order = new Order({
      orderNumber: orderNumber,
      user: userId,
      items: orderItems,
      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        county: shippingAddress.county,
        country: shippingAddress.country || 'Kenya',
        postalCode: shippingAddress.postalCode || ''
      },
      subtotal: finalSubtotal,
      shippingCost: finalShippingCost,
      total: finalTotal,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      status: 'confirmed',
      notes: notes || ''
    });

    console.log('📝 Saving order to database...');

    const savedOrder = await order.save({ session });

    // ✅ FIXED: Update product stock - SIMPLIFIED VERSION
    for (const update of stockUpdates) {
      const newStock = update.currentStock - update.quantity;
      
      await Product.findByIdAndUpdate(
        update.productId,
        { 
          $inc: { 'inventory.stock': -update.quantity },
          $set: { 
            inStock: newStock > 0
          }
        },
        { session }
      );
      
      console.log(`📦 Updated stock for product ${update.productId}: ${update.currentStock} -> ${newStock}`);
    }

    await session.commitTransaction();
    session.endSession();

    console.log('✅ Order saved successfully:', savedOrder.orderNumber);

    // Populate order for response
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name images category');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: populatedOrder
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('❌ Order creation error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user orders
// @route   GET /api/orders/my
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments({ user: userId })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
     try {
    console.log('🔍 Fetching order:', req.params.id);
    console.log('👤 Current user:', { 
      id: req.user._id, 
      role: req.user.role, // or userType
      email: req.user.email 
    });
    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone role')
      .populate('items.product', 'name images price category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // FIXED: Check if order belongs to user or user is admin
    // Use req.user.role instead of req.user.userType
    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin'; // Changed from userType to role

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('❌ Get order by ID error:', error);
    
    // More specific error handling
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    search,
    startDate,
    endDate 
  } = req.query;

  const skip = (page - 1) * limit;
  let filter = {};

  try {
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'user.firstName': { $regex: search, $options: 'i' } },
        { 'user.lastName': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'firstName lastName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, adminNotes } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(trackingNumber && { trackingNumber }),
        ...(adminNotes && { adminNotes }),
        statusUpdatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// @desc    Calculate shipping cost
// @route   POST /api/orders/shipping-cost
// @access  Public
const calculateShippingCost = asyncHandler(async (req, res) => {
  const { country, county } = req.body;

  if (!country || !county) {
    return res.status(400).json({
      success: false,
      message: 'Country and county are required'
    });
  }

  try {
    const shippingCost = calculateShipping({ country, county });

    res.json({
      success: true,
      data: { 
        shippingCost, 
        currency: 'KES' 
      }
    });
  } catch (error) {
    console.error('Calculate shipping error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate shipping cost'
    });
  }
});

export {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
  calculateShippingCost
};