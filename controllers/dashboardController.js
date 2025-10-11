// controllers/dashboardController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Address from '../models/Address.js';
import PaymentMethod from '../models/PaymentMethod.js';
import Order from '../models/Order.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import sendEmail from '../utils/sendEmail.js';

// @desc    Get dashboard data
// @route   GET /api/dashboard/data
// @access  Private
const getDashboardData = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    user,
    addresses,
    paymentMethods,
    recentOrders,
    ordersCount
  ] = await Promise.all([
    User.findById(userId),
    Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }),
    PaymentMethod.find({ user: userId, isActive: true }).sort({ isDefault: -1, createdAt: -1 }),
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.product', 'name images'),
    Order.countDocuments({ user: userId })
  ]);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Calculate loyalty progress
  const loyaltyProgress = Math.min((user.loyalty.points / 1000) * 100, 100);
  const nextTier = user.loyalty.tier === 'Bronze' ? 'Silver' : 
                  user.loyalty.tier === 'Silver' ? 'Gold' : 
                  user.loyalty.tier === 'Gold' ? 'Platinum' : 'Platinum';

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        profilePicture: user.profilePicture,
        preferences: user.preferences || {
          favoriteRoast: '',
          brewMethod: '',
        },
        loyalty: {
          points: user.loyalty.points,
          tier: user.loyalty.tier,
          nextTier: nextTier,
          progress: loyaltyProgress
        }
      },
      addresses: addresses || [],
      paymentMethods: paymentMethods || [],
      recentOrders: recentOrders || [],
      stats: {
        totalOrders: ordersCount,
        loyaltyPoints: user.loyalty.points,
        loyaltyTier: user.loyalty.tier,
        loyaltyProgress,
        favoritesCount: 0
      }
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/dashboard/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, dateOfBirth, gender } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!firstName || !lastName) {
    res.status(400);
    throw new Error('First name and last name are required');
  }

  // Validate phone format
  if (phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone)) {
    res.status(400);
    throw new Error('Please provide a valid phone number');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth
      }
    }
  });
});

// @desc    Update user preferences
// @route   PUT /api/dashboard/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res) => {
  const { favoriteRoast, brewMethod } = req.body;
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    {
      preferences: {
        favoriteRoast,
        brewMethod
      }
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      preferences: user.preferences
    }
  });
});

// @desc    Get user addresses
// @route   GET /api/dashboard/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id })
    .sort({ isDefault: -1, createdAt: -1 });

  res.json({
    success: true,
    data: addresses
  });
});

// @desc    Add new address
// @route   POST /api/dashboard/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const { type, name, street, city, postalCode, country, isDefault, instructions } = req.body;

  // Validate required fields
  if (!name || !street || !city || !postalCode) {
    res.status(400);
    throw new Error('Please fill in all required address fields');
  }

  const address = await Address.create({
    user: req.user._id,
    type,
    name,
    street,
    city,
    postalCode,
    country: country || 'Kenya',
    isDefault: isDefault || false,
    instructions
  });

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    data: address
  });
});

// @desc    Update address
// @route   PUT /api/dashboard/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  const updatedAddress = await Address.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Address updated successfully',
    data: updatedAddress
  });
});

// @desc    Delete address
// @route   DELETE /api/dashboard/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (address.isDefault) {
    res.status(400);
    throw new Error('Cannot delete default address');
  }

  await Address.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Address deleted successfully'
  });
});

// @desc    Get payment methods
// @route   GET /api/dashboard/payment-methods
// @access  Private
const getPaymentMethods = asyncHandler(async (req, res) => {
  const paymentMethods = await PaymentMethod.find({ 
    user: req.user._id,
    isActive: true 
  }).sort({ isDefault: -1, createdAt: -1 });

  res.json({
    success: true,
    data: paymentMethods
  });
});

// @desc    Add payment method
// @route   POST /api/dashboard/payment-methods
// @access  Private
const addPaymentMethod = asyncHandler(async (req, res) => {
  const { type, name, phone, card, isDefault } = req.body;

  if (!name || !type) {
    res.status(400);
    throw new Error('Payment method name and type are required');
  }

  if (type === 'mpesa' && !phone) {
    res.status(400);
    throw new Error('Phone number is required for M-Pesa');
  }

  const paymentMethod = await PaymentMethod.create({
    user: req.user._id,
    type,
    name,
    phone,
    card,
    isDefault: isDefault || false
  });

  res.status(201).json({
    success: true,
    message: 'Payment method added successfully',
    data: paymentMethod
  });
});

// @desc    Update payment method
// @route   PUT /api/dashboard/payment-methods/:id
// @access  Private
const updatePaymentMethod = asyncHandler(async (req, res) => {
  const paymentMethod = await PaymentMethod.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!paymentMethod) {
    res.status(404);
    throw new Error('Payment method not found');
  }

  const updatedPaymentMethod = await PaymentMethod.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Payment method updated successfully',
    data: updatedPaymentMethod
  });
});

