const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { pool } = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

class ImportController {
  static async uploadFile(req, res) {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const fileExt = path.extname(fileName).toLowerCase();

        let data = [];
        
        if (fileExt === '.csv') {
          data = await ImportController.parseCSV(filePath);
        } else if (fileExt === '.xlsx' || fileExt === '.xls') {
          data = await ImportController.parseExcel(filePath);
        }

        const result = await ImportController.processImportData(data, fileName);
        
        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.json({
          success: true,
          message: 'File processed successfully',
          data: result
        });

      } catch (error) {
        console.error('Import error:', error);
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
          success: false,
          message: 'Error processing file',
          error: error.message
        });
      }
    });
  }

  static async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          data.push(row);
        })
        .on('end', () => {
          resolve(data);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  static async parseExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  }

  static async processImportData(data, fileName) {
    if (!data || data.length === 0) {
      throw new Error('No data found in file');
    }

    const client = await pool.connect();
    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    try {
      await client.query('BEGIN');

      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          
          // Map CSV/Excel columns to database fields
          const productData = {
            name: row.name || row.Name || row.product_name || row['Product Name'],
            description: row.description || row.Description || '',
            sku: row.sku || row.SKU || row.code || row.Code,
            category_id: await ImportController.getCategoryId(row.category || row.Category),
            supplier_id: await ImportController.getSupplierId(row.supplier || row.Supplier),
            unit_price: parseFloat(row.unit_price || row['Unit Price'] || row.price || row.Price || 0),
            cost_price: parseFloat(row.cost_price || row['Cost Price'] || row.cost || row.Cost || 0),
            quantity_in_stock: parseInt(row.quantity || row.Quantity || row.stock || row.Stock || 0),
            min_stock_level: parseInt(row.min_stock || row['Min Stock'] || row.minimum || row.Minimum || 0),
            max_stock_level: parseInt(row.max_stock || row['Max Stock'] || row.maximum || row.Maximum || 1000),
            barcode: row.barcode || row.Barcode || '',
            location: row.location || row.Location || '',
            status: (row.status || row.Status || 'active').toLowerCase()
          };

          // Validate required fields
          if (!productData.name || !productData.sku) {
            throw new Error(`Row ${i + 1}: Name and SKU are required`);
          }

          // Check if SKU already exists
          const existingProduct = await Product.getBySku(productData.sku);
          if (existingProduct) {
            // Update existing product
            await Product.update(existingProduct.id, productData);
          } else {
            // Create new product
            await Product.create(productData);
          }

          successCount++;
        } catch (error) {
          failureCount++;
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      // Log import result
      await client.query(`
        INSERT INTO import_logs (filename, total_rows, successful_rows, failed_rows, errors)
        VALUES ($1, $2, $3, $4, $5)
      `, [fileName, data.length, successCount, failureCount, JSON.stringify(errors)]);

      await client.query('COMMIT');

      return {
        totalRows: data.length,
        successfulRows: successCount,
        failedRows: failureCount,
        errors: errors.slice(0, 10) // Return only first 10 errors
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getCategoryId(categoryName) {
    if (!categoryName) return null;
    
    const result = await pool.query('SELECT id FROM categories WHERE name ILIKE $1', [categoryName]);
    if (result.rows.length > 0) {
      return result.rows[0].id;
    }
    
    // Create new category if it doesn't exist
    const newCategory = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id',
      [categoryName]
    );
    return newCategory.rows[0].id;
  }

  static async getSupplierId(supplierName) {
    if (!supplierName) return null;
    
    const result = await pool.query('SELECT id FROM suppliers WHERE name ILIKE $1', [supplierName]);
    if (result.rows.length > 0) {
      return result.rows[0].id;
    }
    
    // Create new supplier if it doesn't exist
    const newSupplier = await pool.query(
      'INSERT INTO suppliers (name) VALUES ($1) RETURNING id',
      [supplierName]
    );
    return newSupplier.rows[0].id;
  }

  static async getImportHistory(req, res) {
    try {
      const result = await pool.query(`
        SELECT * FROM import_logs 
        ORDER BY imported_at DESC 
        LIMIT 50
      `);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching import history:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching import history',
        error: error.message
      });
    }
  }

  static async downloadTemplate(req, res) {
    try {
      const templateData = [
        {
          name: 'Sample Product',
          description: 'This is a sample product description',
          sku: 'SAMPLE-001',
          category: 'Electronics',
          supplier: 'Sample Supplier',
          unit_price: '29.99',
          cost_price: '18.00',
          quantity: '100',
          min_stock: '10',
          max_stock: '500',
          barcode: '1234567890123',
          location: 'A1-B2',
          status: 'active'
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename=product_import_template.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);

    } catch (error) {
      console.error('Error generating template:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating template',
        error: error.message
      });
    }
  }
}

module.exports = ImportController;