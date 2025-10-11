// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user with security fields
      req.user = await User.findById(decoded.userId)
        .select('+security +loginHistory');
      
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      // Check if user changed password after token was issued
      if (req.user.changedPasswordAfter(decoded.iat)) {
        res.status(401);
        throw new Error('User recently changed password. Please log in again.');
      }

      // Check if account is locked
      if (req.user.isLocked) {
        res.status(423);
        throw new Error('Account is temporarily locked due to too many failed login attempts.');
      }

      // Log successful authentication
      req.user.loginHistory.push({
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
        timestamp: new Date()
      });

      // Keep only last 10 login attempts
      if (req.user.loginHistory.length > 10) {
        req.user.loginHistory = req.user.loginHistory.slice(-10);
      }

      await req.user.save();

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
});

// Enhanced security middleware
const security = asyncHandler(async (req, res, next) => {
  // Add security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

export { protect, admin, security };