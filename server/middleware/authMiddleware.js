// middleware/authMiddleware.js - COMPLETELY REWRITTEN WITH TOKEN VALIDATION
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not configured in auth middleware');
    res.status(500);
    throw new Error('Server configuration error - JWT_SECRET missing');
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      console.log('🔐 Token verification details:', {
        secretLength: process.env.JWT_SECRET.length,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...'
      });
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded successfully:', { userId: decoded.id });
      
      req.user = await User.findById(decoded.id)
        .select('-password -verificationCode -verificationCodeExpires -resetPasswordToken -resetPasswordExpires -loginAttempts -lockUntil');
      
      if (!req.user) {
        console.error('❌ User not found for ID:', decoded.id);
        res.status(401);
        throw new Error('User not found');
      }

      // Check if user is active
      if (req.user.isActive === false) {
        res.status(401);
        throw new Error('Account is deactivated');
      }
      
      console.log('✅ Token verified for user:', req.user.email);
      next();
    } catch (error) {
      console.error('❌ Token verification failed:', {
        error: error.message,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
        secretPreview: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'No secret'
      });
      
      if (error.name === 'TokenExpiredError') {
        res.status(401);
        throw new Error('Token expired. Please log in again.');
      } else if (error.name === 'JsonWebTokenError') {
        res.status(401);
        throw new Error('Invalid token. Please log in again.');
      } else {
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }
  } else {
    console.log('❌ No authorization header or Bearer token');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Authentication required');
  }

  // Check both userType and role for admin access
  const isAdmin = req.user.userType === 'admin' || 
                 req.user.role === 'admin' || 
                 req.user.role === 'super-admin';

  console.log('🔍 Basic Admin Check:', {
    email: req.user.email,
    userType: req.user.userType,
    role: req.user.role,
    isAdmin: isAdmin
  });

  if (isAdmin) {
    // Additional admin checks
    if (req.user.isActive === false) {
      res.status(403);
      throw new Error('Admin account is deactivated');
    }
    
    if (!req.user.isVerified) {
      res.status(403);
      throw new Error('Admin account requires verification');
    }
    
    console.log('✅ Basic admin access granted for:', req.user.email);
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
});

// ✅ ADDED: Token validation endpoint middleware
const validateToken = asyncHandler(async (req, res) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id)
        .select('-password -verificationCode -verificationCodeExpires -resetPasswordToken -resetPasswordExpires -loginAttempts -lockUntil');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isActive === false) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      res.json({
        success: true,
        message: 'Token is valid',
        user: {
          id: user._id,
          email: user.email,
          userType: user.userType,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      console.error('Token validation failed:', error.message);
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
});

export { protect, admin, validateToken };