import { Router } from 'express';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { authMiddleware } from '@/middleware/authMiddleware';
import { TenantRequest } from '@/middleware/tenantMiddleware';
import { prisma } from '@/server';

const router = Router();

// Get dashboard statistics
router.get('/stats', authMiddleware, asyncHandler(async (req: TenantRequest, res) => {
  const tenant = req.tenant;
  if (!tenant) {
    throw new CustomError('Tenant information required', 400);
  }

  try {
    // Get total products
    const totalProductsResult = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM "${tenant.schemaName}".products WHERE is_active = true`
    ) as any[];
    const totalProducts = parseInt(totalProductsResult[0]?.count || '0');

    // Get low stock items (where available stock <= min_stock_level)
    const lowStockResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM (
        SELECT p.id, p.min_stock_level, COALESCE(SUM(i.available_quantity), 0) as total_stock
        FROM "${tenant.schemaName}".products p
        LEFT JOIN "${tenant.schemaName}".inventory i ON p.id = i.product_id
        WHERE p.is_active = true
        GROUP BY p.id, p.min_stock_level
        HAVING COALESCE(SUM(i.available_quantity), 0) <= p.min_stock_level
      ) low_stock_products
    `) as any[];
    const lowStockItems = parseInt(lowStockResult[0]?.count || '0');

    // Get total inventory value
    const inventoryValueResult = await prisma.$queryRawUnsafe(`
      SELECT COALESCE(SUM(COALESCE(i.available_quantity, 0) * p.cost_price), 0) as total_value
      FROM "${tenant.schemaName}".products p
      LEFT JOIN "${tenant.schemaName}".inventory i ON p.id = i.product_id
      WHERE p.is_active = true AND p.cost_price IS NOT NULL
    `) as any[];
    const totalInventoryValue = parseFloat(inventoryValueResult[0]?.total_value || '0');

    // Get recent activity (last 10 product updates)
    const recentActivityResult = await prisma.$queryRawUnsafe(`
      SELECT 
        p.id,
        p.name as item,
        p.updated_at as time,
        'Product Updated' as action,
        'product' as type
      FROM "${tenant.schemaName}".products p
      WHERE p.is_active = true
      ORDER BY p.updated_at DESC
      LIMIT 10
    `) as any[];

    // Get top products by recent creation (since we don't have sales data yet)
    const topProductsResult = await prisma.$queryRawUnsafe(`
      SELECT 
        p.id,
        p.name,
        p.selling_price,
        COALESCE(SUM(i.available_quantity), 0) as stock,
        p.created_at
      FROM "${tenant.schemaName}".products p
      LEFT JOIN "${tenant.schemaName}".inventory i ON p.id = i.product_id
      WHERE p.is_active = true
      GROUP BY p.id, p.name, p.selling_price, p.created_at
      ORDER BY p.created_at DESC
      LIMIT 5
    `) as any[];

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          lowStockItems,
          totalInventoryValue,
          totalOrders: 0 // Placeholder until orders module is implemented
        },
        recentActivity: recentActivityResult.map(item => ({
          id: item.id,
          action: item.action,
          item: item.item,
          time: item.time,
          type: item.type
        })),
        topProducts: topProductsResult.map(product => ({
          id: product.id,
          name: product.name,
          price: parseFloat(product.selling_price || '0'),
          stock: parseInt(product.stock || '0'),
          createdAt: product.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    throw new CustomError('Failed to fetch dashboard statistics', 500);
  }
}));

// Get monthly inventory trends (placeholder data for now)
router.get('/trends', authMiddleware, asyncHandler(async (req: TenantRequest, res) => {
  const tenant = req.tenant;
  if (!tenant) {
    throw new CustomError('Tenant information required', 400);
  }

  // Generate placeholder monthly data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const trendsData = months.map((month, index) => ({
    month,
    value: 15000 + (index * 2000) + Math.floor(Math.random() * 3000),
    orders: 120 + (index * 20) + Math.floor(Math.random() * 40)
  }));

  res.json({
    success: true,
    data: { trends: trendsData }
  });
}));

export default router;