// @desc    Delete payment method
// @route   DELETE /api/dashboard/payment-methods/:id
// @access  Private
const deletePaymentMethod = asyncHandler(async (req, res) => {
  const paymentMethod = await PaymentMethod.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!paymentMethod) {
    res.status(404);
    throw new Error('Payment method not found');
  }

  if (paymentMethod.isDefault) {
    res.status(400);
    throw new Error('Cannot delete default payment method');
  }

  await PaymentMethod.findByIdAndUpdate(
    req.params.id,
    { isActive: false }
  );

  res.json({
    success: true,
    message: 'Payment method deleted successfully'
  });
});

// @desc    Update password with security checks
// @route   PUT /api/dashboard/security/password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters long');
  }

  // Password strength validation
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!strongPasswordRegex.test(newPassword)) {
    res.status(400);
    throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
  }

  const user = await User.findById(userId).select('+password +security');

  // Check if current password is correct
  if (!(await user.comparePassword(currentPassword))) {
    await user.incrementLoginAttempts();
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Check if new password is same as current
  if (await user.comparePassword(newPassword)) {
    res.status(400);
    throw new Error('New password cannot be the same as current password');
  }

  // Reset login attempts on successful password verification
  await user.resetLoginAttempts();

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Get security settings
// @route   GET /api/dashboard/security/settings
// @access  Private
const getSecuritySettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('security');

  res.json({
    success: true,
    data: {
      twoFactorEnabled: user.security.twoFactorEnabled,
      lastPasswordChange: user.security.lastPasswordChange,
      loginAttempts: user.security.loginAttempts,
      isLocked: user.isLocked
    }
  });
});

// @desc    Enable 2FA
// @route   POST /api/dashboard/security/2fa/enable
// @access  Private
const enable2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.security.twoFactorEnabled) {
    res.status(400);
    throw new Error('2FA is already enabled');
  }

  const secret = speakeasy.generateSecret({
    name: `Rerendet Coffee (${user.email})`
  });

  user.security.twoFactorSecret = secret.base32;
  await user.save();

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  res.json({
    success: true,
    data: {
      secret: secret.base32,
      qrCode: qrCodeUrl
    }
  });
});

// @desc    Verify and enable 2FA
// @route   POST /api/dashboard/security/2fa/verify
// @access  Private
const verify2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error('2FA token is required');
  }

  const user = await User.findById(req.user._id);

  const verified = speakeasy.totp.verify({
    secret: user.security.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 2
  });

  if (!verified) {
    res.status(400);
    throw new Error('Invalid 2FA token');
  }

  user.security.twoFactorEnabled = true;
  await user.save();

  res.json({
    success: true,
    message: '2FA enabled successfully'
  });
});

// @desc    Disable 2FA
// @route   POST /api/dashboard/security/2fa/disable
// @access  Private
const disable2FA = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Password is required to disable 2FA');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Password is incorrect');
  }

  user.security.twoFactorEnabled = false;
  user.security.twoFactorSecret = undefined;
  await user.save();

  res.json({
    success: true,
    message: '2FA disabled successfully'
  });
});

// @desc    Get login history
// @route   GET /api/dashboard/security/login-history
// @access  Private
const getLoginHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('loginHistory');

  res.json({
    success: true,
    data: user.loginHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  });
});

// @desc    Get orders with pagination
// @route   GET /api/dashboard/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, totalOrders] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name images'),
    Order.countDocuments({ user: userId })
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit)
      }
    }
  });
});

// @desc    Delete user account
// @route   DELETE /api/dashboard/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const userId = req.user._id;

  if (!password) {
    res.status(400);
    throw new Error('Password is required to delete account');
  }

  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    res.status(401);
    throw new Error('Incorrect password. Account deletion failed.');
  }

  // Store user data for email before deletion
  const userData = {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };

  // Delete associated data
  await Promise.all([
    Address.deleteMany({ user: userId }),
    PaymentMethod.deleteMany({ user: userId }),
    User.findByIdAndDelete(userId)
  ]);

  // Send goodbye email
  try {
    const goodbyeHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: #1a1a1a; margin-bottom: 20px;">😔 We're Sad to See You Go</h1>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p>Hello ${userData.firstName},</p>
            <p>Your Rerendet Coffee account has been successfully deleted.</p>
            <p>We're sorry to see you leave and hope you enjoyed your coffee journey with us.</p>
            
            <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ef4444;">
              <p style="color: #dc2626; margin: 0; font-size: 0.9rem;">
                <strong>Note:</strong> All your data, including order history and preferences, has been permanently deleted from our systems.
              </p>
            </div>
            
            <p>If you change your mind, we'd love to welcome you back anytime!</p>
          </div>
          
          <p style="color: #6b7280; font-size: 0.9rem;">
            If this was a mistake or you need assistance, please contact our support team immediately.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 0.8rem;">
          <p>&copy; ${new Date().getFullYear()} Rerendet Coffee. All rights reserved.</p>
        </div>
      </div>
    `;

    await sendEmail({
      email: userData.email,
      subject: 'Account Deletion Confirmation - Rerendet Coffee',
      html: goodbyeHtml
    });
  } catch (error) {
    console.error('Goodbye email failed:', error);
  }

  res.json({
    success: true,
    message: 'Account successfully deleted. We hope to see you again!'
  });
});

// Export all functions
export {
  getDashboardData,
  updateProfile,
  updatePreferences,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  updatePassword,
  getSecuritySettings,
  enable2FA,
  verify2FA,
  disable2FA,
  getLoginHistory,
  getOrders,
  deleteAccount
};