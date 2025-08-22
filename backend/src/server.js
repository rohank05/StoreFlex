const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { initializeDB } = require('./config/database');

// Import routes
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const analyticsRoutes = require('./routes/analytics');
const importRoutes = require('./routes/import');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'StoreFlex API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/import', importRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'StoreFlex Inventory Management API',
    version: '1.0.0',
    endpoints: {
      products: {
        'GET /api/products': 'Get all products with optional filters',
        'GET /api/products/:id': 'Get single product',
        'POST /api/products': 'Create new product',
        'PUT /api/products/:id': 'Update product',
        'DELETE /api/products/:id': 'Delete product',
        'PUT /api/products/:id/stock': 'Update product stock',
        'GET /api/products/low-stock': 'Get low stock products'
      },
      categories: {
        'GET /api/categories': 'Get all categories',
        'GET /api/categories/:id': 'Get single category',
        'POST /api/categories': 'Create new category',
        'PUT /api/categories/:id': 'Update category',
        'DELETE /api/categories/:id': 'Delete category'
      },
      analytics: {
        'GET /api/analytics/dashboard': 'Get dashboard statistics',
        'GET /api/analytics/stock-trends': 'Get stock movement trends',
        'GET /api/analytics/import-stats': 'Get import statistics'
      },
      import: {
        'POST /api/import/upload': 'Upload and process CSV/Excel file',
        'GET /api/import/history': 'Get import history',
        'GET /api/import/template': 'Download import template'
      }
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      'GET /health',
      'GET /api',
      'GET /api/products',
      'GET /api/categories',
      'GET /api/analytics/dashboard',
      'POST /api/import/upload'
    ]
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDB();
    console.log('✅ Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`🚀 StoreFlex API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();

module.exports = app;