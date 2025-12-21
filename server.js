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
import adminRoutes from './routes/adminRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// Security imports
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import xss from 'xss-clean';

// Import models
import Product from './models/Product.js';
import Order from './models/Order.js';
import User from './models/User.js';
import Contact from './models/Contact.js';

dotenv.config();

const app = express();

// Configure trust proxy - ADD THIS LINE
app.set('trust proxy', 1); // trust first proxy

// Connect to MongoDB
connectDB();


const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@rerendetcoffee.com' });

    if (!adminExists) {
      await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@rerendetcoffee.com',
        password: 'Admin123!',
        phone: '+254700000000',
        userType: 'admin',
        role: 'super-admin',
        isVerified: true,
        isActive: true,
        adminPermissions: {
          canManageUsers: true,
          canManageProducts: true,
          canManageOrders: true,
          canManageContent: true
        }
      });
      console.log('✅ Default admin user created');
      console.log('📧 Email: admin@rerendetcoffee.com');
      console.log('🔑 Password: Admin123!');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

// Call it after database connection
connectDB().then(() => createDefaultAdmin());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: [
    'Authorization',
    'Content-Length',
    'X-Requested-With'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests globally
app.options('*', cors());

// Security middleware with Google OAuth compatibility
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://apis.google.com"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://oauth2.googleapis.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Rate limiting with proxy configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  // Add these options for proxy compatibility
  trustProxy: true,
  keyGenerator: (req, res) => {
    // Use the client's real IP address (handles proxy scenarios)
    return req.ip || req.connection.remoteAddress;
  }
});

app.use(limiter);

// Specific limiter for admin login (stricter)
const adminLoginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 attempts per hour
  message: {
    success: false,
    message: 'Too many admin login attempts from this IP, please try again after an hour.'
  },
  trustProxy: true
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Add security headers manually for Google OAuth compatibility
app.use((req, res, next) => {
  // Remove conflicting headers that might block Google OAuth
  res.removeHeader('Cross-Origin-Opener-Policy');
  res.removeHeader('Cross-Origin-Embedder-Policy');

  // Set permissive headers for OAuth
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  next();
});

// Add this debug route to check JWT_SECRET
app.get('/api/debug/jwt', (req, res) => {
  res.json({
    jwtSecret: process.env.JWT_SECRET ? `SET (length: ${process.env.JWT_SECRET.length})` : 'MISSING',
    jwtSecretValue: process.env.JWT_SECRET ? '***HIDDEN***' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('JWT'))
  });
});
// ==================== ROUTES ====================

// API Routes
app.use('/api/auth/admin/login', adminLoginLimiter); // Apply strict limit to admin login
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/settings', settingsRoutes); // Public settings endpoint
app.use('/api/reviews', reviewRoutes);

// ==================== DEVELOPMENT ONLY ROUTES ====================

if (process.env.NODE_ENV !== 'production') {
  // Test data endpoint
  app.post('/api/dev/test-data', async (req, res) => {
    try {
      const testProducts = [
        {
          name: "Arabica Coffee Beans",
          description: "Premium Arabica beans from Kenya",
          price: 1200,
          stock: 50,
          category: "coffee-beans",
          images: [{ url: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=300&h=300&fit=crop" }],
          featured: true
        }
      ];

      await Product.deleteMany({
        name: { $in: testProducts.map(p => p.name) }
      });

      const createdProducts = await Product.insertMany(testProducts);
      console.log(`✅ Created ${createdProducts.length} test products`);

      res.json({
        success: true,
        message: "Test data created successfully",
        data: {
          products: createdProducts.length
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

  // Debug route to check users
  app.get('/api/dev/users', async (req, res) => {
    try {
      const users = await User.find().select('email firstName lastName userType role isVerified');

      res.json({
        success: true,
        data: {
          users,
          total: users.length
        }
      });
    } catch (error) {
      console.error('Debug users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  });
}

// ==================== PUBLIC ENDPOINTS ====================

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const contact = new Contact({
      name,
      email,
      subject,
      message,
      status: 'new'
    });

    await contact.save();

    console.log('📧 New Contact Form Submission from:', email);

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

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});
app.get('/api/debug/database', async (req, res) => {
  try {
    // Test if collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    // Test basic queries
    const productsCount = await mongoose.model('Product').countDocuments();
    const usersCount = await mongoose.model('User').countDocuments();
    const ordersCount = await mongoose.model('Order').countDocuments();

    res.json({
      success: true,
      data: {
        connection: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        collections: collectionNames,
        counts: {
          products: productsCount,
          users: usersCount,
          orders: ordersCount
        }
      }
    });
  } catch (error) {
    console.error('Database debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/api/debug/jwt-check', (req, res) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  res.json({
    jwtSecretExists: !!process.env.JWT_SECRET,
    jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    nodeEnv: process.env.NODE_ENV
  });
});
app.get('/api/debug/database-test', async (req, res) => {
  try {
    // Test basic database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    // Test each model
    const productsCount = await mongoose.model('Product').countDocuments();
    const usersCount = await mongoose.model('User').countDocuments();
    const ordersCount = await mongoose.model('Order').countDocuments();

    res.json({
      success: true,
      data: {
        connection: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        collections: collectionNames,
        counts: {
          products: productsCount,
          users: usersCount,
          orders: ordersCount
        }
      }
    });
  } catch (error) {
    console.error('Database debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/api/debug/admin-test', async (req, res) => {
  try {
    // Test the specific queries that are failing
    const totalOrders = await mongoose.model('Order').countDocuments();
    const totalProducts = await mongoose.model('Product').countDocuments({ isActive: true });
    const totalUsers = await mongoose.model('User').countDocuments({ userType: 'customer' });

    res.json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Admin test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
🔗 API: http://localhost:${PORT}/api
❤️  Health: http://localhost:${PORT}/api/health
🔒 Trust proxy: ${app.get('trust proxy')}
  `);
});