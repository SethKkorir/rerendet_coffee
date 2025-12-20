// controllers/adminController.js - COMPLETELY REWRITTEN WITH FORM DATA FIXES
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Settings from '../models/Settings.js';
import mongoose from 'mongoose';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalOrders,
    totalProducts,
    totalUsers,
    totalRevenueResult,
    todayOrders,
    todayRevenueResult,
    recentOrders,
    lowStockProducts,
    pendingOrders
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ userType: 'customer' }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startOfToday }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5),
    Product.find({
      'inventory.stock': { $lte: 10 },
      isActive: true
    }).limit(5),
    Order.countDocuments({ status: 'pending' })
  ]);

  const totalRevenue = totalRevenueResult[0]?.total || 0;
  const todayRevenue = todayRevenueResult[0]?.total || 0;

  res.json({
    success: true,
    data: {
      overview: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue,
        todayOrders,
        todayRevenue,
        pendingOrders
      },
      recentOrders,
      lowStockProducts
    }
  });
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
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

// @desc    Get order details
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
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

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
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

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: order
  });
});

// @desc    Get all products - FIXED VERSION
// @route   GET /api/admin/products
// @access  Private/Admin
const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, search, lowStock } = req.query;
  const skip = (page - 1) * limit;

  // Start with isActive filter and build from there
  let filter = { isActive: true };

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
    filter['inventory.stock'] = { $lte: 10 };
  }

  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(filter);
  const categories = await Product.distinct('category', { isActive: true });

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

// @desc    Create product - COMPLETELY REWRITTEN WITH FORM DATA SUPPORT
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if data is coming as FormData with JSON (from frontend)
    let requestBody = { ...req.body };

    if (req.body.data) {
      try {
        const jsonData = JSON.parse(req.body.data);
        requestBody = { ...requestBody, ...jsonData };
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400);
        throw new Error('Invalid data format');
      }
    }

    const {
      name,
      description,
      sizes,
      category,
      roastLevel,
      origin,
      flavorNotes,
      badge,
      inventory,
      tags,
      isFeatured
    } = requestBody;

    // Validate required fields
    if (!name || !description || !sizes || !category) {
      await session.abortTransaction();
      session.endSession();
      res.status(400);
      throw new Error('Please fill in all required fields: name, description, sizes, category');
    }

    // Parse sizes - handle both string and array formats
    let parsedSizes;
    try {
      if (typeof sizes === 'string') {
        parsedSizes = JSON.parse(sizes);
      } else if (Array.isArray(sizes)) {
        parsedSizes = sizes;
      } else {
        throw new Error('Invalid sizes format');
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(400);
      throw new Error('Invalid sizes format: ' + error.message);
    }

    // Validate sizes have valid prices
    const validatedSizes = parsedSizes.map((size, index) => {
      const price = parseFloat(size.price);
      if (isNaN(price) || price <= 0) {
        throw new Error(`Invalid price for size ${size.size} at position ${index + 1}`);
      }
      return {
        size: size.size,
        price: price
      };
    });

    // Handle images from uploaded files
    const images = req.files ? req.files.map(file => ({
      public_id: file.filename,
      url: file.path
    })) : [];

    // Parse and validate inventory
    let stock = 0;
    let lowStockAlert = 5;

    if (inventory) {
      if (typeof inventory === 'object') {
        stock = parseInt(inventory.stock) || 0;
        lowStockAlert = parseInt(inventory.lowStockAlert) || 5;
      } else {
        // Handle case where inventory might be a string
        stock = parseInt(inventory) || 0;
      }
    }

    if (isNaN(stock) || stock < 0) {
      await session.abortTransaction();
      session.endSession();
      res.status(400);
      throw new Error('Invalid stock quantity');
    }

    // Parse flavor notes
    let parsedFlavorNotes = [];
    if (flavorNotes) {
      if (typeof flavorNotes === 'string') {
        parsedFlavorNotes = flavorNotes.split(',').map(note => note.trim()).filter(note => note);
      } else if (Array.isArray(flavorNotes)) {
        parsedFlavorNotes = flavorNotes;
      }
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    // Parse isFeatured
    const parsedIsFeatured = isFeatured === 'true' || isFeatured === true;

    // Create product data
    const productData = {
      name: name.toString().trim(),
      description: description.toString().trim(),
      sizes: validatedSizes,
      images: images.filter(img => img.url),
      category: category.toString(),
      roastLevel: category === 'coffee-beans' ? (roastLevel?.toString() || 'medium') : undefined,
      origin: origin?.toString().trim() || '',
      flavorNotes: parsedFlavorNotes,
      badge: badge?.toString().trim() || '',
      inventory: {
        stock: stock,
        lowStockAlert: lowStockAlert
      },
      tags: parsedTags,
      isFeatured: parsedIsFeatured,
      isActive: true
    };

    console.log('📦 Creating product with data:', productData);

    const product = new Product(productData);
    const createdProduct = await product.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: createdProduct
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Log detailed error for debugging
    console.error('❌ Product creation error:', error);
    console.error('❌ Request body:', req.body);
    console.error('❌ Request files:', req.files);

    throw error;
  }
});

