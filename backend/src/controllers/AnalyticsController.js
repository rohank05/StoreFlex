const Analytics = require('../models/Analytics');

class AnalyticsController {
  static async getDashboard(req, res) {
    try {
      const stats = await Analytics.getDashboardStats();
      const stockLevels = await Analytics.getStockLevels();
      const categoryDistribution = await Analytics.getCategoryDistribution();
      const topProducts = await Analytics.getTopProducts();

      res.json({
        success: true,
        data: {
          overview: stats,
          stockLevels,
          categoryDistribution,
          topProducts
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard data',
        error: error.message
      });
    }
  }

  static async getStockMovementTrends(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const trends = await Analytics.getStockMovementTrends(days);
      
      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Error fetching stock movement trends:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching stock movement trends',
        error: error.message
      });
    }
  }

  static async getImportStats(req, res) {
    try {
      const stats = await Analytics.getMonthlyImportStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching import statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching import statistics',
        error: error.message
      });
    }
  }
}

module.exports = AnalyticsController;