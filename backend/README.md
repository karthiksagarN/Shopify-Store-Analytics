# Shopify Analytics Platform - Backend Reference

This folder contains the complete backend code for the Shopify Analytics Platform. 
This code is meant to be run **separately** on Node.js (not in Lovable).

## Tech Stack
- Node.js + Express.js
- TypeScript
- Prisma ORM
- MySQL Database
- JWT Authentication
- node-cron for scheduled sync

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ running
- npm or yarn

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
Copy `.env.example` to `.env` and fill in:
```
DATABASE_URL="mysql://user:password@localhost:3306/shopify_analytics"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
```

### 4. Run Database Migrations
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Build for Production
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Tenants
- `GET /api/tenants` - List user's tenants
- `POST /api/tenants` - Create new tenant

### Sync
- `POST /api/tenants/:tenantId/sync/customers` - Sync customers from Shopify
- `POST /api/tenants/:tenantId/sync/products` - Sync products from Shopify
- `POST /api/tenants/:tenantId/sync/orders` - Sync orders from Shopify

### Analytics
- `GET /api/analytics/:tenantId/summary` - Get summary metrics
- `GET /api/analytics/:tenantId/orders-by-date?start=YYYY-MM-DD&end=YYYY-MM-DD` - Orders by date
- `GET /api/analytics/:tenantId/top-customers?limit=5` - Top customers by spend

## Project Structure
```
backend/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── index.ts           # Entry point
│   ├── config/
│   │   └── env.ts         # Environment config
│   ├── middleware/
│   │   ├── auth.ts        # JWT middleware
│   │   └── error.ts       # Error handling
│   ├── routes/
│   │   ├── auth.ts        # Auth routes
│   │   ├── tenants.ts     # Tenant routes
│   │   └── analytics.ts   # Analytics routes
│   ├── services/
│   │   ├── shopify.ts     # Shopify API client
│   │   └── sync.ts        # Data sync service
│   └── utils/
│       └── helpers.ts     # Utility functions
├── .env.example
├── package.json
└── tsconfig.json
```
