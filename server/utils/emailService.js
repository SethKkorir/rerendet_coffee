// utils/emailService.js
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configure email transport
 */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Send an email using a template
 */
export const sendEmail = async (options) => {
    try {
        const { to, subject, templateName, data } = options;

        // Load and compile template
        const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);
        const html = template(data);

        // Email options
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Rerendet Coffee'}" <${process.env.EMAIL_FROM || 'orders@rerendetcoffee.com'}>`,
            to,
            subject,
            html
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Email sending error:', error);
        // Don't throw error to avoid breaking the main process (e.g., order creation)
        // but log it for debugging
        return null;
    }
};
