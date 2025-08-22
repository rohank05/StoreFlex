const express = require('express');
const AnalyticsController = require('../controllers/AnalyticsController');

const router = express.Router();

// GET /api/analytics/dashboard - Get dashboard statistics
router.get('/dashboard', AnalyticsController.getDashboard);

// GET /api/analytics/stock-trends - Get stock movement trends
router.get('/stock-trends', AnalyticsController.getStockMovementTrends);

// GET /api/analytics/import-stats - Get import statistics
router.get('/import-stats', AnalyticsController.getImportStats);

module.exports = router;