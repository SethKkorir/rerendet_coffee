// controllers/settingsController.js - COMPLETE IMPLEMENTATION
import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings.js';

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
  try {
    console.log('🔧 Fetching settings...');

    const settings = await Settings.getSettings();

    console.log('✅ Settings fetched successfully');

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  try {
    console.log('🔧 Updating settings...', req.body);

    const settings = await Settings.getSettings();

    // Update settings with new data
    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { $set: req.body },
      {
        new: true,
        runValidators: true,
        upsert: true
      }
    );

    console.log('✅ Settings updated successfully');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    console.error('❌ Update settings error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Upload logo
// @route   POST /api/admin/upload/logo
// @access  Private/Admin
const uploadLogo = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file uploaded'
      });
    }

    console.log('📸 Logo uploaded:', req.file);

    // In a real application, you'd upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll return the file path
    const logoUrl = `/uploads/${req.file.filename}`;

    // Update settings with new logo
    const settings = await Settings.getSettings();
    settings.store.logo = logoUrl;
    await settings.save();

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { url: logoUrl }
    });
  } catch (error) {
    console.error('❌ Logo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get public settings
// @route   GET /api/settings/public
// @access  Public
const getPublicSettings = asyncHandler(async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    // Return only public information
    const publicSettings = {
      store: settings.store,
      businessHours: settings.businessHours,
      payment: {
        currency: settings.payment.currency,
        currencySymbol: settings.payment.currencySymbol,
        freeShippingThreshold: settings.payment.freeShippingThreshold,
        shippingPrice: settings.payment.shippingPrice,
        paymentMethods: settings.payment.paymentMethods
      },
      seo: settings.seo,
      maintenance: settings.maintenance
    };

    res.json({
      success: true,
      data: publicSettings
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

export {
  getSettings,
  updateSettings,
  uploadLogo,
  getPublicSettings
};