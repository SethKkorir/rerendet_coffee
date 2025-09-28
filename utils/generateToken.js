// utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// For response with cookie (if you want to use cookies)
const generateTokenResponse = (res, userId) => {
  const token = generateToken(userId);

  // Set cookie (optional)
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

export { generateToken, generateTokenResponse };