# Family Finance Tracker

A production-quality household financial management system for a single family.
Track income, expenses, budgets, savings goals, loans, and generate reports and
analytics with role-based access.

> **Status:** Project scaffold. Authentication, pages, and business logic are
> intentionally not implemented yet.

## Tech Stack

| Layer    | Technology                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form, Zod, Framer Motion, Recharts |
| Backend  | Node.js, Express, TypeScript, MongoDB, Mongoose, JWT (reserved)                                                    |
| Tooling  | ESLint, Prettier, npm workspaces                                                                                   |

## Project Structure

The repository is an npm workspace monorepo with three packages.

```
family-finance-tracker/
├── client/                  # React frontend
│   └── src/
│       ├── app/             # App-wide setup (providers, router)
│       ├── components/
│       │   ├── ui/          # Reusable UI primitives (Button, Input, ...)
│       │   ├── layout/      # App shell (header, sidebar, layout)
│       │   └── common/      # Feature-agnostic shared components
│       ├── features/        # Feature-based modules
│       │   ├── auth/        # reserved
│       │   ├── income/      # reserved
│       │   ├── expenses/    # reserved
│       │   ├── budgets/     # reserved
│       │   ├── savings-goals/  # reserved
│       │   ├── loans/       # reserved
│       │   ├── reports/     # reserved
│       │   └── dashboard/   # reserved
│       ├── hooks/           # Shared hooks
│       ├── lib/             # API client and utilities
│       └── config/          # Environment config
├── server/                  # Express backend
│   └── src/
│       ├── config/          # Environment + database config
│       ├── modules/         # Feature-based modules (auth, income, ...)
│       ├── middleware/      # error, validation, rate limiting
│       ├── routes/          # API router (health check)
│       ├── utils/           # ApiError, asyncHandler
│       └── index.ts         # Server entry point
└── shared/                  # Shared types/contracts used by client + server
    └── src/
        └── types/           # User, Transaction, Category, Budget, ...
```

## Prerequisites

- Node.js >= 20
- MongoDB running locally (or a MongoDB Atlas connection string)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create environment files from the examples:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Then adjust `server/.env` (especially `MONGODB_URI`).

### 3. Run in development

```bash
npm run dev
```

This builds the shared types package, then starts all three in watch mode:

- `shared` — TypeScript watch for shared types
- `server` — API on http://localhost:5000
- `client` — Vite dev server on http://localhost:5173 (proxies `/api` to the server)

Verify the API health check at http://localhost:5000/api/health.

### 4. Production build

```bash
npm run build
```

Builds shared, client, and server into their `dist/` folders. Run the server:

```bash
npm start
```

## Scripts

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Run shared, server, and client in watch mode |
| `npm run dev:client`   | Run the Vite dev server only                 |
| `npm run dev:server`   | Run the API in watch mode only               |
| `npm run dev:shared`   | Watch and rebuild shared types only          |
| `npm run build`        | Build all workspaces                         |
| `npm start`            | Start the built server                       |
| `npm run typecheck`    | Type-check all workspaces                    |
| `npm run lint`         | Lint all workspaces                          |
| `npm run format`       | Format all files with Prettier               |
| `npm run format:check` | Verify formatting without writing            |

## Environment Variables

### Client (`client/.env`)

| Variable       | Default | Description                 |
| -------------- | ------- | --------------------------- |
| `VITE_API_URL` | `/api`  | Base URL of the backend API |

### Server (`server/.env`)

| Variable               | Default                 | Description                     |
| ---------------------- | ----------------------- | ------------------------------- |
| `NODE_ENV`             | `development`           | Runtime environment             |
| `PORT`                 | `5000`                  | API port                        |
| `MONGODB_URI`          | —                       | MongoDB connection string       |
| `CORS_ORIGIN`          | `http://localhost:5173` | Comma-separated allowed origins |
| `JWT_SECRET`           | development placeholder | JWT signing secret (auth)       |
| `JWT_EXPIRES_IN`       | `7d`                    | JWT lifetime (auth)             |
| `RATE_LIMIT_WINDOW_MS` | `900000`                | Rate-limit window               |
| `RATE_LIMIT_MAX`       | `100`                   | Max requests per window         |

> Replace `JWT_SECRET` with a long random value before enabling authentication.

## Conventions

- **Feature-based architecture:** each feature lives in its own folder on both
  client (`client/src/features/<feature>`) and server (`server/src/modules/<feature>`).
- **Shared contracts:** domain types live in `shared/` and are consumed by both
  packages via `@family-finance/shared`.
- **Reusable modules:** generic middleware (error handling, validation, rate
  limiting) and UI primitives are built once and reused.
- **Formatting:** Prettier with no semicolons and single quotes.
- **Linting:** ESLint flat config with TypeScript and React hooks rules.
