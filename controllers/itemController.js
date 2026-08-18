const Item = require('../models/Item');

// @desc    Get paginated items for current user with search, filter, & sort
// @route   GET /api/items
// @access  Private
const getItems = async (req, res, next) => {
  try {
    const {
      category,
      status,
      search,
      upcCode,
      filterType,
      expiryRange,
      sortBy,
      order,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const query = { user: req.user._id };

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Status filter
    if (status) {
      query.status = status;
    } else {
      query.status = 'active'; // Default to active products
    }

    // UPC Code exact filter
    if (upcCode) {
      query.upcCode = upcCode;
    }

    // Search filter by title, name, upcCode, or notes
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { name: searchRegex },
        { upcCode: searchRegex },
        { notes: searchRegex }
      ];
    }

    // Expiry date range filters (Use-Case 1 & 4)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const range = expiryRange || filterType;

    if (range === '1month' || range === 'within1Month') {
      const oneMonthLater = new Date(startOfToday);
      oneMonthLater.setMonth(startOfToday.getMonth() + 1);
      oneMonthLater.setHours(23, 59, 59, 999);
      query.expiryDate = { $gte: startOfToday, $lte: oneMonthLater };
    } else if (range === '3months' || range === 'within3Months') {
      const threeMonthsLater = new Date(startOfToday);
      threeMonthsLater.setMonth(startOfToday.getMonth() + 3);
      threeMonthsLater.setHours(23, 59, 59, 999);
      query.expiryDate = { $gte: startOfToday, $lte: threeMonthsLater };
    } else if (range === '7days' || range === 'expiringSoon') {
      const sevenDaysLater = new Date(startOfToday);
      sevenDaysLater.setDate(startOfToday.getDate() + 7);
      sevenDaysLater.setHours(23, 59, 59, 999);
      query.expiryDate = { $gte: startOfToday, $lte: sevenDaysLater };
    } else if (range === 'expired') {
      query.expiryDate = { $lt: startOfToday };
    }

    // Sorting (Default: products nearing expiry first)
    const sortField = sortBy || 'expiryDate';
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortField] = sortOrder;

    // Total count for pagination metadata
    const totalItems = await Item.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    // Execute paginated query
    const items = await Item.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: items.length,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNum,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const sevenDaysLater = new Date(startOfToday);
    sevenDaysLater.setDate(startOfToday.getDate() + 7);
    sevenDaysLater.setHours(23, 59, 59, 999);

    const oneMonthLater = new Date(startOfToday);
    oneMonthLater.setMonth(startOfToday.getMonth() + 1);
    oneMonthLater.setHours(23, 59, 59, 999);

    const threeMonthsLater = new Date(startOfToday);
    threeMonthsLater.setMonth(startOfToday.getMonth() + 3);
    threeMonthsLater.setHours(23, 59, 59, 999);

    const totalActive = await Item.countDocuments({ user: userId, status: 'active' });
    
    const expiringSoon = await Item.countDocuments({
      user: userId,
      status: 'active',
      expiryDate: { $gte: startOfToday, $lte: sevenDaysLater }
    });

    const expiringWithin1Month = await Item.countDocuments({
      user: userId,
      status: 'active',
      expiryDate: { $gte: startOfToday, $lte: oneMonthLater }
    });

    const expiringWithin3Months = await Item.countDocuments({
      user: userId,
      status: 'active',
      expiryDate: { $gte: startOfToday, $lte: threeMonthsLater }
    });

    const expired = await Item.countDocuments({
      user: userId,
      status: 'active',
      expiryDate: { $lt: startOfToday }
    });

    const consumed = await Item.countDocuments({ user: userId, status: 'consumed' });

    res.status(200).json({
      success: true,
      data: {
        totalActive,
        expiringSoon,
        expiringWithin1Month,
        expiringWithin3Months,
        expired,
        consumed
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item by ID or UPC code
// @route   GET /api/items/:id
// @access  Private
const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let item;
    // Check if valid ObjectId or query by upcCode
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Item.findOne({ _id: id, user: req.user._id });
    } else {
      item = await Item.findOne({ upcCode: id, user: req.user._id });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
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

// @desc    Create new item (with title, upcCode, amount/quantity, expiryDate)
// @route   POST /api/items
// @access  Private
const createItem = async (req, res, next) => {
  try {
    const { title, name, upcCode, category, quantity, unit, expiryDate, purchaseDate, notes } = req.body;

    const productTitle = title || name;

    if (!productTitle || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Product title and expiry date are required fields'
      });
    }

    const item = await Item.create({
      user: req.user._id,
      title: productTitle,
      name: productTitle,
      upcCode: upcCode || '',
      category: category || 'Food',
      quantity: quantity !== undefined ? quantity : 1,
      unit: unit || 'pcs',
      expiryDate,
      purchaseDate: purchaseDate || null,
      notes: notes || '',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
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
        message: 'Product not found or not authorized'
      });
    }

    const allowedUpdates = [
      'title',
      'name',
      'upcCode',
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

    if (req.body.title && !req.body.name) item.name = req.body.title;
    if (req.body.name && !req.body.title) item.title = req.body.name;

    const updatedItem = await item.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
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
        message: 'Product not found or not authorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
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
