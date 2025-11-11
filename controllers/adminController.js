// controllers/adminController.js
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Contact from '../models/Contact.js';

// ==================== ADMIN DASHBOARD STATS ====================
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get date ranges for analytics
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Total counts
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments({ role: 'user' });
  
  const totalRevenue = await Order.aggregate([
    { $match: { status: 'delivered' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  // Today's stats
  const todayOrders = await Order.countDocuments({ 
    createdAt: { $gte: startOfToday } 
  });
  
  const todayRevenue = await Order.aggregate([
    { 
      $match: { 
        status: 'delivered', 
        createdAt: { $gte: startOfToday } 
      } 
    },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(5);

  // Low stock products
  const lowStockProducts = await Product.find({ 
    stock: { $lte: 10 } 
  }).limit(5);

  res.json({
    success: true,
    data: {
      overview: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0
      },
      recentOrders,
      lowStockProducts
    }
  });
});

// ==================== ORDER MANAGEMENT ====================
const getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const skip = (page - 1) * limit;

  let filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'user.firstName': { $regex: search, $options: 'i' } },
      { 'user.lastName': { $regex: search, $options: 'i' } }
    ];
  }

  const orders = await Order.find(filter)
    .populate('user', 'firstName lastName email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

const getOrderDetail = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email phone address')
    .populate('items.product');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({
    success: true,
    data: order
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, notifyCustomer = true } = req.body;
  
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { 
      status,
      ...(trackingNumber && { trackingNumber }),
      statusUpdatedAt: new Date()
    },
    { new: true }
  ).populate('user', 'firstName lastName email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // TODO: Send status update email if notifyCustomer is true

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: order
  });
});

// ==================== PRODUCT MANAGEMENT ====================
const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, search, lowStock } = req.query;
  const skip = (page - 1) * limit;

  let filter = {};
  if (category && category !== 'all') {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (lowStock === 'true') {
    filter.stock = { $lte: 10 };
  }

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(filter);

  // Get categories for filter
  const categories = await Product.distinct('category');

  res.json({
    success: true,
    data: {
      products,
      categories,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;
  
  const product = new Product(productData);
  await product.save();

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: product
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// ==================== USER MANAGEMENT ====================
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;

  let filter = { role: 'user' };
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// ==================== CONTACT MANAGEMENT ====================
const getContacts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;

  let filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  const contacts = await Contact.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Contact.countDocuments(filter);

  res.json({
    success: true,
    data: {
      contacts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

const updateContactStatus = asyncHandler(async (req, res) => {
  const { status, adminResponse } = req.body;
  
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { 
      status,
      ...(adminResponse && { adminResponse }),
      respondedAt: new Date()
    },
    { new: true }
  );

  if (!contact) {
    res.status(404);
    throw new Error('Contact submission not found');
  }

  // TODO: Send response email to user

  res.json({
    success: true,
    message: 'Contact status updated successfully',
    data: contact
  });
});

export {
  getDashboardStats,
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getUsers,
  getContacts,
  updateContactStatus
};