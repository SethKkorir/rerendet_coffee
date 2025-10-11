// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  dateOfBirth: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    select: false
  },
  verificationCodeExpires: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  googleId: {
    type: String,
    sparse: true
  },
  profilePicture: {
    type: String
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  shippingInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    zip: String,
    country: String,
    deliveryOption: String
  },
  // NEW FIELDS FOR DASHBOARD
  preferences: {
    favoriteRoast: {
      type: String,
      enum: ['light', 'medium', 'dark', ''],
      default: ''
    },
    brewMethod: {
      type: String,
      enum: ['espresso', 'pour-over', 'french-press', 'aeropress', ''],
      default: ''
    }
  },
  loyalty: {
    points: {
      type: Number,
      default: 0
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  security: {
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    lastPasswordChange: {
      type: Date,
      default: Date.now
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String
  },
  lastLogin: Date,
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    success: Boolean
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Update password change timestamp
    if (this.isModified('password')) {
      this.security.lastPasswordChange = Date.now();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate verification code
userSchema.methods.generateVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = code;
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

// NEW SECURITY METHODS
userSchema.methods.incrementLoginAttempts = async function() {
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { 'security.loginAttempts': 1 },
      $unset: { 'security.lockUntil': 1 }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  if (this.security.loginAttempts + 1 >= 5 && !this.security.lockUntil) {
    updates.$set = { 'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return await this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { 'security.loginAttempts': 0 },
    $unset: { 'security.lockUntil': 1 }
  });
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.security.lastPasswordChange) {
    const changedTimestamp = parseInt(this.security.lastPasswordChange.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Update loyalty points
userSchema.methods.updateLoyaltyPoints = async function(points) {
  this.loyalty.points += points;
  
  // Update tier based on points
  if (this.loyalty.points >= 1000) {
    this.loyalty.tier = 'Platinum';
  } else if (this.loyalty.points >= 500) {
    this.loyalty.tier = 'Gold';
  } else if (this.loyalty.points >= 100) {
    this.loyalty.tier = 'Silver';
  } else {
    this.loyalty.tier = 'Bronze';
  }
  
  await this.save();
};

// Remove sensitive information when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.verificationCode;
  delete user.verificationCodeExpires;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.security?.twoFactorSecret;
  return user;
};

export default mongoose.model('User', userSchema);