const { pool } = require('../config/database');

class Analytics {
  static async getDashboardStats() {
    const client = await pool.connect();
    try {
      // Total products
      const totalProducts = await client.query('SELECT COUNT(*) FROM products WHERE status = $1', ['active']);
      
      // Total categories
      const totalCategories = await client.query('SELECT COUNT(*) FROM categories');
      
      // Total suppliers
      const totalSuppliers = await client.query('SELECT COUNT(*) FROM suppliers');
      
      // Low stock products count
      const lowStockProducts = await client.query(`
        SELECT COUNT(*) FROM products 
        WHERE quantity_in_stock <= min_stock_level AND status = 'active'
      `);
      
      // Total inventory value
      const inventoryValue = await client.query(`
        SELECT SUM(quantity_in_stock * unit_price) as total_value 
        FROM products WHERE status = 'active'
      `);
      
      // Recent stock movements (last 7 days)
      const recentMovements = await client.query(`
        SELECT COUNT(*) FROM stock_movements 
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      `);

      return {
        totalProducts: parseInt(totalProducts.rows[0].count),
        totalCategories: parseInt(totalCategories.rows[0].count),
        totalSuppliers: parseInt(totalSuppliers.rows[0].count),
        lowStockProducts: parseInt(lowStockProducts.rows[0].count),
        totalInventoryValue: parseFloat(inventoryValue.rows[0].total_value || 0),
        recentMovements: parseInt(recentMovements.rows[0].count)
      };
    } finally {
      client.release();
    }
  }

  static async getStockLevels() {
    const result = await pool.query(`
      SELECT 
        name,
        sku,
        quantity_in_stock,
        min_stock_level,
        max_stock_level,
        CASE 
          WHEN quantity_in_stock <= min_stock_level THEN 'Low'
          WHEN quantity_in_stock >= max_stock_level THEN 'High'
          ELSE 'Normal'
        END as stock_status
      FROM products 
      WHERE status = 'active'
      ORDER BY quantity_in_stock ASC
      LIMIT 20
    `);
    return result.rows;
  }

  static async getCategoryDistribution() {
    const result = await pool.query(`
      SELECT 
        c.name,
        COUNT(p.id) as product_count,
        SUM(p.quantity_in_stock * p.unit_price) as category_value
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id, c.name
      ORDER BY product_count DESC
    `);
    return result.rows;
  }

  static async getStockMovementTrends(days = 30) {
    const result = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        movement_type,
        COUNT(*) as movement_count,
        SUM(quantity) as total_quantity
      FROM stock_movements 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at), movement_type
      ORDER BY date DESC
    `);
    return result.rows;
  }

  static async getTopProducts(limit = 10) {
    const result = await pool.query(`
      SELECT 
        p.name,
        p.sku,
        p.quantity_in_stock,
        p.unit_price,
        (p.quantity_in_stock * p.unit_price) as total_value,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
      ORDER BY total_value DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  }

  static async getMonthlyImportStats() {
    const result = await pool.query(`
      SELECT 
        DATE_TRUNC('month', imported_at) as month,
        COUNT(*) as import_count,
        SUM(total_rows) as total_rows_imported,
        SUM(successful_rows) as successful_rows,
        SUM(failed_rows) as failed_rows
      FROM import_logs
      WHERE imported_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', imported_at)
      ORDER BY month DESC
    `);
    return result.rows;
  }
}

module.exports = Analytics;