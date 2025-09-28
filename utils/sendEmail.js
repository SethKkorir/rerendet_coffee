// utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    console.log('📧 Attempting to send email to:', options.email);
    
    // For development/testing, use Ethereal.email (fake SMTP service)
    if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_USERNAME) {
      console.log('🔧 DEVELOPMENT MODE: Using Ethereal.email for testing');
      
      // Create a test account automatically
      let testAccount;
      try {
        testAccount = await nodemailer.createTestAccount();
        console.log('✅ Ethereal test account created');
      } catch (error) {
        console.log('⚠️ Could not create Ethereal account, using mock email');
        // Simulate email sending
        console.log('📧 MOCK EMAIL: Would send to', options.email);
        console.log('📧 Subject:', options.subject);
        console.log('📧 Verification code would be in the email');
        return { messageId: 'mock-' + Date.now() };
      }

      const transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const mailOptions = {
        from: '"Rerendet Coffee" <noreply@rerendetcoffee.com>',
        to: options.email,
        subject: options.subject,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
      console.log('🔑 Ethereal credentials for testing:');
      console.log('   Email:', testAccount.user);
      console.log('   Password:', testAccount.pass);
      
      return info;
    }

    // For production with real email
    const transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Rerendet Coffee" <noreply@rerendetcoffee.com>',
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // For development, simulate success even if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Development mode: Simulating email success');
      return { messageId: 'simulated-' + Date.now() };
    }
    
    throw new Error('Email could not be sent: ' + error.message);
  }
};

export default sendEmail;