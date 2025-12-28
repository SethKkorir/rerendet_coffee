import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const saveShippingInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.shippingInfo = req.body;
  await user.save();
  res.json({ success: true, shippingInfo: user.shippingInfo });
});

export { saveShippingInfo };
