import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/server';
import { CustomError } from './errorHandler';
import { TenantRequest } from './tenantMiddleware';

export interface AuthRequest extends TenantRequest {
  user?: {
    id: string;
    email: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
  };
}

interface JWTPayload {
  userId: string;
  email: string;
  tenantId: string;
  iat: number;
  exp: number;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('Access token required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new CustomError('Access token required', 401);
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new CustomError('JWT secret not configured', 500);
    }
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        email: true,
        tenantId: true,
        firstName: true,
        lastName: true,
        isActive: true,
        tenant: {
          select: {
            status: true,
          }
        }
      }
    });

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    if (!user.isActive) {
      throw new CustomError('User account is deactivated', 401);
    }

    if (user.tenant.status !== 'active') {
      throw new CustomError('Organization is not active', 401);
    }

    // If tenant middleware was used, verify user belongs to the tenant
    if (req.tenant && req.tenant.id !== user.tenantId) {
      throw new CustomError('Access denied for this organization', 403);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

export const optionalAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    const jwtSecret2 = process.env.JWT_SECRET;
    if (!jwtSecret2) return next();
    const decoded = jwt.verify(token, jwtSecret2) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        email: true,
        tenantId: true,
        firstName: true,
        lastName: true,
        isActive: true,
        tenant: {
          select: {
            status: true,
          }
        }
      }
    });

    if (user && user.isActive && user.tenant.status === 'active') {
      req.user = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      };
    }

    next();
  } catch (error) {
    // For optional auth, we ignore token errors and proceed
    next();
  }
};