// controllers/orderController.js
import Order from '../models/Order.js';
// import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingAddress,
    paymentMethod,
    notes
  } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name price countInStock');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('No items in cart');
  }

  // Check stock availability and prepare order items
  const orderItems = [];
  
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    
    if (product.countInStock < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${product.name}`);
    }

    orderItems.push({
      product: item.product._id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity
    });

    // Update product stock
    product.countInStock -= item.quantity;
    await product.save();
  }

  // Create order
  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress: {
      name: shippingAddress.name,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.zipCode,
      country: shippingAddress.country,
      phone: shippingAddress.phone
    },
    paymentMethod,
    itemsPrice: cart.totalPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: cart.finalPrice,
    notes: notes || ''
  });

  const createdOrder = await order.save();

  // Clear user's cart after successful order
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], itemsCount: 0, totalPrice: 0, finalPrice: 0 }
  );

  // Populate order with user info
  await createdOrder.populate('user', 'firstName lastName email');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: createdOrder
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email phone');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user owns the order or is admin
  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to view this order');
  }

  res.json({
    success: true,
    data: order
  });
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.email_address,
  };

  const updatedOrder = await order.save();

  res.json({
    success: true,
    message: 'Order payment confirmed',
    data: updatedOrder
  });
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.status = 'delivered';

  const updatedOrder = await order.save();

  res.json({
    success: true,
    message: 'Order marked as delivered',
    data: updatedOrder
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Order.countDocuments({});
  const orders = await Order.find({})
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  const updatedOrder = await order.save();

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: updatedOrder
  });
});
// @desc    Get payment methods
// @route   GET /api/orders/payment-methods
// @access  Public
const getPaymentMethods = asyncHandler(async (req, res) => {
  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Pay with M-Pesa mobile money',
      icon: '/images/mpesa-logo.png',
      supportedCountries: ['KE', 'TZ'],
      fees: 0
    },
    {
      id: 'airtel_money',
      name: 'Airtel Money',
      description: 'Pay with Airtel Money',
      icon: '/images/airtel-money-logo.png',
      supportedCountries: ['KE', 'UG', 'TZ', 'RW'],
      fees: 0
    },
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: '/images/cod-icon.png',
      supportedCountries: ['KE'],
      fees: 0
    }
  ];

  res.json({
    success: true,
    data: paymentMethods
  });
});

export {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus
};