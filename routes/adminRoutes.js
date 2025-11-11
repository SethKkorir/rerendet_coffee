// routes/adminRoutes.js
import express from 'express';
import auth from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  getDashboardStats,
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getUsers,
  getContacts,
  updateContactStatus
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(auth);

// ==================== ADMIN DASHBOARD STATS ====================
router.get('/dashboard/stats', adminAuth(['dashboard:view']), getDashboardStats);

// ==================== ORDER MANAGEMENT ====================
router.get('/orders', adminAuth(['orders:manage']), getOrders);
router.get('/orders/:id', adminAuth(['orders:manage']), getOrderDetail);
router.put('/orders/:id/status', adminAuth(['orders:update_status']), updateOrderStatus);

// ==================== PRODUCT MANAGEMENT ====================
router.get('/products', adminAuth(['products:manage']), getProducts);
router.post('/products', adminAuth(['products:manage']), createProduct);
router.put('/products/:id', adminAuth(['products:manage']), updateProduct);
router.delete('/products/:id', adminAuth(['products:manage']), deleteProduct);

// ==================== USER MANAGEMENT ====================
router.get('/users', adminAuth(['users:view']), getUsers);

// ==================== CONTACT MANAGEMENT ====================
router.get('/contacts', adminAuth(['contacts:manage']), getContacts);
router.put('/contacts/:id/status', adminAuth(['contacts:manage']), updateContactStatus);

export default router;