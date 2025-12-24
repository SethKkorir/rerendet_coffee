// routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { getUsers, deleteUser, getUserById, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.route('/')
  .get(protect, adminAuth(['users:view']), getUsers);

router.route('/:id')
  .delete(protect, adminAuth(['users:manage']), deleteUser)
  .get(protect, adminAuth(['users:view']), getUserById)
  .put(protect, adminAuth(['users:manage']), updateUser);

export default router;