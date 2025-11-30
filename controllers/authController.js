import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ==================== CUSTOMER AUTH ====================

// Customer registration
const registerCustomer = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, gender, dateOfBirth, userType = 'customer' } = req.body;
  
  console.log(`👤 Customer registration attempt:`, email);

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  // Validate age if dateOfBirth provided
  if (dateOfBirth) {
    const age = Math.floor((new Date() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 13) {
      res.status(400);
      throw new Error('You must be at least 13 years old to create an account');
    }
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create customer user
  const userData = {
    firstName,
    lastName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    userType: 'customer', // Force customer type
    role: 'customer'
  };

  const newUser = await User.create(userData);

  // Generate verification code
  const verificationCode = newUser.generateVerificationCode();
  await newUser.save({ validateBeforeSave: false });

  try {
    console.log(`📧 Sending verification email to customer:`, email);
    
    // Send verification email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 30px; text-align: center;">
          <h1>☕ Rerendet Coffee</h1>
          <p>Welcome to our coffee community!</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${firstName}!</h2>
          <p>Thank you for registering with Rerendet Coffee. Use the verification code below:</p>
          <div style="background: white; padding: 20px; text-align: center; margin: 20px 0; border: 2px dashed #10b981;">
            <div style="font-size: 2.5rem; font-weight: bold; color: #10b981; letter-spacing: 5px;">${verificationCode}</div>
          </div>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0;">
            <strong>⚠️ This code will expire in 10 minutes.</strong>
          </div>
          <p>Enter this code to activate your account and start exploring our premium coffee selection.</p>
        </div>
      </div>
    `;

    await sendEmail({
      email: newUser.email,
      subject: `Verify Your Email - Rerendet Coffee`,
      html: emailHtml
    });

    console.log(`✅ Verification email sent to customer:`, email);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification.',
      data: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        userType: newUser.userType
      }
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    await User.findByIdAndDelete(newUser._id);
    res.status(500);
    throw new Error('Registration failed: Could not send verification email. Please try again.');
  }
});

// Customer login
const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log('👤 Customer login attempt:', email);

  // Only look for customers
  const user = await User.findOne({ 
    email, 
    userType: 'customer'  // Only customers
  }).select('+password +isVerified +loginAttempts +lockUntil +verificationCode +verificationCodeExpires');

  if (!user) {
    console.log('❌ Customer not found:', email);
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const lockTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
    res.status(423);
    throw new Error(`Account temporarily locked. Try again in ${lockTime} minutes.`);
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log('❌ Invalid password for customer:', email);
    
    // Increment login attempts
    await User.findByIdAndUpdate(user._id, {
      $inc: { loginAttempts: 1 }
    });

    // Check if we should lock the account
    const updatedUser = await User.findById(user._id).select('+loginAttempts');
    if (updatedUser.loginAttempts + 1 >= 5) {
      await User.findByIdAndUpdate(user._id, {
        lockUntil: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
      });
      res.status(423);
      throw new Error('Too many failed attempts. Account locked for 2 hours.');
    }

    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0 || user.lockUntil) {
    await User.findByIdAndUpdate(user._id, {
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 }
    });
  }

  // Check if account is verified
  if (!user.isVerified) {
    console.log('❌ Customer account not verified:', email);
    
    // Resend verification code
    const verificationCode = user.generateVerificationCode();
    await user.save({ validateBeforeSave: false });

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verification Required - Rerendet Coffee',
        html: `Your verification code: <strong>${verificationCode}</strong>`
      });
    } catch (emailError) {
      console.error('Failed to resend verification:', emailError);
    }

    res.status(403);
    throw new Error('Account not verified. A new verification code has been sent to your email.');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  console.log('✅ Customer login successful:', email);

  res.json({
    success: true,
    message: 'Login successful! Welcome back!',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        shippingInfo: user.shippingInfo || {}
      },
      token
    }
  });
});

// ==================== ADMIN AUTH ====================

// Admin login (separate endpoint)
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log('👑 Admin login attempt:', email);

  try {
    // Find admin user ONLY
    const user = await User.findOne({ 
      email, 
      userType: 'admin'
    }).select('+password +adminPermissions +role +isVerified +isActive');

    console.log('🔍 Admin user search result:', user ? 'FOUND' : 'NOT FOUND');

    if (!user) {
      console.log('❌ Admin not found - user exists but not as admin:', email);
      res.status(401);
      throw new Error('Invalid admin credentials');
    }

    // Check if admin account is active
    if (user.isActive === false) {
      console.log('❌ Admin account inactive:', email);
      res.status(401);
      throw new Error('Admin account is deactivated. Please contact system administrator.');
    }

    // Verify password
    console.log('🔐 Verifying password...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password match result:', isMatch);

    if (!isMatch) {
      console.log('❌ Invalid password for admin:', email);
      res.status(401);
      throw new Error('Invalid admin credentials');
    }

    // Check if admin account is verified
    if (!user.isVerified) {
      console.log('❌ Admin account not verified:', email);
      res.status(403);
      throw new Error('Admin account requires verification. Please contact system administrator.');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ Admin login successful:', email, 'Role:', user.role);

    res.json({
      success: true,
      message: `Admin login successful! Welcome ${user.role === 'super-admin' ? 'Super Admin' : 'Admin'}!`,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          role: user.role,
          isVerified: user.isVerified,
          profilePicture: user.profilePicture,
          permissions: user.adminPermissions
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Admin login error:', error.message);
    throw error;
  }
});

// Create admin (protected - super-admin only)
const createAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role = 'admin', permissions = {} } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  console.log(`⚡ Super-admin ${req.user.email} creating admin:`, email);

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Set default permissions based on role
  const defaultPermissions = {
    canManageUsers: role === 'super-admin',
    canManageProducts: true,
    canManageOrders: true,
    canManageContent: true,
    ...permissions
  };

  // Create admin
  const admin = await User.create({
    firstName,
    lastName,
    email,
    password,
    userType: 'admin',
    role: role,
    isVerified: true,
    isActive: true,
    adminPermissions: defaultPermissions
  });

  console.log('✅ Admin created:', email, 'Role:', role);

  // Send welcome email to new admin
  try {
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #7c2d12); color: white; padding: 30px; text-align: center;">
          <h1>⚡ Rerendet Coffee Admin</h1>
          <p>Administrator Account Activated</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Welcome ${firstName}!</h2>
          <p>Your administrator account has been successfully created and activated.</p>
          <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3>🔧 Admin Permissions</h3>
            <ul>
              ${defaultPermissions.canManageUsers ? '<li>✅ Manage Users</li>' : ''}
              ${defaultPermissions.canManageProducts ? '<li>✅ Manage Products</li>' : ''}
              ${defaultPermissions.canManageOrders ? '<li>✅ Manage Orders</li>' : ''}
              ${defaultPermissions.canManageContent ? '<li>✅ Manage Content</li>' : ''}
            </ul>
            <p><strong>Role:</strong> ${role}</p>
          </div>
          <p>You can now access the admin dashboard.</p>
          <p><strong>Admin Dashboard:</strong> <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/login">Access Admin Panel</a></p>
        </div>
      </div>
    `;

    await sendEmail({
      email: admin.email,
      subject: `🎯 Admin Account Activated - Rerendet Coffee ${role.toUpperCase()}`,
      html: welcomeHtml
    });

    console.log('✅ Admin welcome email sent to:', email);
  } catch (emailError) {
    console.error('❌ Failed to send admin welcome email:', emailError);
  }

  res.status(201).json({
    success: true,
    message: `${role} account created successfully`,
    data: {
      id: admin._id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      permissions: admin.adminPermissions
    }
  });
});

