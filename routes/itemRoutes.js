const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getItems,
  getItemStats,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

// All item routes require JWT authentication
router.use(protect);

/**
 * @swagger
 * /api/items/stats/summary:
 *   get:
 *     summary: Get dashboard item statistics summary
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary stats of active, expiring soon, and expired items
 */
router.get('/stats/summary', getItemStats);

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Retrieve user's items with filtering and search
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: filterType
 *         schema:
 *           type: string
 *           enum: [expiringSoon, expired, all]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of items
 *   post:
 *     summary: Add a new item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - expiryDate
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item created
 */
router.route('/')
  .get(getItems)
  .post(createItem);

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get single item details
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 */
router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;
