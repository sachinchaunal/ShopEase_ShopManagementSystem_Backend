const express = require('express');
const statsController = require('../controllers/statsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get(
  '/dashboard',
  [authenticate, authorize('admin')],
  statsController.getDashboardStats
);

// @route   GET /api/stats/analytics
// @desc    Get detailed analytics data
// @access  Private/Admin
router.get(
  '/analytics',
  [authenticate, authorize('admin')],
  statsController.getAnalytics
);

module.exports = router; 