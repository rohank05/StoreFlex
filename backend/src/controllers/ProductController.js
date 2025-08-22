const Product = require('../models/Product');
const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().allow('').max(1000),
  sku: Joi.string().required().min(1).max(100),
  category_id: Joi.number().integer().positive().allow(null),
  supplier_id: Joi.number().integer().positive().allow(null),
  unit_price: Joi.number().precision(2).min(0).default(0),
  cost_price: Joi.number().precision(2).min(0).default(0),
  quantity_in_stock: Joi.number().integer().min(0).default(0),
  min_stock_level: Joi.number().integer().min(0).default(0),
  max_stock_level: Joi.number().integer().min(0).default(1000),
  barcode: Joi.string().allow('').max(255),
  location: Joi.string().allow('').max(255),
  status: Joi.string().valid('active', 'inactive').default('active')
});

const stockUpdateSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
  movement_type: Joi.string().valid('IN', 'OUT', 'ADJUSTMENT').required(),
  notes: Joi.string().allow('').max(500)
});

class ProductController {
  static async getAll(req, res) {
    try {
      const filters = {
        category_id: req.query.category_id,
        supplier_id: req.query.supplier_id,
        status: req.query.status,
        search: req.query.search
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      );

      const products = await Product.getAll(filters);
      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.getById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const { error, value } = productSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Check if SKU already exists
      const existingProduct = await Product.getBySku(value.sku);
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }

      const product = await Product.create(value);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = productSchema.validate(req.body, { allowUnknown: true });
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Check if SKU already exists for another product
      if (value.sku) {
        const existingProduct = await Product.getBySku(value.sku);
        if (existingProduct && existingProduct.id !== parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Product with this SKU already exists'
          });
        }
      }

      const product = await Product.update(id, value);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.delete(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully',
        data: product
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message
      });
    }
  }

  static async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = stockUpdateSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const { quantity, movement_type, notes } = value;
      const product = await Product.updateStock(id, quantity, movement_type, notes);

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error updating stock',
        error: error.message
      });
    }
  }

  static async getLowStock(req, res) {
    try {
      const products = await Product.getLowStockProducts();
      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching low stock products',
        error: error.message
      });
    }
  }
}

module.exports = ProductController;