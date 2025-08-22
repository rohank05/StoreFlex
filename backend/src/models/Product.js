const { pool } = require('../config/database');

class Product {
  static async getAll(filters = {}) {
    let query = `
      SELECT p.*, c.name as category_name, s.name as supplier_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.category_id) {
      query += ` AND p.category_id = $${paramCount}`;
      values.push(filters.category_id);
      paramCount++;
    }

    if (filters.supplier_id) {
      query += ` AND p.supplier_id = $${paramCount}`;
      values.push(filters.supplier_id);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND p.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, s.name as supplier_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN suppliers s ON p.supplier_id = s.id 
      WHERE p.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getBySku(sku) {
    const result = await pool.query('SELECT * FROM products WHERE sku = $1', [sku]);
    return result.rows[0];
  }

  static async create(productData) {
    const {
      name, description, sku, category_id, supplier_id,
      unit_price, cost_price, quantity_in_stock, min_stock_level,
      max_stock_level, barcode, location, status
    } = productData;

    const result = await pool.query(`
      INSERT INTO products (
        name, description, sku, category_id, supplier_id,
        unit_price, cost_price, quantity_in_stock, min_stock_level,
        max_stock_level, barcode, location, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      name, description, sku, category_id, supplier_id,
      unit_price, cost_price, quantity_in_stock, min_stock_level,
      max_stock_level, barcode, location, status || 'active'
    ]);

    return result.rows[0];
  }

  static async update(id, productData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(productData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE products 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async updateStock(id, quantity, movementType, notes = '') {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current product
      const productResult = await client.query('SELECT * FROM products WHERE id = $1', [id]);
      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }

      const product = productResult.rows[0];
      let newQuantity = product.quantity_in_stock;

      // Calculate new quantity based on movement type
      switch (movementType) {
        case 'IN':
          newQuantity += quantity;
          break;
        case 'OUT':
          newQuantity -= quantity;
          if (newQuantity < 0) {
            throw new Error('Insufficient stock');
          }
          break;
        case 'ADJUSTMENT':
          newQuantity = quantity;
          break;
        default:
          throw new Error('Invalid movement type');
      }

      // Update product stock
      await client.query(
        'UPDATE products SET quantity_in_stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQuantity, id]
      );

      // Record stock movement
      await client.query(`
        INSERT INTO stock_movements (product_id, movement_type, quantity, notes)
        VALUES ($1, $2, $3, $4)
      `, [id, movementType, quantity, notes]);

      await client.query('COMMIT');
      return await this.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getLowStockProducts() {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.quantity_in_stock <= p.min_stock_level 
      AND p.status = 'active'
      ORDER BY p.quantity_in_stock ASC
    `);
    return result.rows;
  }
}

module.exports = Product;