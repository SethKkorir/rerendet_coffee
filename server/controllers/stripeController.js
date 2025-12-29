
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Payment from '../models/PaymentTransaction.js'; // Assuming you have a Payment model, otherwise use PaymentTransaction or similar
import asyncHandler from 'express-async-handler';
import PaymentMethod from '../models/PaymentMethod.js';

// Initialize Stripe lazily or with a check to allow server startup without keys for dev
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.warn("⚠️ STRIPE_SECRET_KEY is missing. Stripe functionality will not work.");
        return null;
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const stripe = getStripe();

// @desc    Create Payment Intent
// @route   POST /api/payments/stripe/create-payment-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Calculate amount in cents (smallest currency unit)
    const amount = Math.round(order.totalPrice * 100);

    // Create a PaymentIntent with the order amount and currency
    if (!stripe) {
        res.status(500);
        throw new Error('Stripe is not configured on the server');
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'kes', // or usd
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            orderId: order._id.toString(),
            userId: req.user._id.toString()
        }
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});


// @desc    Stripe Webhook
// @route   POST /api/payments/stripe/webhook
// @access  Public
export const handleStripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        if (!stripe) {
            throw new Error('Stripe is not configured');
        }
        event = stripe.webhooks.constructEvent(
            req.body, // Note: body-parser must be configured to return raw body for this route
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await handlePaymentSuccess(paymentIntent);
            break;
        case 'payment_intent.payment_failed':
            const paymentIntentFailed = event.data.object;
            await handlePaymentFailure(paymentIntentFailed);
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
});


const handlePaymentSuccess = async (paymentIntent) => {
    const { orderId, userId } = paymentIntent.metadata;
    console.log(`Payment succeeded for order ${orderId}`);

    // Update order status
    const order = await Order.findById(orderId);
    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email: paymentIntent.receipt_email,
        };
        // order.status = 'confirmed'; 
        await order.save();

        // Record transaction
        await Payment.create({
            order: orderId,
            provider: 'STRIPE',
            transactionId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            status: 'SUCCESS',
            metadata: {
                userId: userId,
                email: paymentIntent.receipt_email
            },
            rawResponse: paymentIntent
        });
    }
}

const handlePaymentFailure = async (paymentIntent) => {
    const { orderId } = paymentIntent.metadata;
    console.log(`Payment failed for order ${orderId}`);
    // Handle failure logic...
}
