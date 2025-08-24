import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { authMiddleware, AuthRequest } from '@/middleware/authMiddleware';
import { TenantRequest } from '@/middleware/tenantMiddleware';
import { prisma } from '@/server';
import { Prisma } from '@prisma/client';

const router = Router();

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  unitOfMeasure: z.string().default('pcs'),
  costPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0),
  minStockLevel: z.number().int().min(0).default(0),
  maxStockLevel: z.number().int().min(0).optional(),
  reorderPoint: z.number().int().min(0).default(0),
  weight: z.number().min(0).optional(),
  dimensions: z.object({}).optional(),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isTrackable: z.boolean().default(true),
});

// Get all products
router.get('/', authMiddleware, asyncHandler(async (req: TenantRequest, res) => {
  const tenant = req.tenant;
  if (!tenant) {
    throw new CustomError('Tenant information required', 400);
  }

  const { page = '1', limit = '10', search, category, status } = req.query as any;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    // Build the query conditions
    let whereConditions = '';
    const queryParams: any[] = [tenant.schemaName];
    let paramIndex = 2;

    if (search) {
      whereConditions += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereConditions += ` AND c.name ILIKE $${paramIndex}`;
      queryParams.push(`%${category}%`);
      paramIndex++;
    }

    if (status === 'active') {
      whereConditions += ` AND p.is_active = true`;
    } else if (status === 'inactive') {
      whereConditions += ` AND p.is_active = false`;
    }

    // Get products with inventory summary
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.sku,
        p.barcode,
        p.selling_price as price,
        p.cost_price,
        p.min_stock_level,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.name as category,
        COALESCE(SUM(i.available_quantity), 0) as stock,
        CASE 
          WHEN p.is_active = false THEN 'inactive'
          WHEN COALESCE(SUM(i.available_quantity), 0) = 0 THEN 'out_of_stock'
          WHEN COALESCE(SUM(i.available_quantity), 0) <= p.min_stock_level THEN 'low_stock'
          ELSE 'active'
        END as status
      FROM "${tenant.schemaName}".products p
      LEFT JOIN "${tenant.schemaName}".categories c ON p.category_id = c.id
      LEFT JOIN "${tenant.schemaName}".inventory i ON p.id = i.product_id
      WHERE 1=1 ${whereConditions}
      GROUP BY p.id, p.name, p.description, p.sku, p.barcode, p.selling_price, 
               p.cost_price, p.min_stock_level, p.is_active, p.created_at, p.updated_at, c.name
      ORDER BY p.updated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(parseInt(limit), offset);
    const products = await prisma.$queryRawUnsafe(productsQuery, ...queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM "${tenant.schemaName}".products p
      LEFT JOIN "${tenant.schemaName}".categories c ON p.category_id = c.id
      WHERE 1=1 ${whereConditions}
    `;

    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    const totalResult = await prisma.$queryRawUnsafe(countQuery, ...countParams) as any[];
    const total = parseInt(totalResult[0]?.total || '0');

    res.json({
      success: true,
      data: {
        products: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Products fetch error:', error);
    throw new CustomError('Failed to fetch products', 500);
  }
}));

// Create product
router.post('/', authMiddleware, asyncHandler(async (req: TenantRequest, res) => {
  const tenant = req.tenant;
  if (!tenant) {
    throw new CustomError('Tenant information required', 400);
  }

  const validatedData = createProductSchema.parse(req.body);

  try {
    // Check if SKU already exists
    const existingProduct = await prisma.$queryRawUnsafe(
      `SELECT id FROM "${tenant.schemaName}".products WHERE sku = $1`,
      validatedData.sku
    ) as any[];

    if (existingProduct.length > 0) {
      throw new CustomError('Product with this SKU already exists', 409);
    }

    // Insert new product
    const insertQuery = `
      INSERT INTO "${tenant.schemaName}".products (
        name, description, sku, barcode, category_id, supplier_id,
        unit_of_measure, cost_price, selling_price, min_stock_level,
        max_stock_level, reorder_point, weight, dimensions, images,
        is_active, is_trackable, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING *
    `;

    const newProduct = await prisma.$queryRawUnsafe(
      insertQuery.replace('$14', '$14::jsonb').replace('$15', '$15::jsonb').replace('$18', '$18::uuid'),
      validatedData.name,
      validatedData.description || null,
      validatedData.sku,
      validatedData.barcode || null,
      validatedData.categoryId || null,
      validatedData.supplierId || null,
      validatedData.unitOfMeasure,
      validatedData.costPrice || null,
      validatedData.sellingPrice,
      validatedData.minStockLevel,
      validatedData.maxStockLevel || null,
      validatedData.reorderPoint,
      validatedData.weight || null,
      validatedData.dimensions ? JSON.stringify(validatedData.dimensions) : null,
      JSON.stringify(validatedData.images),
      validatedData.isActive,
      validatedData.isTrackable,
      req.user!.id
    ) as any[];

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: newProduct[0] }
    });

  } catch (error) {
    if (error instanceof CustomError) throw error;
    console.error('Product creation error:', error);
    throw new CustomError('Failed to create product', 500);
  }
}));

// Get single product
router.get('/:id', authMiddleware, asyncHandler(async (req: TenantRequest, res) => {
  const tenant = req.tenant;
  if (!tenant) {
    throw new CustomError('Tenant information required', 400);
  }

  const { id } = req.params;

  try {
    const productQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        s.name as supplier_name,
        COALESCE(SUM(i.available_quantity), 0) as total_stock
      FROM "${tenant.schemaName}".products p
      LEFT JOIN "${tenant.schemaName}".categories c ON p.category_id = c.id
      LEFT JOIN "${tenant.schemaName}".suppliers s ON p.supplier_id = s.id
      LEFT JOIN "${tenant.schemaName}".inventory i ON p.id = i.product_id
      WHERE p.id = $1
      GROUP BY p.id, c.name, s.name
    `;

    const products = await prisma.$queryRawUnsafe(productQuery, id) as any[];

    if (products.length === 0) {
      throw new CustomError('Product not found', 404);
    }

    res.json({
      success: true,
      data: { product: products[0] }
    });

  } catch (error) {
    if (error instanceof CustomError) throw error;
    console.error('Product fetch error:', error);
    throw new CustomError('Failed to fetch product', 500);
  }
}));

export default router;