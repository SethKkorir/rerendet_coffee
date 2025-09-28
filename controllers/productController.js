// controllers/productController.js
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// @desc    Fetch all products with filters and search
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;
  
  // Build filter object
  const filter = { isActive: true };
  
  // Search keyword
  if (req.query.keyword) {
    filter.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } },
      { flavorNotes: { $regex: req.query.keyword, $options: 'i' } }
    ];
  }
  
  // Category filter
  if (req.query.category) {
    filter.category = req.query.category;
  }
  
  // Roast level filter
  if (req.query.roastLevel) {
    filter.roastLevel = req.query.roastLevel;
  }
  
  // Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }
  
  // Sort options
  let sort = {};
  switch (req.query.sort) {
    case 'price_asc':
      sort = { price: 1 };
      break;
    case 'price_desc':
      sort = { price: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'rating':
      sort = { 'ratings.average': -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  const count = await Product.countDocuments({ ...filter });
  const products = await Product.find({ ...filter })
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
    filters: {
      categories: await Product.distinct('category', { isActive: true }),
      roastLevels: await Product.distinct('roastLevel', { isActive: true })
    }
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product && product.isActive) {
    res.json({
      success: true,
      data: product
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    image: req.body.image,
    images: req.body.images || [],
    category: req.body.category,
    subcategory: req.body.subcategory,
    brand: req.body.brand,
    roastLevel: req.body.roastLevel,
    origin: req.body.origin,
    flavorNotes: req.body.flavorNotes || [],
    weight: req.body.weight,
    inventory: {
      stock: req.body.stock || 0,
      lowStockAlert: req.body.lowStockAlert || 10
    },
    tags: req.body.tags || [],
    isFeatured: req.body.isFeatured || false,
    seo: req.body.seo || {}
  });

  const createdProduct = await product.save();
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: createdProduct
  });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    product.image = req.body.image || product.image;
    product.images = req.body.images || product.images;
    product.category = req.body.category || product.category;
    product.subcategory = req.body.subcategory || product.subcategory;
    product.brand = req.body.brand || product.brand;
    product.roastLevel = req.body.roastLevel || product.roastLevel;
    product.origin = req.body.origin || product.origin;
    product.flavorNotes = req.body.flavorNotes || product.flavorNotes;
    product.weight = req.body.weight || product.weight;
    product.inventory.stock = req.body.stock !== undefined ? req.body.stock : product.inventory.stock;
    product.inventory.lowStockAlert = req.body.lowStockAlert || product.inventory.lowStockAlert;
    product.tags = req.body.tags || product.tags;
    product.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : product.isFeatured;
    product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;
    product.seo = req.body.seo || product.seo;

    const updatedProduct = await product.save();
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();
    
    res.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ 
    isFeatured: true, 
    isActive: true 
  }).limit(8);

  res.json({
    success: true,
    data: products
  });
});

export { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getFeaturedProducts
};