import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.ts';
import userRoutes from './routes/users.ts';
import postRoutes from './routes/posts.ts';
import commentRoutes from './routes/comments.ts';
import messageRoutes from './routes/messages.ts';
import notificationRoutes from './routes/notifications.ts';
import challengeRoutes from './routes/challenge.ts';
import reportRoutes from './routes/reports.ts';
import adminRoutes from './routes/admin.ts';
import { errorHandler } from './middleware/errorHandler.ts';

export function createApiApp(): express.Express {
  const app = express();

  // Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/challenge', challengeRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'RecoveryTribe Backend API',
      timestamp: Date.now(),
    });
  });

  // Error Handler
  app.use(errorHandler);

  return app;
}
