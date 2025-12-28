
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const promoteUser = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Please provide an email address as an argument.');
        console.log('Usage: node scripts/promoteToSuperAdmin.js <email>');
        process.exit(1);
    }

    try {
        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`❌ User not found with email: ${email}`);
            process.exit(1);
        }

        user.userType = 'admin';
        user.role = 'super-admin';
        user.adminPermissions = {
            canManageUsers: true,
            canManageProducts: true,
            canManageOrders: true,
            canManageContent: true
        };
        user.isVerified = true;
        user.isActive = true;

        await user.save();

        console.log(`✅ Use ${user.firstName} (${user.email}) is now a SUPER ADMIN!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error promoting user:', error);
        process.exit(1);
    }
};

promoteUser();
