// controllers/authController.js
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { generateToken } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Register new user & send verification code
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, gender, dateOfBirth } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create user (not verified yet)
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    gender,
    dateOfBirth
  });

  if (user) {
    // Generate verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify Your Email - Rerendet Coffee',
        html: `
          <h2>Welcome to Rerendet Coffee!</h2>
          <p>Your verification code is: <strong>${verificationCode}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `
      });

      res.status(201).json({
        success: true,
        message: 'Verification code sent to email',
        data: {
          id: user._id,
          email: user.email,
          firstName: user.firstName
        }
      });
    } catch (error) {
      // If email fails, remove the user
      await User.findByIdAndDelete(user._id);
      res.status(500);
      throw new Error('Email could not be sent. Please try again.');
    }
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Verify email with code
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({
    email,
    verificationCode: code,
    verificationCodeExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification code');
  }

  // Mark as verified and clear verification code
  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  // generateToken(res, user._id);
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Email verified successfully',
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      token: token
    }
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Check if email is verified
    if (!user.isVerified) {
      res.status(401);
      throw new Error('Please verify your email before logging in');
    }

    // generateToken(res, user._id);
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        avatar: user.avatar,
        token: token
      }
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      avatar: user.avatar,
      preferences: user.preferences,
      addresses: user.addresses
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.avatar = req.body.avatar || user.avatar;
    user.preferences = req.body.preferences || user.preferences;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      isAdmin: updatedUser.isAdmin,
      isVerified: updatedUser.isVerified,
      avatar: updatedUser.avatar,
      preferences: updatedUser.preferences
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found with this email');
  }

  // Generate reset token
  const resetToken = user.generateVerificationCode();
  await user.save();

  // Send reset email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request - Rerendet Coffee',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Use the code below to reset your password:</p>
      <h3>${resetToken}</h3>
      <p>This code will expire in 10 minutes.</p>
    `
  });

  res.json({
    success: true,
    message: 'Password reset code sent to email'
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  const user = await User.findOne({
    email,
    verificationCode: code,
    verificationCodeExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset code');
  }

  user.password = newPassword;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
});
// @desc    Check if email exists
// @route   GET /api/auth/check-email
// @access  Public
const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.json({ exists: true, message: 'Email already registered' });
  } else {
    return res.json({ exists: false, message: 'Email available' });
  }
});

export {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  checkEmail
};