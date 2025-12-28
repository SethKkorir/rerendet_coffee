// routes/checkout.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  getOrderById
} = require('../controllers/checkoutController');

router.route('/')
  .post(protect, createOrder)
  .get(protect, getUserOrders);

router.route('/:id')
  .get(protect, getOrderById);

module.exports = router;