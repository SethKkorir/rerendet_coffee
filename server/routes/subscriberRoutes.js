// routes/subscriberRoutes.js
import express from 'express';
import {
    subscribe,
    unsubscribe,
    getAllSubscribers,
    sendNewsletter
} from '../controllers/subscriberController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin routes
router.get('/', protect, admin, getAllSubscribers);
router.post('/send', protect, admin, sendNewsletter);

export default router;
