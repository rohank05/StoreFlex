const express = require('express');
const ProductController = require('../controllers/ProductController');

const router = express.Router();

// GET /api/products - Get all products with optional filters
router.get('/', ProductController.getAll);

// GET /api/products/low-stock - Get low stock products
router.get('/low-stock', ProductController.getLowStock);

// GET /api/products/:id - Get single product
router.get('/:id', ProductController.getById);

// POST /api/products - Create new product
router.post('/', ProductController.create);

// PUT /api/products/:id - Update product
router.put('/:id', ProductController.update);

// DELETE /api/products/:id - Delete product
router.delete('/:id', ProductController.delete);

// PUT /api/products/:id/stock - Update product stock
router.put('/:id/stock', ProductController.updateStock);

module.exports = router;