import { Router } from 'express';
import { prisma } from '@/server';
import { asyncHandler } from '@/middleware/errorHandler';
import { authMiddleware, AuthRequest } from '@/middleware/authMiddleware';

const router = Router();

// Get tenant info (public endpoint for login form)
router.get('/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      status: true,
    }
  });

  if (!tenant || tenant.status !== 'active') {
    return res.status(404).json({
      success: false,
      message: 'Organization not found'
    });
  }

  res.json({
    success: true,
    data: { tenant }
  });
}));

// Get current tenant details (authenticated)
router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: req.user!.tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      domain: true,
      settings: true,
      subscriptionPlan: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  res.json({
    success: true,
    data: { tenant }
  });
}));

export default router;