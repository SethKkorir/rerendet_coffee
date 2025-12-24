import mongoose from 'mongoose';

export const validateCartItem = (req, res, next) => {
  const { productId, quantity } = req.body;

  const errors = [];

  if (!productId) {
    errors.push('Product ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(productId)) {
    errors.push('Invalid product ID format');
  }

  if (!quantity && quantity !== 0) {
    errors.push('Quantity is required');
  } else if (!Number.isInteger(quantity) || quantity < 1) {
    errors.push('Quantity must be a positive integer');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

export const validateQuantity = (req, res, next) => {
  const { quantity } = req.body;

  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a non-negative integer'
    });
  }

  next();
};