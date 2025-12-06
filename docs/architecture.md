# Architecture Documentation

## High-Level Architecture

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
└────────────────────────────┼────────────────────────────────────────────┘
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
│  └─────────────────────────────────────────────────────────────────┘   │
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

## Data Flow

### 1. User Authentication Flow
```
User → Login Page → POST /api/auth/login → Verify Password → Generate JWT → Return Token
User → Store Token in localStorage → Attach to all API requests
```

### 2. Tenant Selection & Analytics Flow
```
User → Select Tenant → GET /api/tenants → Display List
User → Click Tenant → GET /api/analytics/:tenantId/summary
                   → GET /api/analytics/:tenantId/orders-by-date
                   → GET /api/analytics/:tenantId/top-customers
                   → Render Dashboard Charts
```

### 3. Data Sync Flow
```
Manual Trigger: User → Click "Sync" → POST /api/tenants/:id/sync/orders
                                    → Fetch from Shopify API
                                    → Upsert into Database

Automatic: node-cron (every 30 min) → For each tenant:
                                    → syncCustomers()
                                    → syncProducts()
                                    → syncOrders()
```

## Multi-Tenancy Model

### Per-Row Tenant Isolation
- Every data record has a `tenantId` foreign key
- All queries filter by `tenantId` to ensure data isolation
- Tenant ownership verified via `createdByUserId`

### Data Model Relationships
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

## Security Considerations

### Authentication
- JWT tokens with 7-day expiration
- Passwords hashed with bcrypt (12 rounds)
- Token required for all protected routes

### Authorization
- Tenant access verified on every request
- Users can only access their own tenants
- Middleware validates JWT before route handlers

### Data Protection
- Access tokens stored encrypted in database
- Environment variables for secrets
- CORS configured for specific origins

## Suggested Next Steps for Production

### 1. Error Logging & Monitoring
- Integrate with Sentry or LogRocket
- Add request tracing (correlation IDs)
- Set up alerting for sync failures

### 2. Rate Limiting & Retry
- Add rate limiting middleware
- Implement exponential backoff for Shopify API
- Queue failed sync jobs for retry

### 3. Webhook Security
- Implement HMAC verification for Shopify webhooks
- Add webhook logging and replay protection
- Handle webhook delivery failures

### 4. Scaling Considerations
- Move cron jobs to separate worker process
- Use Redis for job queues (Bull/BullMQ)
- Add database read replicas for analytics
- Consider tenant-based database sharding

### 5. Performance Optimizations
- Add database indexes for common queries
- Implement caching layer (Redis)
- Paginate large data sets
- Use database connection pooling

### 6. Security Hardening
- Add CSP headers
- Implement request validation
- Add API rate limiting per user
- Regular security audits
