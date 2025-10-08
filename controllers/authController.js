import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';

// Register user - ADD LOADING INDICATOR
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, gender, dateOfBirth } = req.body;
  console.log('🚀 Registration attempt for:', email);

  // Simulate processing delay for better UX
  await new Promise(resolve => setTimeout(resolve, 1500));

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    gender,
    dateOfBirth: dateOfBirth || null
  });

  const verificationCode = user.generateVerificationCode();
  await user.save({ validateBeforeSave: false });

  try {
    console.log('📧 Sending verification email to:', email);
    
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
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0; }
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
          <div class="warning">
            <strong>⚠️ This code will expire in 10 minutes.</strong>
          </div>
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

    console.log('✅ Verification email sent successfully to:', email);

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
    console.error('❌ Email sending failed:', error);
    
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

// Verify email
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ 
    email,
    verificationCode: code,
    verificationCodeExpires: { $gt: Date.now() }
  }).select('+verificationCode +verificationCodeExpires');

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification code');
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  const token = generateToken(user._id);

  try {
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #10b981;">🎉 Welcome to Rerendet Coffee!</h1>
        <p>Hello ${user.firstName},</p>
        <p>Your account has been successfully verified and is now active!</p>
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
  } catch (welcomeError) {
    // Email failure doesn't stop flow
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

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isVerified) {
    res.status(401);
    throw new Error('Please verify your email before logging in');
  }
  const token = generateToken(user._id);

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

// Google OAuth login/register
const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, picture, googleId, firstName, lastName } = req.body;
  let user = await User.findOne({ $or: [{ email }, { googleId }] });
  let isNewUser = false;

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.profilePicture = picture;
      await user.save();
    }
  } else {
    isNewUser = true;
    const nameParts = name ? name.split(' ') : [];
    user = await User.create({
      firstName: firstName || nameParts[0] || 'User',
      lastName: lastName || nameParts.slice(1).join(' ') || 'User',
      email,
      googleId,
      profilePicture: picture,
      isVerified: true,
      password: Math.random().toString(36).slice(-16) + 'Aa1!'
    });
  }

  const token = generateToken(user._id);

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
    } catch (error) {
      // Email failure doesn't stop flow
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
});

// Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new Error('User not found');
  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    shippingInfo: user.shippingInfo || {}
  });
});

// Update user profile
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

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Check if email exists
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

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found with this email');
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = resetCode;
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

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

// Reset password
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
  logoutUser,
  getUserProfile,
  updateUserProfile,
  checkEmail,
  forgotPassword,
  resetPassword
};
  