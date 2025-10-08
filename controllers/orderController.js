// controllers/orderController.js
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { calculateShipping } from '../utils/shippingCalculator.js';

// Process checkout - matches router.post('/checkout', processCheckout);
export const processCheckout = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, transactionId } = req.body;
    const userId = req.user._id;

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.images?.[0] || product.image,
        itemTotal
      });
    }

    // Calculate shipping
    const shippingCost = calculateShipping({
      country: shippingAddress.country,
      city: shippingAddress.city
    });

    const total = subtotal + shippingCost;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      total,
      paymentMethod,
      transactionId
    });

    await order.save();

    // Update product stock
    for (const cartItem of cart.items) {
      await Product.findByIdAndUpdate(
        cartItem.product._id,
        { $inc: { stock: -cartItem.quantity } }
      );
    }

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        shippingAddress: order.shippingAddress,
        items: order.items,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during checkout'
    });
  }
};

// Get user orders - matches router.get('/my-orders', getUserOrders);
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get order by ID - matches router.get('/:id', getOrderById);
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.id;

    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId 
    }).populate('user', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// Calculate shipping cost - matches router.post('/calculate-shipping', calculateShippingCost);
export const calculateShippingCost = async (req, res) => {
  try {
    const { country, city } = req.body;

    if (!country || !city) {
      return res.status(400).json({
        success: false,
        message: 'Country and city are required'
      });
    }

    const shippingCost = calculateShipping({ country, city });

    res.json({
      success: true,
      shippingCost,
      currency: 'KES'
    });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate shipping cost'
    });
  }
};