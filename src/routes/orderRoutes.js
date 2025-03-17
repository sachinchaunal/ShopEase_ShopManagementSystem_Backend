const express = require('express');
const { check } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { requireCustomerSession } = require('../middleware/customer');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public (with customer session)
router.post(
  '/',
  [
    requireCustomerSession,
    check('items', 'Items are required').isArray({ min: 1 }),
    check('items.*.product', 'Product ID is required').not().isEmpty(),
    check('items.*.quantity', 'Quantity must be a positive number').isFloat({ min: 0.1 }),
    check('phone', 'Phone number is required').not().isEmpty()
  ],
  orderController.createOrder
);

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
router.get('/', authenticate, orderController.getOrders);

// @route   GET /api/orders/analytics
// @desc    Get order analytics
// @access  Private/Admin
router.get(
  '/analytics',
  [authenticate, authorize('admin')],
  orderController.getOrderAnalytics
);

// @route   GET /api/orders/public/:id
// @desc    Get order by ID (public access for order confirmation)
// @access  Public
router.get('/public/:id', orderController.getPublicOrderById);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', authenticate, orderController.getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put(
  '/:id/status',
  [
    authenticate,
    check('status', 'Status is required').isIn(['pending', 'preparing', 'ready', 'completed', 'cancelled'])
  ],
  orderController.updateOrderStatus
);

module.exports = router; 