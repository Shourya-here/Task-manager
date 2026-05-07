# Venture Management

A professional-grade collaborative task management suite designed for modern teams. Built with React, Node.js, and PostgreSQL.

## Core Functionality

- **Authentication**: JWT-based signup/login with bcrypt password hashing
- **Role-Based Access**: Admin and Member roles with granular permissions
- **Project Management**: Create, edit, and delete projects
- **Task Management**: Full CRUD with Kanban board, status/priority tracking
- **Team Management**: Add/remove project members
- **Dashboard**: Analytics with charts, stats cards, and overdue tracking
- **Dark Mode**: System-aware with manual toggle
- **Responsive**: Fully responsive design with mobile sidebar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Query, React Hook Form, Zod, Framer Motion, Recharts, Lucide Icons |
| Backend | Node.js, Express, Prisma ORM, PostgreSQL, JWT, bcrypt |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### 1. Clone & Install

```bash
npm run install:all
```

### 2. Configure Environment

Copy and edit the server environment file:

```bash
cp server/.env.example server/.env
```

Update `DATABASE_URL` with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager"
JWT_SECRET="your-secure-secret-key"
```

### 3. Setup Database

```bash
npm run db:push    # Create tables
npm run db:seed    # Seed sample data
```

### 4. Run Development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@venture.com | admin123 |
| Member | arjun@venture.com | member123 |
| Member | priya@venture.com | member123 |

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user

### Projects
- `GET /api/projects` — List projects
- `POST /api/projects` — Create project (Admin)
- `GET /api/projects/:id` — Project details
- `PUT /api/projects/:id` — Update (Admin)
- `DELETE /api/projects/:id` — Delete (Admin)
- `POST /api/projects/:id/members` — Add member (Admin)
- `DELETE /api/projects/:id/members/:userId` — Remove member (Admin)

### Tasks
- `GET /api/tasks` — List tasks (filtered by role)
- `POST /api/tasks` — Create task (Admin)
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task (Admin)

### Dashboard
- `GET /api/dashboard/stats` — Dashboard statistics
- `GET /api/dashboard/overdue` — Overdue tasks

## Railway Deployment

### Backend
1. Create a new Railway project
2. Add a PostgreSQL plugin
3. Connect your repo, set root directory to `server`
4. Add environment variables: `DATABASE_URL` (from Railway PG), `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`
5. Build command: `npx prisma generate && npx prisma db push`
6. Start command: `node src/index.js`

### Frontend
1. Add a new service, set root directory to `client`
2. Build command: `npm run build`
3. Add `VITE_API_URL` pointing to your backend URL

## Project Structure

```
├── server/
│   ├── prisma/           # Schema & seed
│   └── src/
│       ├── config/       # DB & env config
│       ├── controllers/  # Request handlers
│       ├── middleware/    # Auth, validation, errors
│       ├── routes/       # Express routes
│       ├── services/     # Business logic
│       └── utils/        # Zod schemas
├── client/
│   └── src/
│       ├── components/   # UI & layout components
│       ├── hooks/        # Auth & theme hooks
│       ├── pages/        # Route pages
│       └── services/     # API layer
└── package.json          # Monorepo scripts
```
