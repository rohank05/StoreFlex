import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/server';
import { asyncHandler, CustomError } from '@/middleware/errorHandler';
import { authMiddleware, AuthRequest } from '@/middleware/authMiddleware';
import { optionalTenantMiddleware } from '@/middleware/tenantMiddleware';
import { logger } from '@/utils/logger';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationSlug: z.string()
    .min(3, 'Organization slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Organization slug must contain only lowercase letters, numbers, and hyphens'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  tenantSlug: z.string().optional(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Helper function to generate tokens
const generateTokens = (userId: string, email: string, tenantId: string) => {
  const jwtSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!jwtSecret || !refreshSecret) {
    throw new Error('JWT secrets not configured');
  }

  const accessToken = jwt.sign(
    { userId, email, tenantId },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    refreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Helper function to create tenant schema
const createTenantSchema = async (schemaName: string) => {
  try {
    await prisma.$executeRaw`SELECT create_tenant_schema(${schemaName})`;
    logger.info(`Created tenant schema: ${schemaName}`);
  } catch (error) {
    logger.error(`Failed to create tenant schema: ${schemaName}`, error);
    throw new CustomError('Failed to create organization workspace', 500);
  }
};

// Register new user and organization
router.post('/register', asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  
  const { email, password, firstName, lastName, organizationName, organizationSlug } = validatedData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new CustomError('User already exists with this email', 409);
  }

  // Check if organization slug is taken
  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: organizationSlug }
  });

  if (existingTenant) {
    throw new CustomError('Organization slug is already taken', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create tenant and user in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create tenant
    const tenant = await tx.tenant.create({
      data: {
        name: organizationName,
        slug: organizationSlug,
        schemaName: `tenant_${organizationSlug.replace(/-/g, '_')}`,
        settings: {
          features: ['inventory', 'orders', 'reports'],
          limits: {
            users: 10,
            products: 1000,
            storage: '1GB'
          }
        }
      }
    });

    // Create user
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        tenantId: tenant.id,
        isEmailVerified: true, // For demo purposes
      }
    });

    return { tenant, user };
  });

  // Create tenant schema
  await createTenantSchema(result.tenant.schemaName);

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(
    result.user.id,
    result.user.email,
    result.tenant.id
  );

  // Store refresh token
  await prisma.userSession.create({
    data: {
      userId: result.user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    }
  });

  logger.info('User registered successfully', {
    userId: result.user.id,
    email: result.user.email,
    tenantId: result.tenant.id,
    organizationSlug: result.tenant.slug,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      },
      organization: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
      },
      tokens: {
        accessToken,
        refreshToken,
      }
    }
  });
}));

// Login
router.post('/login', optionalTenantMiddleware, asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);
  const { email, password, tenantSlug } = validatedData;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      tenant: true
    }
  });

  if (!user) {
    throw new CustomError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new CustomError('Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new CustomError('Account is deactivated', 401);
  }

  // Check if tenant is active
  if (user.tenant.status !== 'active') {
    throw new CustomError('Organization is not active', 401);
  }

  // If tenant slug is provided, verify it matches
  if (tenantSlug && user.tenant.slug !== tenantSlug) {
    throw new CustomError('Invalid organization', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(
    user.id,
    user.email,
    user.tenantId
  );

  // Store refresh token
  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    }
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  logger.info('User logged in successfully', {
    userId: user.id,
    email: user.email,
    tenantId: user.tenantId,
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      organization: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
      },
      tokens: {
        accessToken,
        refreshToken,
      }
    }
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);

  // Find session with refresh token
  const session = await prisma.userSession.findFirst({
    where: {
      refreshToken,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: {
        include: {
          tenant: true
        }
      }
    }
  });

  if (!session) {
    throw new CustomError('Invalid or expired refresh token', 401);
  }

  // Check if user and tenant are active
  if (!session.user.isActive || session.user.tenant.status !== 'active') {
    throw new CustomError('Account or organization is not active', 401);
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    session.user.id,
    session.user.email,
    session.user.tenantId
  );

  // Update session with new refresh token
  await prisma.userSession.update({
    where: { id: session.id },
    data: {
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }
  });

  res.json({
    success: true,
    message: 'Tokens refreshed successfully',
    data: {
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      }
    }
  });
}));

// Get current user profile
router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      isEmailVerified: true,
      createdAt: true,
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          subscriptionPlan: true,
        }
      }
    }
  });

  res.json({
    success: true,
    data: { user }
  });
}));

// Logout
router.post('/logout', authMiddleware, asyncHandler(async (req: AuthRequest, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.substring(7);

  if (token) {
    // Remove all sessions for this user (optional: remove only current session)
    await prisma.userSession.deleteMany({
      where: { userId: req.user!.id }
    });
  }

  logger.info('User logged out successfully', {
    userId: req.user!.id,
    email: req.user!.email,
  });

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

export default router;