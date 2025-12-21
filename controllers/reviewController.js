import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Add a product review
// @route   POST /api/reviews/:productId
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const alreadyReviewed = await Review.findOne({
        user: req.user._id,
        product: productId
    });

    if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed');
    }

    // Check if it's a verified purchase
    const hasOrdered = await Order.findOne({
        user: req.user._id,
        'items.product': productId,
        status: 'delivered'
    });

    const review = await Review.create({
        name: req.user.firstName + ' ' + req.user.lastName,
        rating: Number(rating),
        comment,
        user: req.user._id,
        product: productId,
        isVerifiedPurchase: !!hasOrdered
    });

    // Update product ratings
    const reviews = await Review.find({ product: productId });
    product.ratings.count = reviews.length;
    product.ratings.average = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: review
    });
});

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId })
        .sort({ createdAt: -1 })
        .populate('user', 'firstName lastName profilePicture');

    res.json({
        success: true,
        data: reviews
    });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    // Only the author or an admin can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to delete this review');
    }

    const productId = review.product;
    await review.remove();

    // Recalculate product rating
    const reviews = await Review.find({ product: productId });
    const product = await Product.findById(productId);

    if (product) {
        product.ratings.count = reviews.length;
        product.ratings.average = reviews.length > 0
            ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
            : 0;
        await product.save();
    }

    res.json({
        success: true,
        message: 'Review removed'
    });
});

export {
    createProductReview,
    getProductReviews,
    deleteReview
};
