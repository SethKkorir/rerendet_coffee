// controllers/cartController.js
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name image price countInStock');

  if (!cart) {
    // Create empty cart if none exists
    const newCart = await Cart.create({
      user: req.user._id,
      items: [],
      itemsCount: 0,
      totalPrice: 0,
      shippingPrice: 0,
      taxPrice: 0,
      finalPrice: 0
    });
    return res.json({
      success: true,
      data: newCart
    });
  }

  res.json({
    success: true,
    data: cart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.countInStock < quantity) {
    res.status(400);
    throw new Error('Not enough stock available');
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    
    if (newQuantity > product.countInStock) {
      res.status(400);
      throw new Error('Not enough stock available');
    }

    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: quantity
    });
  }

  await cart.save();
  await cart.populate('items.product', 'name image price countInStock');

  res.json({
    success: true,
    message: 'Product added to cart',
    data: cart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const itemId = req.params.itemId;

  if (quantity <= 0) {
    res.status(400);
    throw new Error('Quantity must be greater than 0');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.id(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  const product = await Product.findById(item.product);
  if (quantity > product.countInStock) {
    res.status(400);
    throw new Error('Not enough stock available');
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'name image price countInStock');

  res.json({
    success: true,
    message: 'Cart item updated',
    data: cart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
  await cart.save();
  await cart.populate('items.product', 'name image price countInStock');

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: cart
  });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.json({
    success: true,
    message: 'Cart cleared successfully',
    data: cart || { items: [], itemsCount: 0, totalPrice: 0, finalPrice: 0 }
  });
});

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};