// ==================== COMMON AUTH ====================

// Verify email
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  
  const user = await User.findOne({ 
    email,
    verificationCode: code,
    verificationCodeExpires: { $gt: Date.now() }
  });

  if (!user) {
    // Clean up unverified users with expired codes
    const maybeUser = await User.findOne({ email });
    if (maybeUser && !maybeUser.isVerified && maybeUser.userType === 'customer') {
      console.log(`Deleting unverified customer ${email} due to invalid/expired code`);
      await User.deleteOne({ _id: maybeUser._id });
    }
    res.status(400);
    throw new Error('Invalid or expired verification code');
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  const token = generateToken(user._id);

  // Send welcome email
  try {
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #10b981;">🎉 Welcome to Rerendet Coffee!</h1>
        <p>Hello ${user.firstName},</p>
        <p>Your account has been successfully verified and is now active!</p>
        <p>Start exploring: <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}">Rerendet Coffee</a></p>
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
        userType: user.userType,
        role: user.role,
        isVerified: user.isVerified
      }
    }
  });
});

// Get current user profile
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const userData = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    userType: user.userType,
    role: user.role,
    isVerified: user.isVerified,
    profilePicture: user.profilePicture,
    shippingInfo: user.shippingInfo || {}
  };

  // Add permissions if admin
  if (user.userType === 'admin') {
    userData.permissions = user.adminPermissions;
  }

  res.json({
    success: true,
    data: userData
  });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { firstName, lastName, phone, gender, dateOfBirth } = req.body;

  // Validate age if updating dateOfBirth
  if (dateOfBirth) {
    const age = Math.floor((new Date() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 13) {
      res.status(400);
      throw new Error('You must be at least 13 years old');
    }
  }

  // Update fields
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phone = phone || user.phone;
  user.gender = gender || user.gender;
  user.dateOfBirth = dateOfBirth || user.dateOfBirth;

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
      userType: updatedUser.userType,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified
    }
  });
});

