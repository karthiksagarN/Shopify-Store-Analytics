# Shopify Analytics Platform

A multi-tenant analytics platform for Shopify stores. Connect multiple stores, sync data automatically, and view comprehensive analytics dashboards.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## 🚀 Features

- **Multi-tenant Architecture**: Connect and manage multiple Shopify stores
- **Automated Data Sync**: Scheduled sync every 30 minutes via node-cron
- **Analytics Dashboard**: Revenue charts, order trends, top customers
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **Date Range Filtering**: Flexible analytics date selection
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

### Frontend (Lovable-hosted)
- React 18 + TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Recharts for data visualization
- Shadcn/ui component library

### Backend (Self-hosted)
- Node.js + Express.js
- TypeScript
- Prisma ORM
- MySQL Database
- JWT Authentication
- node-cron for scheduling

## 📁 Project Structure

```
├── src/                      # Frontend React app (runs in Lovable)
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and API client
│   └── pages/                # Page components
│
├── backend-reference/        # Backend code (run separately)
│   ├── prisma/               # Database schema
│   └── src/
│       ├── routes/           # API route handlers
│       ├── services/         # Business logic
│       └── middleware/       # Auth & error handling
│
└── docs/                     # Documentation
    └── architecture.md       # System architecture
```

## 🏃‍♂️ Getting Started

### Frontend (This Lovable Project)

The frontend is already running in Lovable! Just log in with any email and password (demo mode).

To connect to a real backend:
1. Set `DEMO_MODE = false` in `src/hooks/useAuth.tsx` and `src/hooks/useTenant.tsx`
2. Update `VITE_API_URL` environment variable to your backend URL

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend-reference
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL credentials and JWT secret
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |

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

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="mysql://user:password@localhost:3306/shopify_analytics"
JWT_SECRET="your-secret-key-min-32-chars"
PORT=3001
```

### Frontend (Lovable)
```env
VITE_API_URL=http://localhost:3001/api
```

## 🚀 Deployment

### Frontend
Already hosted on Lovable. Click "Publish" to deploy to production.

### Backend
Deploy to any Node.js hosting:
- **Railway**: Connect GitHub repo, auto-deploy
- **Render**: Web service with auto-scaling
- **DigitalOcean App Platform**: Managed containers

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [Backend README](backend-reference/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ using [Lovable](https://lovable.dev)
