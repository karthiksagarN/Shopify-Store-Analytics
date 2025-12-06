import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenants.js';
import analyticsRoutes from './routes/analytics.js';
import { errorHandler } from './middleware/error.js';
import { syncAllTenants } from './services/sync.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check 
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Health check for monitoring tool
app.head('/health_check', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// Schedule sync job every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('[CRON] Starting scheduled sync...');
  try {
    await syncAllTenants(prisma);
    console.log('[CRON] Sync completed successfully');
  } catch (error) {
    console.error('[CRON] Sync failed:', error);
  }
});

// Seed demo user
async function seedDemoUser() {
  const email = 'demo@shopify.com';
  const password = 'password123';

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      console.log('🌱 Seeding demo user...');
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          isVerified: true,
        },
      });
      console.log('✅ Demo user created: ' + email);
    }
  } catch (error) {
    console.error('Failed to seed demo user:', error);
  }
}

// Start server
seedDemoUser().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
