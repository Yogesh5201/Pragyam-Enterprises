import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { confidentialityResponseInterceptor } from './middleware/confidentiality.middleware';
import { authRouter } from './routes/auth.routes';
import { inventoryRouter } from './routes/inventory.routes';
import { requirementsRouter } from './routes/requirements.routes';
import { enquiriesRouter } from './routes/enquiries.routes';
import { matchingRouter } from './routes/matching.routes';
import { negotiationsRouter } from './routes/negotiations.routes';
import { purchaseOrdersRouter } from './routes/purchaseOrders.routes';
import { transportRouter } from './routes/transport.routes';
import { paymentsRouter } from './routes/payments.routes';
import { invoicesRouter } from './routes/invoices.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { exportRouter } from './routes/export.routes';
import { auditRouter } from './routes/audit.routes';
import { usersRouter } from './routes/users.routes';

export const app = express();

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// Confidentiality Interceptor
app.use(confidentialityResponseInterceptor);

// Root & Health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'Pragyam Enterprises Rice Brokerage Engine',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

app.get('/api', (req: Request, res: Response) => {
  res.json({
    platform: 'PRAGYAM ENTERPRISES',
    description: 'Confidential Rice Brokerage & Trading Management Platform',
    endpoints: {
      auth: '/api/auth',
      inventory: '/api/inventory',
      requirements: '/api/requirements',
      enquiries: '/api/enquiries',
      matching: '/api/matching',
      negotiations: '/api/negotiations',
      purchaseOrders: '/api/purchase-orders',
      transport: '/api/transport',
      payments: '/api/payments',
      invoices: '/api/invoices',
      analytics: '/api/analytics',
      export: '/api/export',
      audit: '/api/audit',
      users: '/api/users'
    }
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/requirements', requirementsRouter);
app.use('/api/enquiries', enquiriesRouter);
app.use('/api/matching', matchingRouter);
app.use('/api/negotiations', negotiationsRouter);
app.use('/api/purchase-orders', purchaseOrdersRouter);
app.use('/api/transport', transportRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/export', exportRouter);
app.use('/api/audit', auditRouter);
app.use('/api/users', usersRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});
