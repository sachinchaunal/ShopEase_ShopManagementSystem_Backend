const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.1, 'Quantity must be at least 0.1']
  },
  unit: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
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

// Pre-save hook to generate a unique order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate order number format: ORD-YYYYMMDD-XXXX (where X is a sequential number)
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');
    
    // Find the highest order number for today
    const latestOrder = await this.constructor.findOne({
      orderNumber: new RegExp(`^ORD-${dateStr}`)
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (latestOrder) {
      const latestSequence = parseInt(latestOrder.orderNumber.split('-')[2]);
      sequence = latestSequence + 1;
    }
    
    this.orderNumber = `ORD-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema); 