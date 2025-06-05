// backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    // Get token from cookies (assuming you're using cookie-parser middleware)
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Decode and verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and validate token is still valid
    const user = await User.findOne({ _id: decoded.id, 'tokens.token': token }).select('-password -tokens');
    if (!user) {
      return res.status(401).json({ message: 'Token invalid or expired' });
    }

    // Attach user and token to request object
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export default auth;
