# Shopify Analytics Platform

A comprehensive multi-tenant analytics platform for Shopify stores. Connect multiple stores, sync data automatically, and view comprehensive analytics dashboards.

![Dashboard Preview](Screenshots/dashboard1.png)

![Dashboard Preview](Screenshots/dashboard2.png)

## 🚀 Features

- **Multi-tenant Architecture**: Connect and manage multiple Shopify stores independently.
- **Automated Data Sync**: Scheduled sync every 30 minutes via node-cron (Customers, Products, Orders).
- **Interactive Analytics Dashboard**:
    - Revenue trends over time.
    - Product category breakdowns.
    - Top-performing customers.
- **Secure Authentication**: JWT-based auth with bcrypt password hashing and email verification.
- **Modern UI**: Built with React, Tailwind CSS, and Shadcn UI (Dark/Light mode support).
- **Date Range Filtering**: Flexible analytics data selection.

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Login     │  │  Dashboard  │  │   Stores    │  │  Settings   │    │
│  │   Page      │  │   Page      │  │   Page      │  │    Page     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                            │                                             │
│                    ┌───────┴───────┐                                    │
│                    │   API Layer   │ (Axios)                            │
│                    └───────┬───────┘                                    │
16: └────────────────────────────┼────────────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Express.js)                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Middleware Layer                          │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌────────────┐                 │   │
│  │  │   CORS   │  │  JWT Auth    │  │   Error    │                 │   │
│  │  └──────────┘  └──────────────┘  │  Handler   │                 │   │
│  │                                   └────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         Route Handlers                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │  /auth   │  │ /tenants │  │/analytics│  │ /webhooks│        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        Service Layer                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │   │
│  │  │   Shopify    │  │    Sync      │  │   Analytics  │           │   │
│  │  │   Client     │  │   Service    │  │   Service    │           │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Prisma ORM Layer                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                │                                        │
│  ┌─────────────────────────────┼─────────────────────────────────┐     │
│  │              Scheduled Jobs (node-cron)                        │     │
│  │  - Sync all tenants every 30 minutes                          │     │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        MySQL DATABASE                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Users   │  │ Tenants  │  │Customers │  │ Products │  │  Orders  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

                                 │
                                 │ Shopify Admin API
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SHOPIFY STORES                                    │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │   Store 1      │  │   Store 2      │  │   Store N      │            │
│  │  (Tenant A)    │  │  (Tenant B)    │  │  (Tenant N)    │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

#### 1. User Authentication Flow
```
User → Login Page → POST /api/auth/login → Verify Password → Generate JWT → Return Token
User → Store Token in localStorage → Attach to all API requests
```

#### 2. Tenant Selection & Analytics Flow
```
User → Select Tenant → GET /api/tenants → Display List
User → Click Tenant → GET /api/analytics/:tenantId/summary
                   → GET /api/analytics/:tenantId/orders-by-date
                   → GET /api/analytics/:tenantId/top-customers
                   → Render Dashboard Charts
```

#### 3. Data Sync Flow
```
Manual Trigger: User → Click "Sync" → POST /api/tenants/:id/sync/orders
                                    → Fetch from Shopify API
                                    → Upsert into Database

Automatic: node-cron (every 30 min) → For each tenant:
                                    → syncCustomers()
                                    → syncProducts()
                                    → syncOrders()
```

### Multi-Tenancy Model

#### Per-Row Tenant Isolation
- Every data record has a `tenantId` foreign key.
- All queries filter by `tenantId` to ensure data isolation.
- Tenant ownership verified via `createdByUserId`.

#### Data Model Relationships
```
User (1) ──────────────< Tenant (N)
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
         Customer       Product        Order
              │                           │
              └───────────────────────────┘
                      (FK relation)
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript (Vite)
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: TanStack Query
- **Routing**: React Router DOM (v6)
- **Visualization**: Recharts

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Scheduling**: node-cron
- **Email**: Resend (with SMTP fallback)
- **Authentication**: JWT + bcryptjs

## 📁 Project Structure

```
├── frontend/                 # Frontend React app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks (useAuth, useTenant)
│   │   ├── lib/              # Utilities and API client
│   │   └── pages/            # Page components
│
├── backend/                  # Backend API
│   ├── prisma/               # Database schema
│   └── src/
│       ├── routes/           # API route handlers
│       ├── services/         # Business logic (Shopify, Sync, Analytics)
│       └── middleware/       # Auth & error handling
│
└── docs/                     # Documentation
    └── architecture.md       # Original architecture notes
```

## 🏃‍♂️ Getting Started

### Backend Setup

1.  **Navigate to backend folder**
    ```bash
    cd backend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure environment**
    Create a `.env` file based on `.env.example`:
    ```env
    DATABASE_URL="mysql://user:password@localhost:3306/shopify_analytics"
    JWT_SECRET="your-secret-key"
    PORT=3001
    FRONTEND_URL="http://localhost:5173"
    RESEND_API_KEY="re_..." (Optional)
    ```

4.  **Run database migrations**
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Start development server**
    ```bash
    npm run dev
    ```

### Frontend Setup

1.  **Navigate to frontend folder**
    ```bash
    cd frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure environment**
    Create a `.env` file:
    ```env
    VITE_API_URL="http://localhost:3001/api"
    ```

4.  **Start development server**
    ```bash
    npm run dev
    ```

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| POST | `/api/auth/verify` | Verify email address |

### Tenants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenants` | List user's stores |
| POST | `/api/tenants` | Connect new store |
| POST | `/api/tenants/:id/sync/customers` | Sync customers |
| POST | `/api/tenants/:id/sync/products` | Sync products |
| POST | `/api/tenants/:id/sync/orders` | Sync orders |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/:id/summary` | Get summary stats |
| GET | `/api/analytics/:id/orders-by-date` | Orders by date range |
| GET | `/api/analytics/:id/top-customers` | Top spending customers |
| GET | `/api/analytics/:id/revenue-by-category` | Sales breakdown by category |

## 🔐 Security Considerations

- **Authentication**: JWT tokens with expiration. Passwords hashed with bcrypt (12 rounds).
- **Authorization**: Strict tenant isolation. Users can only access data for tenants they own. Middleware validates tokens on all protected routes.
- **Data Protection**: Sensitive keys (Shopify Access Tokens) should be encrypted in production (suggested). Environment variables used for all secrets.
- **CORS**: Configured to only allow requests from the trusted frontend origin.

## 🔮 Future Improvements

- **Error Logging**: Integrate Sentry/LogRocket.
- **Rate Limiting**: Implement Redis-based rate limiting for API endpoints.
- **Webhook Security**: Add HMAC verification for incoming Shopify webhooks.
- **Scalability**: Move cron jobs to a separate worker process with Redis (BullMQ).
- **Caching**: specific analytics queries can be cached using Redis to improve performance.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## Developer
**Developed by Karthik Sagar Nallagula**  
[Portfolio](https://karthiknallagula.com) | [LinkedIn](https://www.linkedin.com/in/karthik-sagar-nallagula/) | [GitHub](https://github.com/karthiksagarn)