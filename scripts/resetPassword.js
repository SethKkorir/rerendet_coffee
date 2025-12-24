
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetPassword = async () => {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
        console.error('❌ Please provide email and new password.');
        console.log('Usage: node scripts/resetPassword.js <email> <newPassword>');
        process.exit(1);
    }

    try {
        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`❌ User not found with email: ${email}`);
            process.exit(1);
        }

        // Hash the new password manually (or rely on pre-save hook if we set it directly)
        // The User model has a pre-save hook for password hashing, so we just set it.
        // However, to be safe and explicit, let's verify the hook exists or just save.
        // Looking at User.js, it has: userSchema.pre('save', ...)

        user.password = newPassword;

        // We also need to clear any locks
        user.loginAttempts = 0;
        user.lockUntil = undefined;

        await user.save();

        console.log(`✅ Password for ${user.email} has been reset successfully.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
};

resetPassword();
