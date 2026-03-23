# MRRMS - Ministry Resource Request Management System

MRRMS is a role-based platform for internal ministry resource workflows:

- Toner requests
- Multimedia equipment requests
- Computer repair requests

It includes:

- Secure login with hashed passwords
- User and Admin role separation
- Division-based request handling
- Admin approval and rejection with optional comments
- Printer verification search for toner approvals
- Request history and filtering
- Lightweight draggable user chatbot assistant

## Tech Stack

- Next.js App Router
- Prisma ORM
- PostgreSQL
- Electron shell support

## Database Models

- users
- requests
- toner_requests
- multimedia_requests
- repair_requests
- printers

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure `.env` with your PostgreSQL connection:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
AUTH_SECRET="replace-with-a-secure-random-secret"
```

3. Apply Prisma schema and generate client:

```bash
npx prisma migrate dev --name init_mrrms
npx prisma generate
```

4. Seed starter users and printer records:

```bash
npm run seed
```

5. Start the app:

```bash
npm run dev
```

6. Login accounts after seed:

- Admin: admin / admin123
- User: staff / user123

## Routes

- /login
- /user
- /admin

API routes:

- /api/auth/login
- /api/auth/logout
- /api/auth/me
- /api/requests
- /api/requests/[id]
- /api/printers

## Electron

Run Electron in development mode with Next.js server:

```bash
npm run electron:dev
```

If needed, customize runtime URL:

```bash
set ELECTRON_START_URL=http://localhost:3000
npm run electron
```
