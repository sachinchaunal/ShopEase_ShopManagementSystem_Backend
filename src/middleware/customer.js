const { verifyCustomerToken } = require('../utils/sessionUtils');

// Middleware to check if customer session exists
exports.checkCustomerSession = (req, res, next) => {
  try {
    const token = req.cookies.customerSession;
    
    if (!token) {
      // No session, but continue (not required)
      req.customerName = null;
      return next();
    }
    
    const { valid, customerName } = verifyCustomerToken(token);
    
    if (!valid) {
      // Invalid session, but continue (not required)
      req.customerName = null;
      return next();
    }
    
    // Valid session
    req.customerName = customerName;
    next();
  } catch (error) {
    console.error('Check customer session error:', error);
    // Continue even if there's an error
    req.customerName = null;
    next();
  }
};

// Middleware to require customer session
exports.requireCustomerSession = (req, res, next) => {
  try {
    const token = req.cookies.customerSession;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Customer session required. Please enter your name.'
      });
    }
    
    const { valid, customerName } = verifyCustomerToken(token);
    
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid customer session. Please enter your name again.'
      });
    }
    
    // Valid session
    req.customerName = customerName;
    next();
  } catch (error) {
    console.error('Require customer session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 