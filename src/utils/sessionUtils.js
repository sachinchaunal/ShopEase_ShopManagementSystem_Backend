const jwt = require('jsonwebtoken');

// Generate a customer session token
exports.generateCustomerToken = (customerName) => {
  return jwt.sign(
    { customerName },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 days
  );
};

// Verify customer session token
exports.verifyCustomerToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, customerName: decoded.customerName };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Set customer session cookie
exports.setCustomerSessionCookie = (res, customerName) => {
  const token = exports.generateCustomerToken(customerName);
  
  res.cookie('customerSession', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  return token;
};

// Clear customer session cookie
exports.clearCustomerSessionCookie = (res) => {
  res.cookie('customerSession', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}; 