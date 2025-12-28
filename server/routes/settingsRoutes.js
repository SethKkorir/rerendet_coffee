// routes/settingsRoutes.js - NEW FILE
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  getSettings,
  updateSettings,
  uploadLogo,
  getPublicSettings
} from '../controllers/settingsController.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicSettings);

// Protected routes
router.use(protect, admin);

// Settings routes
router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/upload/logo', upload.single('logo'), uploadLogo);

export default router;