// middleware/adminAuth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Role-based access control
const ROLES = {
  SUPER_ADMIN: 'super_admin',
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

const adminAuth = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has admin role
      if (!Object.values(ROLES).includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      // Check permissions
      const userPermissions = PERMISSIONS[req.user.role] || [];
      const hasPermission = userPermissions.includes('*') || 
        requiredPermissions.every(permission => userPermissions.includes(permission));

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      // Log admin activity
      console.log(`🔐 Admin Action: ${req.user.email} - ${req.method} ${req.originalUrl}`);

      next();
    } catch (error) {
      console.error('Admin auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  };
};

// Specific permission middleware
const requirePermission = (permission) => adminAuth([permission]);
const requireSuperAdmin = adminAuth(['*']);

export {
  adminAuth,
  requirePermission,
  requireSuperAdmin,
  ROLES,
  PERMISSIONS
};