// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // NEW: Admin routes
import { saveShippingInfo } from './controllers/shippingController.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Import models
import Product from './models/Product.js';
import Order from './models/Order.js';
import User from './models/User.js';
import Contact from './models/Contact.js'; // NEW: Contact model

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

import('./config/db.js'); // Connect to MongoDB

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes); // NEW: Admin routes
app.put('/api/auth/shipping-info', saveShippingInfo);
app.use('/api/dashboard', dashboardRoutes);

// ==================== CONTACT FORM ENDPOINT ====================
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (subject.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Subject must be at least 5 characters'
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters'
      });
    }

    // Create contact submission
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      status: 'new'
    });

    await contact.save();

    // Log for admin notification
    console.log('📧 New Contact Form Submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('Timestamp:', new Date().toISOString());
    console.log('---');

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form'
    });
  }
});

// ==================== TEST DATA ENDPOINT (Development Only) ====================
app.post('/api/admin/test-data', async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Test data endpoint not available in production'
      });
    }

    // Create test products
    const testProducts = [
      {
        name: "Arabica Coffee Beans",
        description: "Premium Arabica beans from the highlands of Kenya. Rich flavor with notes of chocolate and citrus.",
        price: 1200,
        stock: 50,
        category: "coffee-beans",
        images: [{ url: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=300&h=300&fit=crop" }],
        featured: true
      },
      {
        name: "French Press",
        description: "Stainless steel French press for the perfect brew. Durable and easy to clean.",
        price: 2500,
        stock: 25,
        category: "brewing-equipment",
        images: [{ url: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=300&h=300&fit=crop" }],
        featured: true
      },
      {
        name: "Coffee Mug Set",
        description: "Set of 4 ceramic coffee mugs with elegant design. Perfect for your morning coffee.",
        price: 1800,
        stock: 8,
        category: "accessories",
        images: [{ url: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=300&h=300&fit=crop" }]
      },
      {
        name: "Espresso Roast",
        description: "Dark roast coffee beans specially crafted for espresso. Bold and intense flavor.",
        price: 1400,
        stock: 35,
        category: "coffee-beans",
        images: [{ url: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=300&h=300&fit=crop" }]
      },
      {
        name: "Pour Over Kit",
        description: "Complete pour over coffee kit with dripper, filters, and carafe.",
        price: 3200,
        stock: 15,
        category: "brewing-equipment",
        images: [{ url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop" }]
      }
    ];

    // Clear existing test products
    await Product.deleteMany({ 
      name: { 
        $in: testProducts.map(p => p.name) 
      } 
    });

    const createdProducts = await Product.insertMany(testProducts);
    console.log(`✅ Created ${createdProducts.length} test products`);

    // Create test orders if user ID is provided
    if (req.body.userId) {
      const testOrders = [
        {
          orderNumber: "ORD" + Date.now(),
          user: req.body.userId,
          items: [
            { 
              product: createdProducts[0]._id, 
              name: createdProducts[0].name,
              quantity: 2, 
              price: createdProducts[0].price 
            },
            { 
              product: createdProducts[2]._id,
              name: createdProducts[2].name,
              quantity: 1, 
              price: createdProducts[2].price 
            }
          ],
          subtotal: 4200,
          shippingPrice: 500,
          taxPrice: 672,
          totalAmount: 5372,
          status: "pending",
          shippingAddress: {
            street: "123 Test Street",
            city: "Nairobi",
            postalCode: "00100",
            country: "Kenya"
          }
        },
        {
          orderNumber: "ORD" + (Date.now() + 1),
          user: req.body.userId,
          items: [
            { 
              product: createdProducts[1]._id,
              name: createdProducts[1].name,
              quantity: 1, 
              price: createdProducts[1].price 
            }
          ],
          subtotal: 2500,
          shippingPrice: 0, // Free shipping
          taxPrice: 400,
          totalAmount: 2900,
          status: "confirmed",
          shippingAddress: {
            street: "456 Sample Avenue",
            city: "Mombasa", 
            postalCode: "00200",
            country: "Kenya"
          }
        },
        {
          orderNumber: "ORD" + (Date.now() + 2),
          user: req.body.userId,
          items: [
            { 
              product: createdProducts[3]._id,
              name: createdProducts[3].name,
              quantity: 3, 
              price: createdProducts[3].price 
            }
          ],
          subtotal: 4200,
          shippingPrice: 500,
          taxPrice: 672,
          totalAmount: 5372,
          status: "delivered",
          shippingAddress: {
            street: "789 Demo Road",
            city: "Kisumu",
            postalCode: "00300",
            country: "Kenya"
          }
        }
      ];

      await Order.insertMany(testOrders);
      console.log(`✅ Created ${testOrders.length} test orders`);
    }

    // Create test contact submissions
    const testContacts = [
      {
        name: "John Doe",
        email: "john@example.com",
        subject: "Wholesale Inquiry",
        message: "I'm interested in purchasing your coffee beans in bulk for my cafe. Can you provide more information about wholesale pricing?",
        status: "new"
      },
      {
        name: "Jane Smith",
        email: "jane@example.com", 
        subject: "Product Question",
        message: "I recently purchased the French Press and I'm loving it! Do you have any tips for the perfect brew?",
        status: "in_progress"
      },
      {
        name: "Mike Johnson",
        email: "mike@example.com",
        subject: "Shipping Question",
        message: "How long does shipping usually take to Mombasa? I need my order by next week.",
        status: "resolved"
      }
    ];

    await Contact.insertMany(testContacts);
    console.log(`✅ Created ${testContacts.length} test contact submissions`);

    res.json({
      success: true,
      message: "Test data created successfully",
      data: {
        products: createdProducts.length,
        orders: req.body.userId ? 3 : 0,
        contacts: testContacts.length
      }
    });

  } catch (error) {
    console.error('Test data creation error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create test data"
    });
  }
});

// ==================== ADMIN HEALTH CHECK ====================
app.get('/api/admin/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get counts for admin dashboard
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const userCount = await User.countDocuments({ role: 'user' });
    const contactCount = await Contact.countDocuments();

    res.json({
      success: true,
      data: {
        server: 'running',
        database: dbStatus,
        counts: {
          products: productCount,
          orders: orderCount,
          users: userCount,
          contacts: contactCount
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Admin health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Server is running!', 
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
🔗 API: http://localhost:${PORT}/api
👑 Admin: http://localhost:${PORT}/api/admin/health
❤️  Health: http://localhost:${PORT}/api/health
  `);
});