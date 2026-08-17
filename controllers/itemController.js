const Item = require('../models/Item');

// @desc    Get all items for current user with search, filter, & sort
// @route   GET /api/items
// @access  Private
const getItems = async (req, res, next) => {
  try {
    const { category, status, search, filterType, sortBy, order } = req.query;

    const query = { user: req.user._id };

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Status filter
    if (status) {
      query.status = status;
    } else {
      query.status = 'active'; // Default to active items
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Date filters (expiringSoon vs expired)
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    if (filterType === 'expiringSoon') {
      query.expiryDate = { $gte: now, $lte: sevenDaysFromNow };
    } else if (filterType === 'expired') {
      query.expiryDate = { $lt: now };
    }

    // Sorting
    const sortField = sortBy || 'expiryDate';
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortField] = sortOrder;

    const items = await Item.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard item statistics summary
// @route   GET /api/items/stats/summary
// @access  Private
const getItemStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const totalActive = await Item.countDocuments({ user: userId, status: 'active' });
    const expiringSoon = await Item.countDocuments({
      user: userId,
      status: 'active',
      expiryDate: { $gte: now, $lte: sevenDaysFromNow }
    });
    const expired = await Item.countDocuments({
      user: userId,
      status: 'active',
      expiryDate: { $lt: now }
    });
    const consumed = await Item.countDocuments({ user: userId, status: 'consumed' });

    res.status(200).json({
      success: true,
      data: {
        totalActive,
        expiringSoon,
        expired,
        consumed
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Private
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user._id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res, next) => {
  try {
    const { name, category, quantity, unit, expiryDate, purchaseDate, notes } = req.body;

    if (!name || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Item name and expiry date are required fields'
      });
    }

    const item = await Item.create({
      user: req.user._id,
      name,
      category: category || 'Food',
      quantity: quantity || 1,
      unit: unit || 'pcs',
      expiryDate,
      purchaseDate: purchaseDate || null,
      notes: notes || '',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findOne({ _id: req.params.id, user: req.user._id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or not authorized'
      });
    }

    const allowedUpdates = [
      'name',
      'category',
      'quantity',
      'unit',
      'expiryDate',
      'purchaseDate',
      'notes',
      'status'
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    const updatedItem = await item.save();

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or not authorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemStats,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
