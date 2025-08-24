import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { tenantMiddleware } from '@/middleware/tenantMiddleware';

// Import routes
import authRoutes from '@/routes/auth';
import tenantRoutes from '@/routes/tenants';
import userRoutes from '@/routes/users';
import productRoutes from '@/routes/products';
import inventoryRoutes from '@/routes/inventory';
import orderRoutes from '@/routes/orders';
import dashboardRoutes from '@/routes/dashboard';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Tenant-Slug'],
}));

app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);

// Tenant-aware routes (require tenant middleware)
app.use('/api/users', tenantMiddleware, userRoutes);
app.use('/api/products', tenantMiddleware, productRoutes);
app.use('/api/inventory', tenantMiddleware, inventoryRoutes);
app.use('/api/orders', tenantMiddleware, orderRoutes);
app.use('/api/dashboard', tenantMiddleware, dashboardRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-tenant', (tenantId: string) => {
    socket.join(`tenant-${tenantId}`);
    logger.info(`Socket ${socket.id} joined tenant ${tenantId}`);
  });
  
  socket.on('leave-tenant', (tenantId: string) => {
    socket.leave(`tenant-${tenantId}`);
    logger.info(`Socket ${socket.id} left tenant ${tenantId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available globally
app.set('io', io);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    prisma.$disconnect();
    process.exit(0);
  });
});

// Start server
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN}`);
});

export { app, io };