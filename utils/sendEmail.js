// utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    console.log('📧 Attempting to send email to:', options.email);

    // FIXED: Use nodemailer.createTransport (not createTransporter)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ Gmail SMTP connected successfully');

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Rerendet Coffee" <noreply@rerendetcoffee.com>',
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ REAL EMAIL SENT SUCCESSFULLY!');
    console.log('📧 Message ID:', info.messageId);
    
    return info;

  } catch (error) {
    console.error('❌ EMAIL FAILED:', error.message);
    
    // Fallback: Log the code to console
    const codeMatch = options.html.match(/>(\d{6})</);
    if (codeMatch) {
      console.log('🔢 FALLBACK CODE:', codeMatch[1]);
    }
    
    throw error;
  }
};

export default sendEmail;