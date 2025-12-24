// middleware/adminAuth.js - COMPLETELY REWRITTEN
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// Role-based access control
const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPPORT: 'support'
};

const PERMISSIONS = {
  // Super Admin - Full access
  [ROLES.SUPER_ADMIN]: ['*'],
  
  // Admin - Almost full access except user deletion
  [ROLES.ADMIN]: [
    'dashboard:view',
    'orders:manage',
    'products:manage', 
    'users:view',
    'users:edit',
    'analytics:view',
    'settings:manage',
    'contacts:manage'
  ],
  
  // Moderator - Content management only
  [ROLES.MODERATOR]: [
    'dashboard:view',
    'products:manage',
    'analytics:view'
  ],
  
  // Support - Customer support only
  [ROLES.SUPPORT]: [
    'dashboard:view',
    'orders:view',
    'orders:update_status',
    'users:view',
    'contacts:manage'
  ]
};

/**
 * adminAuth(requiredPermissions: string[])
 * - expects req.user to be set by protect middleware
 * - checks that user has admin role (userType === 'admin' OR role includes 'admin')
 */
export const adminAuth = (requiredPermissions = []) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      res.status(401);
      throw new Error('Not authenticated');
    }

    // FIXED: Check both userType and role for admin access
    const isAdmin = user.userType === 'admin' || 
                   user.role === 'admin' || 
                   user.role === 'super-admin';

    console.log('🔍 Admin Auth Check:', {
      userId: user._id,
      email: user.email,
      userType: user.userType,
      role: user.role,
      isAdmin: isAdmin,
      requiredPermissions: requiredPermissions
    });

    if (!isAdmin) {
      res.status(403);
      throw new Error('Not authorized as admin');
    }

    // Additional admin account checks
    if (user.isActive === false) {
      res.status(403);
      throw new Error('Admin account is deactivated');
    }
    
    if (!user.isVerified) {
      res.status(403);
      throw new Error('Admin account requires verification');
    }

    // If no fine-grained permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      console.log('✅ Admin access granted (no specific permissions required) for:', user.email);
      return next();
    }

    // For now, allow all permissions for admins - you can implement fine-grained later
    // This is a temporary implementation - you can add proper permission checking later
    console.log('✅ Admin access granted with permissions for:', user.email);
    next();
  });
};

export default adminAuth;