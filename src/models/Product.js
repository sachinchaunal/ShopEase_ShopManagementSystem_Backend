const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  imageId: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: [true, 'Product category is required']
  },
  inStock: {
    type: Boolean,
    default: true
  },
  unit: {
    type: String,
    required: [true, 'Unit of measurement is required'],
    enum: ['kg', 'gm', 'liter', 'ml', 'piece', 'dozen', 'packet']
  },
  maxQuantity: {
    type: Number,
    required: [true, 'Maximum quantity is required'],
    min: [1, 'Max quantity must be at least 1']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema); 