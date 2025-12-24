// controllers/subscriberController.js
import Subscriber from '../models/Subscriber.js';
import sendEmail from '../utils/sendEmail.js';
import { getNewsletterWelcomeEmail, getNewsletterEmail } from '../utils/emailTemplates.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Check if subscriber exists
        let subscriber = await Subscriber.findOne({ email });

        if (subscriber) {
            if (subscriber.isSubscribed) {
                return res.status(400).json({ success: false, message: 'You are already subscribed to our newsletter' });
            } else {
                // Reactivate subscription
                subscriber.isSubscribed = true;
                subscriber.subscribedAt = Date.now();
                await subscriber.save();
            }
        } else {
            // Create new subscriber
            subscriber = await Subscriber.create({ email });

            // Send welcome email
            try {
                const welcomeEmail = getNewsletterWelcomeEmail();
                await sendEmail({
                    email: subscriber.email,
                    subject: 'Welcome to Rerendet Coffee Journey',
                    html: welcomeEmail
                });
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // Continue execution, don't fail subscription
            }
        }

        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to the newsletter!'
        });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
export const unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const subscriber = await Subscriber.findOne({ email });

        if (subscriber) {
            subscriber.isSubscribed = false;
            await subscriber.save();
        }

        res.status(200).json({
            success: true,
            message: 'Successfully unsubscribed'
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all subscribers
// @route   GET /api/newsletter
// @access  Private/Admin
export const getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort('-createdAt');
        res.status(200).json({
            success: true,
            count: subscribers.length,
            data: subscribers
        });
    } catch (error) {
        console.error('Get subscribers error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Send newsletter to all active subscribers
// @route   POST /api/newsletter/send
// @access  Private/Admin
export const sendNewsletter = async (req, res) => {
    try {
        const { subject, content } = req.body;

        if (!subject || !content) {
            return res.status(400).json({ success: false, message: 'Subject and content are required' });
        }

        // Get active subscribers
        const subscribers = await Subscriber.find({ isSubscribed: true });

        if (subscribers.length === 0) {
            return res.status(400).json({ success: false, message: 'No active subscribers found' });
        }

        // Send emails in background
        let successCount = 0;
        let failCount = 0;

        // Use loop for now - in production use a queue system (Bull/Redis)
        const emailPromises = subscribers.map(async (sub) => {
            try {
                const html = getNewsletterEmail(content); // We pass content, title is fixed or part of content
                await sendEmail({
                    email: sub.email,
                    subject: subject,
                    html: html
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to send to ${sub.email}:`, err);
                failCount++;
            }
        });

        await Promise.all(emailPromises);

        res.status(200).json({
            success: true,
            message: `Newsletter sent successfully`,
            stats: {
                total: subscribers.length,
                sent: successCount,
                failed: failCount
            }
        });
    } catch (error) {
        console.error('Send newsletter error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
