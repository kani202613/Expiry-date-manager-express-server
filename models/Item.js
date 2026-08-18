const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true
    },
    // Alias for backward compatibility
    name: {
      type: String,
      trim: true
    },
    upcCode: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      enum: ['Food', 'Medicine', 'Cosmetic', 'Grocery', 'Subscription', 'Utility', 'Other'],
      default: 'Food',
      trim: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      default: 'pcs',
      trim: true
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    purchaseDate: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'consumed', 'discarded'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save middleware to synchronize title and name
itemSchema.pre('save', function (next) {
  if (this.title && !this.name) {
    this.name = this.title;
  } else if (this.name && !this.title) {
    this.title = this.name;
  }
  next();
});

// Optimized Compound Indexes for Use-Cases
// Use-Case 1 & 4: Fast query & sort for user's active products by expiry date
itemSchema.index({ user: 1, status: 1, expiryDate: 1 });

// Use-Case 2 & 4: Fast lookup by UPC code per user
itemSchema.index({ user: 1, upcCode: 1 });

// Use-Case 4: Text index for title, UPC, and notes search
itemSchema.index({ title: 'text', name: 'text', upcCode: 'text', notes: 'text' });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
