const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true
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
      min: [1, 'Quantity must be at least 1']
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
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster user queries and expiry sorting
itemSchema.index({ user: 1, expiryDate: 1 });
itemSchema.index({ user: 1, category: 1 });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;

