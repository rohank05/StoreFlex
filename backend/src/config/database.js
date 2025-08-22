const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'storeflex',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database initialization
const initializeDB = async () => {
  const client = await pool.connect();
  try {
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sku VARCHAR(100) UNIQUE NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        supplier_id INTEGER REFERENCES suppliers(id),
        unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        quantity_in_stock INTEGER NOT NULL DEFAULT 0,
        min_stock_level INTEGER DEFAULT 0,
        max_stock_level INTEGER DEFAULT 1000,
        barcode VARCHAR(255),
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT')),
        quantity INTEGER NOT NULL,
        reference_number VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255) DEFAULT 'system'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS import_logs (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        total_rows INTEGER NOT NULL,
        successful_rows INTEGER NOT NULL,
        failed_rows INTEGER NOT NULL,
        errors TEXT,
        imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);
    `);

    // Insert sample data if tables are empty
    const categoryCount = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(categoryCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO categories (name, description) VALUES
        ('Electronics', 'Electronic devices and components'),
        ('Office Supplies', 'Office and stationery items'),
        ('Furniture', 'Office and home furniture'),
        ('Clothing', 'Apparel and accessories'),
        ('Food & Beverages', 'Food items and drinks');
      `);

      await client.query(`
        INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES
        ('TechCorp Solutions', 'John Smith', 'john@techcorp.com', '+1-555-0101', '123 Tech Street, Silicon Valley, CA'),
        ('Office Plus Ltd', 'Sarah Johnson', 'sarah@officeplus.com', '+1-555-0102', '456 Business Ave, New York, NY'),
        ('Global Furniture Inc', 'Mike Wilson', 'mike@globalfurniture.com', '+1-555-0103', '789 Design Blvd, Chicago, IL');
      `);

      await client.query(`
        INSERT INTO products (name, description, sku, category_id, supplier_id, unit_price, cost_price, quantity_in_stock, min_stock_level) VALUES
        ('Wireless Mouse', 'Ergonomic wireless optical mouse', 'TECH-MOUSE-001', 1, 1, 29.99, 18.00, 150, 20),
        ('Office Chair', 'Adjustable ergonomic office chair', 'FURN-CHAIR-001', 3, 3, 199.99, 120.00, 25, 5),
        ('Notebook A4', 'Professional notebook 200 pages', 'OFF-NOTE-001', 2, 2, 12.99, 7.50, 200, 50),
        ('USB Cable', 'High-speed USB-C cable 2m', 'TECH-CABLE-001', 1, 1, 15.99, 9.00, 300, 30),
        ('Desk Lamp', 'LED desk lamp with adjustable brightness', 'OFF-LAMP-001', 2, 2, 45.99, 28.00, 75, 10);
      `);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  initializeDB
};