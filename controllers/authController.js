// controllers/authController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, gender, dateOfBirth } = req.body;

  console.log('🚀 Registration attempt for:', email);

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    gender,
    dateOfBirth: dateOfBirth || null
  });

  // Generate verification code
  const verificationCode = user.generateVerificationCode();
  await user.save({ validateBeforeSave: false });

  console.log('📧 Sending verification code to:', email);
  console.log('🔢 Generated code:', verificationCode);

  // Send verification email
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .code { background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px dashed #10b981; }
          .code-number { font-size: 2.5rem; font-weight: bold; color: #10b981; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9rem; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>☕ Rerendet Coffee</h1>
          <p>Welcome to our coffee community!</p>
        </div>
        <div class="content">
          <h2>Hello ${firstName}!</h2>
          <p>Thank you for registering with Rerendet Coffee. To complete your registration, please use the verification code below:</p>
          
          <div class="code">
            <div class="code-number">${verificationCode}</div>
          </div>
          
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>Enter this code on the verification page to activate your account and start exploring our premium coffee selection.</p>
          
          <p>If you didn't create an account with us, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Rerendet Coffee. All rights reserved.</p>
          <p>Nakuru, Kenya</p>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - Rerendet Coffee',
      html: emailHtml
    });

    console.log('✅ Verification email sent to:', user.email);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the verification code.',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // Even if email fails, still allow registration but tell user to contact support
    res.status(201).json({
      success: true,
      message: 'Registration successful but verification email failed. Please contact support.',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      note: 'Email service temporarily unavailable'
    });
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  console.log('🔍 Verifying email:', email, 'with code:', code);

  const user = await User.findOne({ 
    email,
    verificationCode: code,
    verificationCodeExpires: { $gt: Date.now() }
  }).select('+verificationCode +verificationCodeExpires');

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification code');
  }

  // Mark user as verified and clear verification code
  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  console.log('✅ Email verified successfully for:', email);

  // Send welcome email - SIMPLIFIED VERSION
  try {
    console.log('📧 Attempting to send welcome email to:', user.email);
    
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #10b981;">🎉 Welcome to Rerendet Coffee!</h1>
        <p>Hello ${user.firstName},</p>
        <p>Your account has been successfully verified and is now active!</p>
        <p>You can now:</p>
        <ul>
          <li>Browse our premium coffee selection</li>
          <li>Place orders for delivery</li>
          <li>Track your orders</li>
          <li>Save your favorite products</li>
        </ul>
        <p>Start exploring: <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}">Rerendet Coffee</a></p>
        <br>
        <p>Best regards,<br>The Rerendet Coffee Team</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Welcome to Rerendet Coffee! 🎉',
      html: welcomeHtml
    });

    console.log('✅ Welcome email sent successfully to:', user.email);

  } catch (welcomeError) {
    console.log('⚠️ Welcome email failed:', welcomeError.message);
    // Don't throw error - verification should still succeed
  }

  res.json({
    success: true,
    message: 'Email verified successfully! Welcome to Rerendet Coffee!',
    data: {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin
      }
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Login attempt for:', email);

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isVerified) {
    res.status(401);
    throw new Error('Please verify your email before logging in');
  }

  // Generate token
  const token = generateToken(user._id);

  console.log('✅ Login successful for:', email);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin
      }
    }
  });
});

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
// controllers/authController.js - Google Auth with Welcome Email
const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, picture, googleId, firstName, lastName } = req.body;

  console.log('🔐 Google auth attempt for:', email);

  try {
    let user = await User.findOne({ 
      $or: [{ email }, { googleId }] 
    });

    let isNewUser = false;

    if (user) {
      // User exists - update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture;
        await user.save();
      }
    } else {
      // Create new user with Google
      isNewUser = true;
      const nameParts = name.split(' ');
      user = await User.create({
        firstName: firstName || nameParts[0] || 'User',
        lastName: lastName || nameParts.slice(1).join(' ') || 'User',
        email,
        googleId,
        profilePicture: picture,
        isVerified: true, // Google emails are verified
        password: Math.random().toString(36).slice(-16) + 'Aa1!' // Random secure password
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ Google auth successful for:', email);

    // Send welcome email for new users
    if (isNewUser) {
      try {
        const welcomeHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #10b981;">🎉 Welcome to Rerendet Coffee!</h1>
            <p>Hello ${user.firstName},</p>
            <p>Thank you for joining Rerendet Coffee using Google Sign-In!</p>
            <p>Your account has been created and you're ready to:</p>
            <ul>
              <li>Browse our premium coffee selection</li>
              <li>Place orders for delivery</li>
              <li>Track your orders</li>
              <li>Save your favorite products</li>
            </ul>
            <p>Start exploring: <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}">Rerendet Coffee</a></p>
            <br>
            <p>Best regards,<br>The Rerendet Coffee Team</p>
          </div>
        `;

        await sendEmail({
          email: user.email,
          subject: 'Welcome to Rerendet Coffee! 🎉',
          html: welcomeHtml
        });

        console.log('✅ Welcome email sent to new Google user:', user.email);
      } catch (emailError) {
        console.log('⚠️ Welcome email failed for Google user:', emailError.message);
        // Don't throw error - login should still succeed
      }
    }

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully! Welcome to Rerendet Coffee!' : 'Login successful!',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified,
          isAdmin: user.isAdmin,
          googleId: user.googleId
        }
      }
    });

  } catch (error) {
    console.error('❌ Google auth error:', error);
    res.status(500);
    throw new Error('Google authentication failed');
  }
});
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      googleId: user.googleId
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        dateOfBirth: updatedUser.dateOfBirth,
        profilePicture: updatedUser.profilePicture,
        isVerified: updatedUser.isVerified,
        isAdmin: updatedUser.isAdmin
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Check if email exists
// @route   GET /api/auth/check-email
// @access  Public
const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;

  const user = await User.findOne({ email });
  
  res.json({
    success: true,
    data: {
      exists: !!user
    }
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found with this email');
  }

  // Generate reset token (6-digit code)
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = resetCode;
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  // Send email
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Password Reset Request</h2>
        <p>Hello ${user.firstName},</p>
        <p>You requested to reset your password. Please use the code below:</p>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #10b981; margin: 0; font-size: 2.5rem; letter-spacing: 5px;">${resetCode}</h1>
        </div>
        <p>This code will expire in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The Rerendet Coffee Team</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Code - Rerendet Coffee',
      html: emailHtml
    });

    res.json({
      success: true,
      message: 'Password reset code sent to your email'
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  const user = await User.findOne({
    email,
    resetPasswordToken: code,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset code');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
});

export {
  registerUser,
  verifyEmail,
  loginUser,
  googleAuth,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  checkEmail,
  forgotPassword,
  resetPassword
};