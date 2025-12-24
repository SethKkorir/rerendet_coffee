import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const resetAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@rerendetcoffee.com';
        const adminPassword = 'Admin123!';

        // Find existing admin
        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log('🔄 Updating existing admin user...');
            admin.password = adminPassword;
            admin.role = 'super-admin';
            admin.userType = 'admin';
            admin.isVerified = true;
            admin.isActive = true;
            admin.adminPermissions = {
                canManageUsers: true,
                canManageProducts: true,
                canManageOrders: true,
                canManageContent: true
            };

            // Force password save (trigger pre-save hash)
            admin.markModified('password');
            await admin.save();
            console.log('✅ Admin password and permissions reset successfully');
        } else {
            console.log('🆕 Creating new admin user...');
            await User.create({
                firstName: 'Super',
                lastName: 'Admin',
                email: adminEmail,
                password: adminPassword,
                phone: '+254700000000',
                userType: 'admin',
                role: 'super-admin',
                isVerified: true,
                isActive: true,
                adminPermissions: {
                    canManageUsers: true,
                    canManageProducts: true,
                    canManageOrders: true,
                    canManageContent: true
                }
            });
            console.log('✅ New admin user created successfully');
        }

        console.log(`
    =========================================
    🔑 ADMIN CREDENTIALS
    Email: ${adminEmail}
    Password: ${adminPassword}
    =========================================
    `);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting admin:', error);
        process.exit(1);
    }
};

resetAdmin();
