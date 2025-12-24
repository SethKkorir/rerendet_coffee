import { sendEmail } from './emailService.js';

/**
 * Notify admin when stock is low for a product
 */
export const sendLowStockAlert = async (product) => {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.EMAIL_USER;

    if (!adminEmail) {
        console.warn('⚠️ No admin email configured for low stock alerts');
        return;
    }

    const emailOptions = {
        email: adminEmail,
        subject: `⚠️ Low Stock Alert: ${product.name}`,
        template: 'lowStockAlert',
        context: {
            productName: product.name,
            currentStock: product.inventory.stock,
            threshold: product.inventory.lowStockAlert,
            productUrl: `${process.env.FRONTEND_URL}/admin/products/${product._id}`
        }
    };

    try {
        await sendEmail(emailOptions);
        console.log(`📧 Low stock alert sent for ${product.name} to ${adminEmail}`);
    } catch (error) {
        console.error('❌ Failed to send low stock alert:', error.message);
    }
};
