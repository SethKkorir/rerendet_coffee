// scripts/debugAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const debugAdmin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Find ALL users with the admin email
    const allUsers = await User.find({ email: 'admin@rerendetcoffee.com' });
    console.log('🔍 ALL users with admin email:', allUsers.map(u => ({
      id: u._id,
      email: u.email,
      userType: u.userType,
      role: u.role,
      isActive: u.isActive,
      isVerified: u.isVerified,
      firstName: u.firstName,
      lastName: u.lastName
    })));

    // Specifically find admin user
    const adminUser = await User.findOne({ 
      email: 'admin@rerendetcoffee.com',
      userType: 'admin'
    }).select('+password');

    if (!adminUser) {
      console.log('❌ No admin user found with email: admin@rerendetcoffee.com and userType: admin');
      console.log('💡 Try creating the admin user again...');
    } else {
      console.log('✅ Admin user found:', {
        id: adminUser._id,
        email: adminUser.email,
        userType: adminUser.userType,
        role: adminUser.role,
        isActive: adminUser.isActive,
        isVerified: adminUser.isVerified,
        hasPassword: !!adminUser.password
      });

      // Test password verification
      const testPassword = 'Admin123!';
      const isMatch = await bcrypt.compare(testPassword, adminUser.password);
      console.log('🔐 Password verification test:');
      console.log('   Test password:', testPassword);
      console.log('   Password matches:', isMatch);
    }

    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

debugAdmin();