// Logout
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Check email availability
const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    res.status(400);
    throw new Error('Email parameter is required');
  }

  const user = await User.findOne({ email });
  
  res.json({
    success: true,
    data: {
      exists: !!user,
      userType: user?.userType
    }
  });
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found with this email');
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = resetCode;
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  try {
    // Send reset email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Password Reset Request</h2>
        <p>Hello ${user.firstName},</p>
        <p>You requested to reset your password. Use the code below:</p>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #10b981; margin: 0; font-size: 2.5rem; letter-spacing: 5px;">${resetCode}</h1>
        </div>
        <p>This code will expire in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
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
  
  if (!email || !code || !newPassword) {
    res.status(400);
    throw new Error('Email, code, and new password are required');
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters long');
  }

  const user = await User.findOne({
    email,
    resetPasswordToken: code,
    resetPasswordExpires: { $gt: Date.now() }
  });

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

// Resend verification code
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email, userType: 'customer' });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found with this email');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Email is already verified');
  }

  const verificationCode = user.generateVerificationCode();
  await user.save({ validateBeforeSave: false });

  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 30px; text-align: center;">
          <h1>☕ Rerendet Coffee</h1>
          <p>New Verification Code</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2>Hello ${user.firstName}!</h2>
          <p>You requested a new verification code:</p>
          <div style="background: white; padding: 20px; text-align: center; margin: 20px 0; border: 2px dashed #10b981;">
            <div style="font-size: 2.5rem; font-weight: bold; color: #10b981; letter-spacing: 5px;">${verificationCode}</div>
          </div>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0;">
            <strong>⚠️ This code will expire in 10 minutes.</strong>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'New Verification Code - Rerendet Coffee',
      html: emailHtml
    });

    console.log('✅ Verification email resent to:', email);

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    res.status(500);
    throw new Error('Failed to send verification email');
  }
});

export {
  // Customer auth
  registerCustomer,
  loginCustomer,
  
  // Admin auth
  loginAdmin,
  createAdmin,
  
  // Common auth
  verifyEmail,
  getCurrentUser,
  updateProfile,
  logout,
  checkEmail,
  forgotPassword,
  resetPassword,
  resendVerification
};