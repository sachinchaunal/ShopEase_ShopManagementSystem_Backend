const { validationResult } = require('express-validator');
const { setCustomerSessionCookie, verifyCustomerToken, clearCustomerSessionCookie } = require('../utils/sessionUtils');

// @desc    Create customer session
// @route   POST /api/customer/session
// @access  Public
exports.createSession = (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { customerName } = req.body;
    
    // Set customer session cookie
    const token = setCustomerSessionCookie(res, customerName);
    
    res.status(200).json({
      success: true,
      data: {
        customerName,
        token
      }
    });
  } catch (error) {
    console.error('Create customer session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current customer session
// @route   GET /api/customer/session
// @access  Public
exports.getSession = (req, res) => {
  try {
    const token = req.cookies.customerSession;
    
    if (!token) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }
    
    const { valid, customerName, error } = verifyCustomerToken(token);
    
    if (!valid) {
      // Clear invalid cookie
      clearCustomerSessionCookie(res);
      
      return res.status(200).json({
        success: true,
        data: null
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        customerName
      }
    });
  } catch (error) {
    console.error('Get customer session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Clear customer session
// @route   DELETE /api/customer/session
// @access  Public
exports.clearSession = (req, res) => {
  try {
    // Clear customer session cookie
    clearCustomerSessionCookie(res);
    
    res.status(200).json({
      success: true,
      message: 'Customer session cleared'
    });
  } catch (error) {
    console.error('Clear customer session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 