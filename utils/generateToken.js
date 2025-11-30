import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const generateToken = (userId) => {
  // Check if JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not set in environment variables');
    console.error('Available env vars:', Object.keys(process.env));
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const token = jwt.sign(
      { id: userId }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      }
    );
    
    console.log('✅ Token generated successfully for user:', userId);
    return token;
  } catch (error) {
    console.error('❌ Token generation failed:', error.message);
    throw new Error('Failed to generate authentication token');
  }
};

export default generateToken;