// routes/authRoutes.js
import express from 'express';
import {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  checkEmail, 
  googleAuth
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.get('/check-email', checkEmail);
router.post('/reset-password', resetPassword);
router.route('/profile')

  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post('/google', googleAuth);


export default router;