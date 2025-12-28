import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Address name is required'],
    trim: true,
    maxlength: [50, 'Address name cannot exceed 50 characters']
  },
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
    maxlength: [200, 'Street address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    maxlength: [20, 'Postal code cannot exceed 20 characters']
  },
  country: {
    type: String,
    default: 'Kenya',
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  instructions: {
    type: String,
    maxlength: [500, 'Delivery instructions cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Compound index to ensure only one default address per user
addressSchema.index({ user: 1, isDefault: 1 }, { 
  partialFilterExpression: { isDefault: true } 
});

// Pre-save middleware to handle default address
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const Address = mongoose.model('Address', addressSchema);

export default Address;