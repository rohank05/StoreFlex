const { pool } = require('../config/database');

class Category {
  static async getAll() {
    const result = await pool.query(`
      SELECT c.*, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id 
      GROUP BY c.id 
      ORDER BY c.name
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(categoryData) {
    const { name, description } = categoryData;
    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return result.rows[0];
  }

  static async update(id, categoryData) {
    const { name, description } = categoryData;
    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = Category;