// @desc    Update product - UPDATED WITH FORM DATA SUPPORT
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if data is coming as FormData with JSON
  let requestBody = { ...req.body };

  if (req.body.data) {
    try {
      const jsonData = JSON.parse(req.body.data);
      requestBody = { ...requestBody, ...jsonData };
    } catch (error) {
      res.status(400);
      throw new Error('Invalid data format');
    }
  }

  const {
    name,
    description,
    sizes,
    category,
    roastLevel,
    origin,
    flavorNotes,
    badge,
    inventory,
    tags,
    isFeatured,
    isActive
  } = requestBody;

  // Update fields with proper validation
  if (name !== undefined) product.name = name.toString().trim();
  if (description !== undefined) product.description = description.toString().trim();
  if (category !== undefined) product.category = category.toString();

  if (roastLevel !== undefined && category === 'coffee-beans') {
    product.roastLevel = roastLevel.toString();
  }

  if (origin !== undefined) product.origin = origin.toString().trim();
  if (badge !== undefined) product.badge = badge.toString().trim();

  if (isFeatured !== undefined) {
    product.isFeatured = isFeatured === 'true' || isFeatured === true;
  }

  if (isActive !== undefined) {
    product.isActive = isActive === 'true' || isActive === true;
  }

  // Update sizes with validation
  if (sizes) {
    let parsedSizes;
    try {
      if (typeof sizes === 'string') {
        parsedSizes = JSON.parse(sizes);
      } else if (Array.isArray(sizes)) {
        parsedSizes = sizes;
      } else {
        throw new Error('Invalid sizes format');
      }

      // Validate sizes
      const validatedSizes = parsedSizes.map(size => {
        const price = parseFloat(size.price);
        if (isNaN(price) || price <= 0) {
          throw new Error(`Invalid price for size ${size.size}`);
        }
        return {
          size: size.size,
          price: price
        };
      });

      if (validatedSizes.length > 0) {
        product.sizes = validatedSizes;
      }
    } catch (error) {
      res.status(400);
      throw new Error('Invalid sizes format: ' + error.message);
    }
  }

  // Update inventory with validation
  if (inventory) {
    let stock = product.inventory.stock;
    let lowStockAlert = product.inventory.lowStockAlert;

    if (typeof inventory === 'object') {
      if (inventory.stock !== undefined) {
        stock = parseInt(inventory.stock);
        if (isNaN(stock) || stock < 0) {
          res.status(400);
          throw new Error('Invalid stock quantity');
        }
      }
      if (inventory.lowStockAlert !== undefined) {
        lowStockAlert = parseInt(inventory.lowStockAlert);
        if (isNaN(lowStockAlert) || lowStockAlert < 0) {
          res.status(400);
          throw new Error('Invalid low stock alert value');
        }
      }
    }

    product.inventory = {
      stock: stock,
      lowStockAlert: lowStockAlert
    };
  }

  // Update arrays
  if (flavorNotes !== undefined) {
    if (typeof flavorNotes === 'string') {
      product.flavorNotes = flavorNotes.split(',').map(note => note.trim()).filter(note => note);
    } else if (Array.isArray(flavorNotes)) {
      product.flavorNotes = flavorNotes;
    }
  }

  if (tags !== undefined) {
    if (typeof tags === 'string') {
      product.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else if (Array.isArray(tags)) {
      product.tags = tags;
    }
  }

  // Add new images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => ({
      public_id: file.filename,
      url: file.path
    }));
    product.images = [...product.images, ...newImages];
  }

  const updatedProduct = await product.save();

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct
  });
});

// @desc    Delete product - FIXED VERSION
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Soft delete - set isActive to false
  product.isActive = false;
  await product.save();

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;

  let filter = { userType: 'customer' };
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

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent changing role of super-admin unless it's another super-admin or itself?
  // For now, simple role update
  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: `User role updated to ${role} successfully`,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deleting self
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own admin account');
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get all contacts
// @route   GET /api/admin/contacts
// @access  Private/Admin
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

// @desc    Update contact status
// @route   PUT /api/admin/contacts/:id/status
// @access  Private/Admin
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

  res.json({
    success: true,
    message: 'Contact status updated successfully',
    data: contact
  });
});

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = new Settings();
    await settings.save();
  }

  res.json({
    success: true,
    data: settings
  });
});

// @desc    Update settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const updatedSettings = await Settings.findOneAndUpdate(
    {},
    { $set: req.body },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: updatedSettings
  });
});

// @desc    Get sales analytics
// @route   GET /api/admin/analytics/sales
// @access  Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  let startDate;
  const endDate = new Date();

  switch (period) {
    case '7d':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
  }

  // Aggregate metrics
  const [salesStats, categoryStats, totals] = await Promise.all([
    // Daily sales data for line chart
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Category distribution for pie chart
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          value: { $sum: '$items.quantity' }
        }
      },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ]),

    // Overview totals
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          productsSold: { $sum: { $size: '$items' } }, // Simple count of items as fallback
          uniqueCustomers: { $addToSet: '$user' }
        }
      }
    ])
  ]);

  const overview = totals[0] || { totalRevenue: 0, totalOrders: 0, productsSold: 0, uniqueCustomers: [] };
  const activeCustomers = overview.uniqueCustomers.length;
  const averageOrderValue = overview.totalOrders > 0 ? overview.totalRevenue / overview.totalOrders : 0;

  res.json({
    success: true,
    data: {
      salesData: salesStats,
      categoryDistribution: categoryStats,
      totalRevenue: overview.totalRevenue || 0,
      totalOrders: overview.totalOrders || 0,
      productsSold: overview.productsSold || 0,
      activeCustomers: activeCustomers,
      averageOrderValue: averageOrderValue,
      conversionRate: 3.5, // Simulated for now
      retentionRate: 15.2, // Simulated for now
      period
    }
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
  updateContactStatus,
  getSettings,
  updateSettings,
  getSalesAnalytics,
  updateUserRole,
  deleteUser
};