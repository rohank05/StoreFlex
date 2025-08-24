# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StoreFlex is a multi-tenant inventory management system built with React, Node.js, TypeScript, and PostgreSQL. The key architectural pattern is **tenant isolation using PostgreSQL schemas** - each organization gets its own database schema while sharing the application code and authentication infrastructure.

## Development Commands

### Quick Start
```bash
# Automated setup (starts everything)
./start.sh

# Stop all services
./stop.sh
```

### Manual Development
```bash
# Start database services
docker-compose up -d postgres redis

# Backend development (from /backend)
npm run dev                  # Start development server with hot reload
npm run db:generate         # Generate Prisma client after schema changes
npm run db:migrate          # Deploy database migrations
npm run db:studio           # Open Prisma Studio (database GUI)
npm run build               # Build for production
npm run lint                # Lint TypeScript code
npm run test                # Run Jest tests

# Frontend development (from /frontend)  
npm run dev                 # Start Vite development server
npm run build               # Build for production (includes type checking)
npm run type-check          # TypeScript type checking without build
npm run lint                # Lint React/TypeScript code
npm run preview             # Preview production build locally

# Root level commands
npm run dev                 # Start both frontend and backend
npm run install:all         # Install all dependencies
```

## Multi-Tenant Architecture

**Critical concept**: This system uses PostgreSQL schema-based multi-tenancy:

- **Shared schema** (`shared`): Contains `tenants`, `users`, and `user_sessions` tables
- **Tenant schemas** (`tenant_{slug}`): Each organization gets isolated tables for products, inventory, orders, etc.
- **Tenant identification**: API requests include `X-Tenant-ID` or `X-Tenant-Slug` headers

### Key Files for Multi-Tenancy
- `backend/src/middleware/tenantMiddleware.ts`: Extracts tenant info from headers and attaches to request
- `backend/database/init.sql`: Contains `create_tenant_schema()` function that dynamically creates tenant schemas
- `frontend/src/services/api.ts`: Axios interceptor automatically adds tenant headers to requests

### Working with Tenant Data
When adding new tenant-specific features:
1. Add tables to the `create_tenant_schema()` function in `database/init.sql`
2. Use raw SQL queries with dynamic schema names for tenant operations
3. Always use `tenantMiddleware` on protected routes
4. Access tenant info via `req.tenant` in controllers

## Authentication Flow

- **JWT + Refresh Token** pattern with automatic token refresh
- **Registration creates both user and organization** in a transaction
- **Login requires email + password, optionally tenant slug**
- **Frontend**: `useAuth` hook manages auth state with React Query
- **Backend**: `authMiddleware.ts` validates JWT and populates `req.user`

## Database Architecture

### Prisma Usage
- Prisma models only define the **shared schema** (`backend/prisma/schema.prisma`)
- Tenant-specific operations use **raw SQL queries** for schema isolation
- Run `npm run db:generate` after any Prisma schema changes

### Key Database Patterns
- All tenant tables include `created_at`, `updated_at` with auto-triggers
- UUIDs are used for all primary keys via `uuid_generate_v4()`
- Audit logging pattern is implemented in `audit_logs` table per tenant
- Foreign key relationships maintain referential integrity within tenant schemas

## Frontend Architecture

### State Management
- **React Query** for server state (API calls, caching)
- **React Context** for auth state (`useAuth` hook)
- **Material UI** theme and components with custom styling

### Key Frontend Patterns
- **Protected routes** via `ProtectedRoute` component
- **Tenant-aware API client** with automatic header injection
- **Form handling** with `react-hook-form` + Zod validation
- **Real-time ready** with socket.io-client setup

### Important Frontend Files
- `src/hooks/useAuth.tsx`: Complete authentication state management
- `src/services/api.ts`: Axios client with tenant headers and token refresh
- `src/components/Layout.tsx`: Main navigation and tenant-aware layout
- `src/types/index.ts`: All TypeScript interfaces and types

## Environment Configuration

### Backend (.env)
- Database on port **5433** (not default 5432) to avoid conflicts
- JWT secrets must be set in production
- CORS_ORIGIN should match frontend URL

### Frontend (.env)
- `VITE_API_URL` points to backend (default: http://localhost:3000)

## API Structure

### Authentication Routes (`/api/auth`)
- Public routes (login, register, refresh)
- Creates tenant schema during registration

### Tenant Routes (`/api/tenants`)  
- Public tenant lookup by slug
- Protected current tenant info

### Protected Routes (All others)
- Require `tenantMiddleware` + `authMiddleware`
- Access tenant data via `req.tenant.schemaName`
- Use raw SQL for tenant-specific queries

## Testing Multi-Tenant Features

1. Register a new user/organization to create tenant schema
2. Login and verify `X-Tenant-ID` headers in network tab
3. Check database for new schema: `tenant_{organization_slug}`
4. Test API endpoints work with tenant isolation

## Common Patterns When Adding Features

### Backend Controller Pattern
```typescript
// Always extend TenantRequest for tenant-aware endpoints
import { TenantRequest } from '@/middleware/tenantMiddleware'

export const someController = async (req: TenantRequest, res: Response) => {
  const schemaName = req.tenant!.schemaName
  // Use raw SQL with dynamic schema name
  const result = await prisma.$queryRaw`
    SELECT * FROM ${Prisma.raw(schemaName)}.some_table
  `
}
```

### Frontend API Pattern
```typescript
// API client automatically adds tenant headers
const response = await api.get('/api/some-endpoint')
// Headers X-Tenant-ID and X-Tenant-Slug are added automatically
```

## Database Port Configuration

**Important**: PostgreSQL runs on port **5433** (not 5432) to avoid conflicts with existing installations. Update connection strings accordingly.