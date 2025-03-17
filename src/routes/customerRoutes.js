const express = require('express');
const { check } = require('express-validator');
const customerController = require('../controllers/customerController');

const router = express.Router();

// @route   POST /api/customer/session
// @desc    Create customer session
// @access  Public
router.post(
  '/session',
  [
    check('customerName', 'Customer name is required').not().isEmpty()
  ],
  customerController.createSession
);

// @route   GET /api/customer/session
// @desc    Get current customer session
// @access  Public
router.get('/session', customerController.getSession);

// @route   DELETE /api/customer/session
// @desc    Clear customer session
// @access  Public
router.delete('/session', customerController.clearSession);

module.exports = router; 