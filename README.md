# PulseHR HRMS SaaS MVP

Production-style full-stack HRMS MVP for multi-tenant employee attendance, leave, and payroll management.

## Structure

- `backend` - Node.js, Express, JWT auth, Zod validation, JSON storage behind repository classes.
- `frontend` - React, Vite, Tailwind CSS, React Router, Zustand, React Query, Recharts, Framer Motion-ready UI.

## Run

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Seed login is created on first login:

- Email: `admin@acme.test`
- Password: `password123`

## API Design

https://edudash-php.theme.picode.in/index.php
Routes are under `/api`:

- `/auth`
- `/employees`
- `/attendance`
- `/leave`
- `/payroll`
- `/settings`
- `/reports`

JSON file access is isolated in `backend/src/database/jsonDb.js` and repository classes in `backend/src/repositories`. API logic calls services, services call repositories, and controllers only handle HTTP input/output. A future PostgreSQL migration should replace repository implementations without changing route or controller logic.
