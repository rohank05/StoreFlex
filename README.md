# StoreFlex - Multi-Tenant Inventory Management System

A modern, scalable inventory management system built with React, Node.js, and PostgreSQL, designed for multi-tenant SaaS operations.

## Features

- **Multi-Tenant Architecture**: Isolated data per organization with shared infrastructure
- **Role-Based Access Control**: Granular permissions per module and user
- **Modern UI**: Built with Material UI v5 and responsive design
- **Real-Time Updates**: WebSocket integration for live inventory tracking
- **Comprehensive Modules**: Products, Stock, Orders, Suppliers, Analytics
- **Scalable Backend**: Node.js with TypeScript and Prisma ORM

## Technology Stack

### Frontend
- React 18 with TypeScript
- Material UI v5 + custom theme
- Vite for fast development
- React Query for server state management
- React Hook Form + Zod validation
- Socket.IO client for real-time updates

### Backend
- Node.js with Express and TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication with refresh tokens
- Socket.IO for WebSocket connections
- Multi-tenant middleware architecture
- Redis for session storage

### Database & Infrastructure
- PostgreSQL with schema-based tenant isolation
- Redis for caching and sessions
- Docker containers for development
- Automated migration and setup scripts

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
./start.sh
```

### Option 2: Manual Setup
1. **Start database services**
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Setup database**
   ```bash
   cd backend && npm run db:generate
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health
- **Database**: localhost:5433 (PostgreSQL)
- **Redis**: localhost:6379

### Stop Services
```bash
./stop.sh
```
or manually:
```bash
# Stop Docker services
docker-compose down

# Stop Node.js processes
pkill -f "tsx watch"
pkill -f "vite"
```

## Project Structure

```
storeflex/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Prisma models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── prisma/              # Database schema and migrations
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── theme/           # Material UI theme
│   │   └── types/           # TypeScript types
│   └── package.json
├── docker-compose.yml       # Development environment
└── README.md
```

## Key Features Implemented

### ✅ **Authentication & Multi-Tenancy**
- JWT authentication with refresh tokens
- Organization-based multi-tenancy
- User registration and login
- Tenant isolation with PostgreSQL schemas

### ✅ **Modern UI/UX**
- Material UI v5 with custom theme
- Responsive design for all screen sizes
- Dark/light mode ready
- Professional dashboard with charts and analytics

### ✅ **Core Functionality**
- **Dashboard**: Overview with KPIs, charts, and recent activities
- **Products**: Product catalog with search and filtering
- **Inventory**: Real-time stock tracking and adjustments
- **Orders**: Purchase order management
- **Analytics**: Sales trends and performance metrics
- **Settings**: User and organization management

### ✅ **Technical Features**
- TypeScript throughout the stack
- Real-time updates with WebSocket
- Advanced data grids with sorting and filtering
- Form validation with Zod
- Error handling and loading states
- Docker containerization ready

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user and organization
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Tenant Management
- `GET /api/tenants/:slug` - Get tenant by slug
- `GET /api/tenants` - Get current tenant info

### Core Modules (Multi-tenant)
- `GET /api/products` - List products
- `GET /api/inventory` - List inventory
- `GET /api/orders` - List orders
- `GET /api/users` - List organization users

## Database Schema

The system uses a multi-tenant PostgreSQL architecture:

- **Shared Schema**: User authentication, tenant management, sessions
- **Tenant Schemas**: Isolated data per organization (products, inventory, orders, etc.)
- **Audit Logging**: Complete audit trail for all operations

## Development Commands

```bash
# Backend
npm run dev:backend          # Start backend dev server
npm run build:backend        # Build backend
npm run db:generate          # Generate Prisma client
npm run db:migrate           # Run database migrations

# Frontend  
npm run dev:frontend         # Start frontend dev server
npm run build:frontend       # Build frontend
npm run lint                 # Lint code

# Both
npm run dev                  # Start both servers
npm run build                # Build both applications
```

## Deployment

```bash
npm run build
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT