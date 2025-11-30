// routes/reportRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  generateOrderReceipt,
  generateMonthlyReport,
  getSalesAnalytics,
  exportOrdersToCSV
} from '../controllers/reportController.js';

const router = express.Router();

router.use(protect, admin);

router.get('/orders/:id/receipt', generateOrderReceipt);
router.get('/sales/monthly', generateMonthlyReport);
router.get('/analytics', getSalesAnalytics);
router.get('/orders/export', exportOrdersToCSV);

export default router;