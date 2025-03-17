const Order = require('../models/Order');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public (with customer session)
exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { items, phone, email, subtotal, total } = req.body;
    const customerName = req.customerName; // Get from session middleware

    // Validate phone number
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Calculate total amount and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      // Find product to verify it exists and get current price
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      // Check if product is in stock
      if (!product.inStock) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is out of stock`
        });
      }

      // Check if quantity is valid
      if (item.quantity <= 0 || item.quantity > product.maxQuantity) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}. Maximum allowed: ${product.maxQuantity}`
        });
      }

      // Add to order items
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
        image: product.image
      });

      // Add to total amount
      totalAmount += product.price * item.quantity;
    }

    // Generate a unique order number
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');
    
    // Find the highest order number for today
    const latestOrder = await Order.findOne({
      orderNumber: new RegExp(`^ORD-${dateStr}`)
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (latestOrder) {
      const latestSequence = parseInt(latestOrder.orderNumber.split('-')[2]);
      sequence = latestSequence + 1;
    }
    
    const orderNumber = `ORD-${dateStr}-${sequence.toString().padStart(4, '0')}`;

    // Create order
    const order = await Order.create({
      customerName,
      phone,
      email: email || '',
      items: orderItems,
      totalAmount: total || totalAmount,
      status: 'pending',
      orderNumber
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error1',
      error: error.message
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const { status, sort, limit = 20, page = 1 } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Count total orders matching query
    const total = await Order.countDocuments(query);
    
    // Build sort options
    let sortOptions = {};
    if (sort) {
      // Check if sort parameter uses prefix format (e.g. -createdAt for descending)
      if (sort.startsWith('-')) {
        const field = sort.substring(1); // Remove the '-' prefix
        sortOptions[field] = -1; // -1 means descending order
      } else {
        // Check if using colon format (field:order)
        if (sort.includes(':')) {
          const [field, order] = sort.split(':');
          sortOptions[field] = order === 'desc' ? -1 : 1;
        } else {
          // Just a field name, default to ascending
          sortOptions[sort] = 1;
        }
      }
    } else {
      // Default sort by createdAt desc (newest first)
      sortOptions = { createdAt: -1 };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get orders
    const orders = await Order.find(query)
      .populate({
        path: 'items.product',
        model: 'Product',
        select: 'name image unit'
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error2',
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items.product',
        model: 'Product'
      });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error3',
      error: error.message
    });
  }
};

// @desc    Get order by ID (public access for order confirmation)
// @route   GET /api/orders/public/:id
// @access  Public
exports.getPublicOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items.product',
        model: 'Product'
      });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get public order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Find order
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update status
    order.status = status;
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error4',
      error: error.message
    });
  }
};

// @desc    Get order analytics
// @route   GET /api/orders/analytics
// @access  Private/Admin
exports.getOrderAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date range query
    const dateQuery = {};
    if (startDate) {
      dateQuery.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate) {
      if (dateQuery.createdAt) {
        dateQuery.createdAt.$lte = new Date(endDate);
      } else {
        dateQuery.createdAt = { $lte: new Date(endDate) };
      }
    }
    
    // Get total orders
    const totalOrders = await Order.countDocuments(dateQuery);
    
    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get total revenue
    const revenueData = await Order.aggregate([
      { $match: { ...dateQuery, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    // Get daily orders and revenue (for charts)
    const dailyData = await Order.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get top selling products
    const topProducts = await Order.aggregate([
      { $match: { ...dateQuery, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        ordersByStatus: ordersByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        totalRevenue,
        dailyData,
        topProducts
      }
    });
  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error5',
      error: error.message
    });
  }
}; 