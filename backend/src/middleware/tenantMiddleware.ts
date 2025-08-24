import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/server';
import { CustomError } from './errorHandler';
import { logger } from '@/utils/logger';

export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    schemaName: string;
    name: string;
    slug: string;
  };
}

export const tenantMiddleware = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const tenantSlug = req.headers['x-tenant-slug'] as string;

    if (!tenantId && !tenantSlug) {
      throw new CustomError('Tenant identification required', 400);
    }

    // Find tenant by ID or slug
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantId },
          { slug: tenantSlug }
        ],
        status: 'active'
      }
    });

    if (!tenant) {
      throw new CustomError('Tenant not found or inactive', 404);
    }

    // Attach tenant info to request
    req.tenant = {
      id: tenant.id,
      schemaName: tenant.schemaName,
      name: tenant.name,
      slug: tenant.slug,
    };

    logger.debug('Tenant middleware: tenant attached', {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      schemaName: tenant.schemaName,
    });

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalTenantMiddleware = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const tenantSlug = req.headers['x-tenant-slug'] as string;

    if (tenantId || tenantSlug) {
      const tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { id: tenantId },
            { slug: tenantSlug }
          ],
          status: 'active'
        }
      });

      if (tenant) {
        req.tenant = {
          id: tenant.id,
          schemaName: tenant.schemaName,
          name: tenant.name,
          slug: tenant.slug,
        };
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};