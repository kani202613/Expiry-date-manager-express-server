/**
 * Controller for managing items and expiry dates
 */

// @desc    Get all items
// @route   GET /api/items
// @access  Public
const getItems = (req, res) => {
  res.status(200).json({
    success: true,
    data: [],
    message: 'Fetch items list placeholder'
  });
};

// @desc    Create new item
// @route   POST /api/items
// @access  Public
const createItem = (req, res) => {
  const { name, expiryDate } = req.body;
  res.status(201).json({
    success: true,
    data: { name, expiryDate },
    message: 'Item created placeholder'
  });
};

module.exports = {
  getItems,
  createItem
};
