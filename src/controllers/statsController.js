const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get dashboard statistics
// @route   GET /api/stats/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total orders
    const totalOrders = await Order.countDocuments();
    
    // Get orders by status for status distribution
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const statusDistribution = ordersByStatus.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    // Get total revenue (excluding cancelled orders)
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    // Get total products
    const totalProducts = await Product.countDocuments();
    
    // Get pending orders count
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    // Calculate order trend (percentage change from previous week)
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const currentWeekOrders = await Order.countDocuments({
      createdAt: { $gte: oneWeekAgo, $lte: today }
    });
    
    const previousWeekOrders = await Order.countDocuments({
      createdAt: { $gte: twoWeeksAgo, $lte: oneWeekAgo }
    });
    
    const ordersTrend = previousWeekOrders > 0 
      ? Math.round(((currentWeekOrders - previousWeekOrders) / previousWeekOrders) * 100) 
      : 0;
    
    // Calculate revenue trend
    const currentWeekRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: oneWeekAgo, $lte: today },
          status: { $ne: 'cancelled' } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const previousWeekRevenue = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: twoWeeksAgo, $lte: oneWeekAgo },
          status: { $ne: 'cancelled' } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const currentWeekRevenueTotal = currentWeekRevenue.length > 0 ? currentWeekRevenue[0].total : 0;
    const previousWeekRevenueTotal = previousWeekRevenue.length > 0 ? previousWeekRevenue[0].total : 0;
    
    const revenueTrend = previousWeekRevenueTotal > 0 
      ? Math.round(((currentWeekRevenueTotal - previousWeekRevenueTotal) / previousWeekRevenueTotal) * 100) 
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        totalProducts,
        pendingOrders,
        statusDistribution,
        ordersTrend,
        revenueTrend
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get detailed analytics data
// @route   GET /api/stats/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    // Parse date range from query params
    const { from, to } = req.query;
    const startDate = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = to ? new Date(to) : new Date();
    
    // Add one day to endDate to include the end date in results
    endDate.setDate(endDate.getDate() + 1);
    
    // For comparison, calculate the previous period of the same length
    const daysDiff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - daysDiff);
    const previousPeriodEnd = new Date(startDate);
    
    // Build date range query
    const dateQuery = {
      createdAt: { $gte: startDate, $lt: endDate }
    };
    
    const previousDateQuery = {
      createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
    };
    
    // Get order count for the period
    const orderCount = await Order.countDocuments(dateQuery);
    const previousOrderCount = await Order.countDocuments(previousDateQuery);
    
    // Calculate order growth percentage
    const orderGrowth = previousOrderCount > 0 
      ? Math.round(((orderCount - previousOrderCount) / previousOrderCount) * 100) 
      : 0;
    
    // Get total revenue (excluding cancelled orders)
    const revenueData = await Order.aggregate([
      { $match: { ...dateQuery, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const previousRevenueData = await Order.aggregate([
      { $match: { ...previousDateQuery, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    const previousTotalRevenue = previousRevenueData.length > 0 ? previousRevenueData[0].total : 0;
    
    // Calculate revenue growth percentage
    const revenueGrowth = previousTotalRevenue > 0 
      ? Math.round(((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100) 
      : 0;
    
    // Calculate average order value
    const averageOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;
    const previousAverageOrderValue = previousOrderCount > 0 ? Math.round(previousTotalRevenue / previousOrderCount) : 0;
    
    // Calculate AOV growth percentage
    const aovGrowth = previousAverageOrderValue > 0 
      ? Math.round(((averageOrderValue - previousAverageOrderValue) / previousAverageOrderValue) * 100) 
      : 0;
    
    // Calculate completion rate (percentage of orders completed)
    const completedOrders = await Order.countDocuments({ ...dateQuery, status: 'completed' });
    const completionRate = orderCount > 0 ? Math.round((completedOrders / orderCount) * 100) : 0;
    
    const previousCompletedOrders = await Order.countDocuments({ ...previousDateQuery, status: 'completed' });
    const previousCompletionRate = previousOrderCount > 0 ? Math.round((previousCompletedOrders / previousOrderCount) * 100) : 0;
    
    // Calculate completion rate growth
    const completionRateGrowth = previousCompletionRate > 0 
      ? Math.round(((completionRate - previousCompletionRate) / previousCompletionRate) * 100) 
      : 0;
    
    // Get daily revenue and orders
    const dailyData = await Order.aggregate([
      { $match: { ...dateQuery, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Find highest and lowest revenue days
    let highestRevenueDay = null;
    let lowestRevenueDay = null;
    
    if (dailyData.length > 0) {
      highestRevenueDay = dailyData.reduce((prev, current) => 
        (prev.revenue > current.revenue) ? prev : current
      );
      
      lowestRevenueDay = dailyData.reduce((prev, current) => 
        (prev.revenue < current.revenue) ? prev : current
      );
    }
    
    const dailyRevenue = {
      data: dailyData,
      highestDay: highestRevenueDay ? { date: highestRevenueDay._id, revenue: highestRevenueDay.revenue } : null,
      lowestDay: lowestRevenueDay ? { date: lowestRevenueDay._id, revenue: lowestRevenueDay.revenue } : null
    };
    
    // Get status distribution and calculate percentages
    const statusCounts = await Order.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Convert to object with status as keys
    const statusDistribution = {};
    statusCounts.forEach(status => {
      statusDistribution[status._id] = status.count;
      statusDistribution[`${status._id}Percentage`] = Math.round((status.count / orderCount) * 100);
    });
    
    // Top products by revenue
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
        orderCount,
        orderGrowth,
        totalRevenue,
        revenueGrowth,
        averageOrderValue,
        aovGrowth,
        completionRate,
        completionRateGrowth,
        dailyRevenue,
        statusDistribution,
        topProducts
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 