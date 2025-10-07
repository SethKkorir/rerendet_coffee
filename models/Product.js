import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  images: [{
    public_id: String,
    url: String
  }],
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['coffee-beans', 'brewing-equipment', 'accessories', 'merchandise']
  },
  subcategory: String,
  brand: String,
  roastLevel: {
    type: String,
    enum: ['light', 'medium', 'dark', 'espresso']
  },
  origin: String,
  flavorNotes: [String],
  weight: {
    value: Number,
    unit: { type: String, default: 'g' }
  },
  inventory: {
    stock: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 10 }
  },
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  seo: {
    title: String,
    description: String,
    slug: String
  }
}, {
  timestamps: true
});

// Create text index for search
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  flavorNotes: 'text',
  tags: 'text'
});

const Product = mongoose.model('Product', productSchema);

export default Product;