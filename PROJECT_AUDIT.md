# PROJECT_AUDIT.md

> **Audit date:** 2026-07-31
> **Scope:** Family Finance Tracker — initial scaffold (workspaces: `client`, `server`, `shared`)
> **Method:** Static review of source, configuration, dependency tree, and build/lint/typecheck results. No files were modified.

---

## 1. Folder Structure

```
family-finance-tracker/
├── package.json                  # Root workspace manifest + orchestration scripts
├── package-lock.json             # Lockfile
├── README.md                     # Setup + architecture documentation
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── .editorconfig
├── client/                       # React frontend (@family-finance/client)
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts            # Port 5173 + /api proxy to :5000
│   ├── tsconfig.json
│   ├── eslint.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   ├── .gitignore
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css             # Tailwind directives
│       ├── vite-env.d.ts
│       ├── app/
│       │   ├── providers/AppProviders.tsx   # QueryClientProvider wrapper
│       │   └── router/index.tsx             # Route table (placeholder)
│       ├── components/
│       │   ├── ui/.gitkeep       # Reserved: reusable primitives
│       │   ├── layout/AppLayout.tsx
│       │   └── common/Placeholder.tsx
│       ├── features/
│       │   ├── auth/.gitkeep
│       │   ├── income/.gitkeep
│       │   ├── expenses/.gitkeep
│       │   ├── budgets/.gitkeep
│       │   ├── savings-goals/.gitkeep
│       │   ├── loans/.gitkeep
│       │   ├── reports/.gitkeep
│       │   └── dashboard/.gitkeep
│       ├── hooks/.gitkeep        # Reserved: shared hooks
│       ├── lib/apiClient.ts      # Fetch wrapper + ApiError
│       └── config/env.ts         # VITE_API_URL
├── server/                       # Express backend (@family-finance/server)
│   ├── package.json
│   ├── tsconfig.json
│   ├── eslint.config.js
│   ├── .env.example
│   ├── .gitignore
│   └── src/
│       ├── index.ts              # Bootstrap: DB connect, listen, graceful shutdown
│       ├── app.ts                # createApp() factory, middleware wiring
│       ├── config/
│       │   ├── env.ts            # Zod-validated environment
│       │   └── database.ts       # Mongoose connect/disconnect
│       ├── middleware/
│       │   ├── error.ts          # notFound + errorHandler
│       │   ├── rateLimiter.ts    # express-rate-limit
│       │   └── validate.ts       # Generic Zod validation middleware
│       ├── routes/index.ts       # /api router + /health
│       ├── utils/
│       │   ├── ApiError.ts
│       │   └── asyncHandler.ts
│       └── modules/              # Reserved: auth, income, expense, budget,
│           └── (.gitkeep)        # savings-goal, loan, report
└── shared/                       # Shared contracts (@family-finance/shared)
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts              # Type-only barrel exports
        └── types/
            ├── common.ts         # Id, ApiResponse, Paginated, ...
            ├── user.ts           # User, UserRole
            ├── category.ts
            ├── transaction.ts
            ├── budget.ts
            ├── savings-goal.ts
            └── loan.ts
```

The tree is clean, logical, and exactly matches the requested feature-based architecture. No stray files. All "reserved" folders are represented with `.gitkeep` and stay empty, which is appropriate for an initialization.

---

## 2. Workspace Analysis

**npm workspaces.** The repo is a single npm workspace monorepo declared via `workspaces: ["client", "server", "shared"]`. Dependencies are hoisted to a root `node_modules` where possible; per-package conflicts are nested locally (see §11 for a React version conflict that is currently nested).

**Packages.**

| Package                         | Role                                                                                     | Consumes                 |
| ------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------ |
| `family-finance-tracker` (root) | Orchestration only: dev/build/lint/typecheck/format scripts, `concurrently` + `prettier` | none                     |
| `@family-finance/client`        | Browser SPA                                                                              | `@family-finance/shared` |
| `@family-finance/server`        | HTTP API                                                                                 | `@family-finance/shared` |
| `@family-finance/shared`        | Type-only contracts                                                                      | none                     |

**Dependency relationships.**

```
client ──depends on──> @family-finance/shared
server ──depends on──> @family-finance/shared
shared ──depends on──> (nothing)
root ──orchestrates──> all three
```

Shared is the only edge; the graph is a clean star. Types flow outward, so there is no circular or redundant coupling. Because `shared` ships a compiled `dist/`, both consumers resolve it through their own `moduleResolution` (bundler for client, NodeNext for server) — this works but has an ordering weakness (see §11, Problem 2).

---

## 3. Dependencies

### Root

| Package           | Kind | Reason                                                                      |
| ----------------- | ---- | --------------------------------------------------------------------------- |
| `concurrently ^9` | dev  | Runs `shared`, `server`, `client` watch processes together in `npm run dev` |
| `prettier ^3`     | dev  | Single formatting config for the whole repo                                 |

### Client — dependencies

| Package                    | Reason                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `@family-finance/shared`   | Shared domain types                                                                        |
| `react`, `react-dom ^19.2` | UI runtime                                                                                 |
| `react-router ^8`          | Routing. Note: v8 ships as the `react-router` package; `react-router-dom` is discontinued. |
| `@tanstack/react-query ^5` | Server-state management (caching, retries, invalidation)                                   |
| `react-hook-form ^7`       | Performant, uncontrolled forms                                                             |
| `zod ^3`                   | Client-side validation + form schemas                                                      |
| `framer-motion ^11`        | Animations/transitions                                                                     |
| `recharts ^3`              | Charts for reports/analytics                                                               |

All six UI/state libraries are required by the project brief. **None are currently referenced in `src/`** (only `react`, `react-router`, `@tanstack/react-query` are), which is expected for a scaffold but means these deps exist "on faith" — their presence should be validated as real features land. Recharts 3 transitively pulls `@reduxjs/toolkit` + `react-redux`, which is the cause of the duplicate-React nesting (§11, Problem 1) and adds bundle weight.

### Client — devDependencies

| Package                                                                                                                | Reason                             |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `vite ^7`, `@vitejs/plugin-react ^4`                                                                                   | Build tooling + React fast-refresh |
| `typescript ^5`, `@types/react`, `@types/react-dom`                                                                    | Compiler + type defs               |
| `tailwindcss ^3`, `postcss`, `autoprefixer`                                                                            | Styling pipeline                   |
| `eslint ^10`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals` | Linting (flat config)              |

### Server — dependencies

| Package                                          | Reason                                                                                                                      |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `@family-finance/shared`                         | Shared types                                                                                                                |
| `express ^4`                                     | HTTP framework. Deliberately v4 (mature, `@types/express` aligned); v5 exists but v4 remains the safest production default. |
| `mongoose ^8`                                    | ODM + schema/validation layer over MongoDB                                                                                  |
| `dotenv`                                         | Loads `server/.env`                                                                                                         |
| `zod`                                            | Runtime validation of env and request payloads                                                                              |
| `helmet`, `cors`, `express-rate-limit`, `morgan` | Security headers, CORS allowlist, rate limiting, request logging                                                            |
| `http-status-codes`                              | Named HTTP constants (readability)                                                                                          |
| `bcryptjs`, `jsonwebtoken`                       | **Reserved for authentication — currently unused code paths**                                                               |

### Server — devDependencies

| Package                                                                        | Reason                        |
| ------------------------------------------------------------------------------ | ----------------------------- |
| `tsx`                                                                          | TS/ESM watch runner for `dev` |
| `typescript`, `@types/*` (express, cors, morgan, node, bcryptjs, jsonwebtoken) | Compiler + type defs          |
| `eslint ^10`, `@eslint/js`, `typescript-eslint`, `globals`                     | Linting                       |

### Unnecessary / not-yet-needed dependencies

- **`bcryptjs`, `jsonwebtoken` (+ their `@types/*`)** — zero references in code. They are justified as "reserved for the planned auth module," but they are the definition of _not-yet-needed_: unused runtime deps add attack surface and audit noise. Acceptable if auth lands soon; otherwise they should wait.
- **`@types/node ^22`** — the active runtime is Node 24 (see §11, Problem 7). It compiles fine today but drifts from the running runtime.
- **`framer-motion` / `recharts`** — no references yet; installed ahead of need. Fine per the brief, but flag for removal if features never use them.

### Missing (recommended for the future, NOT installed)

- **`@hookform/resolvers`** — the standard bridge between `react-hook-form` and `zod` (zodResolver). With RHF + Zod both pinned, this is the most likely missing piece when forms are built.
- **`@tanstack/react-query-devtools`** (dev) — invaluable for debugging query state.
- **`date-fns`** (or similar) — date arithmetic for budgets/periods, reports and analytics.
- **`clsx` + `tailwind-merge`** — the standard pair for composable classnames in reusable UI primitives.
- **`vitest` + `supertest` + `mongodb-memory-server`** — testing stack; there are zero tests today.
- **`pino` + `pino-http`** (or `winston`) — structured production logging (morgan is dev-only today, §7).
- **`eslint-plugin-perfectionist` / `simple-import-sort`** — import ordering enforcement (both configs already target ESLint 10; the project already uses flat configs, so adoption is low-friction).
- **`dotenv-cli`** or env-file tooling — not needed today, useful once multiple env presets exist.

---

## 4. Architecture Review

### Folder organization — **9 / 10**

Textbook feature-first layout: `app/` for cross-cutting shell, `components/{ui,layout,common}` for reuse, `features/` per domain on the client; `modules/` per domain on the server; a `shared/` contract package. The naming conventions are consistent. Loses one point because several folders (`components/ui`, `hooks`, all `features`) are empty — the structure has not yet been exercised by real code, so its quality is theoretical until then.

### Feature-based architecture — **8 / 10**

The intent is correct and aligned with the brief. Client features mirror server modules almost 1:1 (income, expenses, budgets, savings-goals, loans, reports) plus auth/dashboard. Points deducted because nothing enforces the pattern yet, there is no documented convention for what lives in a feature folder (api/ component/ hooks/ index), and `auth` exists on the client but is unpaired on... it is paired (server `modules/auth` exists). Acceptable for scaffolding.

### Scalability — **7 / 10**

Good foundations: typed contracts, small reusable middleware, single shared types source, clean process split. However "scalability" is currently only structural. There is no pagination implementation, no caching strategy, no rate-limit tiering, no lazy-loaded routes, no DB indexing plan, no horizontal-process story (e.g. `cluster`/PM2), and a single family/tenant domain assumption baked into naming. For a single-household app this is acceptable; the structure supports growth but nothing is proven.

### Maintainability — **8 / 10**

Strict TS, ESLint, Prettier, semantic folders, and a central shared type source all favor long-term maintenance. Deductions: no tests, no docs beyond README (no per-feature or architecture ADRs), no path aliases (deep relative imports like `../../components/...` will get painful), and the two separate ESLint configs could drift from each other.

### Separation of concerns — **9 / 10**

Clean boundaries: config vs middleware vs routes vs utils vs modules; UI shell vs features vs shared components; types isolated in `shared`. `createApp()` is decoupled from `listen()`, which is exactly right for future testing. The one blemish is the `validate` middleware mutating `req[part]` (§11, Problem 5) which slightly blurs validation and typing concerns.

---

## 5. TypeScript Review

Per-package configs, no root `tsconfig.json` (correct choice; avoids composite/reference complexity).

| Setting                          | client | server | shared | Verdict                                               |
| -------------------------------- | ------ | ------ | ------ | ----------------------------------------------------- |
| `strict`                         | ✅     | ✅     | ✅     | Good                                                  |
| `noUnusedLocals/Parameters`      | ✅     | ✅     | ✅     | Good                                                  |
| `noFallthroughCasesInSwitch`     | ✅     | ✅     | ✅     | Good                                                  |
| `verbatimModuleSyntax`           | ✅     | ✅     | ✅     | Excellent — forces `import type`, keeping emits clean |
| `noEmit`                         | ✅     | —      | —      | Correct for Vite                                      |
| `declaration` + `declarationMap` | —      | —      | ✅     | Correct for a shared package                          |
| `sourceMap`                      | —      | ✅     | ✅     | Good                                                  |
| `esModuleInterop`                | ✅     | ✅     | ✅     | Good                                                  |

**Module resolution.** Client uses `bundler` (correct for Vite). Server and shared use `NodeNext` (correct for ESM `type: module`), which requires explicit `.js` extensions on relative imports — the code follows this correctly. This is the modern, correct setup.

**Weaknesses / improvements**

- **No path aliases anywhere.** Deep relative imports (`../../components/…`, `../middleware/…`) will degrade maintainability as the tree grows. Recommend `@/` alias for client (`tsconfig.paths` + Vite `resolve.alias`) and `@server/*` / `@shared/*` for server. Currently the project intentionally relies on the built `shared` package for cross-package imports instead — acceptable, but note the build-order fragility (§11, Problem 2).
- **`target`/`lib` = ES2020 on the client** is conservative for 2026 (ES2022/ES2023 is safe in all evergreen browsers); minor.
- **Shared types are not re-exported through client/server index files**, so consumers reach into `@family-finance/shared` directly (fine) but there is no single app-level type barrel.
- **No `@typescript-eslint` type-checked rules** (no `parserOptions.projectService`); type-aware rules like `no-floating-promises` would catch real bugs and could be enabled cheaply once auth/async code exists.
- Server build and typecheck run separately but use the same config — fine, no duplication issue.

---

## 6. Code Quality Setup

**ESLint.** Both packages use ESLint 10 flat configs via `typescript-eslint.config()` — current and idiomatic. Client adds `react-hooks` (rules-of-hooks as error, exhaustive-deps as warn) and `react-refresh`. Server adds an `argsIgnorePattern: '^_'` rule for error-handler params. Both run `--max-warnings=0`, which is the right strictness for a monorepo.

Gaps:

- No type-aware linting (see §5).
- No import ordering rule.
- No shared/lint config across workspaces (two near-identical files; minor duplication).
- No `eslint-plugin-react` base config (e.g., `no-unescaped-entities`, a11y rules) — `jsx-a11y` is missing entirely.

**Prettier.** Single root `.prettierrc.json` (no semicolons, single quotes, trailing commas, `lf`, width 100) + `.prettierignore`. `npm run format` / `format:check` run from root and `format` exists per workspace. All files currently pass `format:check`.

**Scripts.** Root provides `dev`, `dev:*`, `build`, `build:*`, `start`, `typecheck`, `lint`, `format`, `format:check` — well organized and symmetric. `dev` first builds `shared` then runs all three watchers via `concurrently`; this is the correct order and is documented.

**Notes**

- There is no aggregate `check` script (e.g. `typecheck && lint && format:check`), so CI-less runs must chain manually.
- There is no `test` script anywhere (no test infra at all).
- Prettier version is hoisted and consistent; no editor/plugin instructions in `.vscode`, but `.editorconfig` covers basics.

---

## 7. Backend Review

**Express structure — strong.** `createApp()` factory in `app.ts` is separated from bootstrapping in `index.ts` — the single most testability-friendly decision in the scaffold. Middleware order is correct: security → parsing → logging → routes → 404 → error handler.

**Middleware.**

- `helmet` default profile — good baseline.
- `cors` with allowlist parsed from `CORS_ORIGIN` (comma-split, trimmed) — good.
- `express-rate-limit` applied to the whole `/api` router with env-driven window/limit, `standardHeaders: 'draft-7'` — good and correctly placed (covers `/health` too, which is debatable but fine).
- `notFound` + centralized `errorHandler` — clean, consistent error envelope (`{ success:false, error:{ code, message, details? } }`), production-mode message masking, `console.error` for unexpected errors. Solid.
- `validate` middleware is generic and reusable — good design, but see §11 Problem 5 re: typing and mutation.

**Utils.** `ApiError` (statusCode/code/message/details) and `asyncHandler` are minimal and reusable. Good.

**Modules.** `modules/` exists with per-domain folders but is empty — no controllers/services/models yet, so the pattern (model + service + controller + routes per module) is unproven. The intended structure is sensible.

**Environment validation.** Zod schema with coercion, defaults, and fail-fast `process.exit(1)` — this is exactly right for a production API. **Weakness:** `JWT_SECRET` has a default (`development-only-secret-change-me`) and `CORS_ORIGIN` defaults to localhost — both should be _required_ when `NODE_ENV=production` (see §10 and §11 Problem 6).

**Health endpoint.** `/api/health` returns `{ success, data: { status, uptime, timestamp } }` — fine, but it does **not** verify the database connection (`mongoose.connection.readyState`), so it can report healthy while the DB is down (critical for orchestration/health checks later).

**Error handling.** Good, but missing: explicit handling of Mongoose validation/duplicate-key errors (falls through to generic 500), no `unhandledRejection`/`uncaughtException` handlers, and graceful shutdown has no forced-exit timeout (a stuck connection can hang `SIGTERM` indefinitely).

**Logging.** `morgan` only in development. In production there is effectively **no request logging** — a real gap for an API that will hold financial data.

---

## 8. Frontend Review

**Routing.** Minimal and correct: `BrowserRouter` + a single nested route under `AppLayout` with an index `Placeholder` and catch-all `Navigate`. React Router v8 API is used correctly. Future needs are unaddressed: no lazy loading (`React.lazy`/`Suspense`), no route guards (auth roles are a stated goal), no `createBrowserRouter` data router usage (which v8 pushes), no route-level error boundaries.

**Feature organization.** Folders are scaffolded correctly but empty — the feature pattern (api hooks, components, forms, index) has no actual example to copy yet.

**Reusable components.** Only `AppLayout` and `Placeholder`. `components/ui` is empty — no Button/Input/Card primitives yet; when they land, `clsx`/`tailwind-merge` will be needed (§3).

**TanStack Query.** Wrapped in `AppProviders` via a `QueryClient` created with `useState` (lazy init) — correct pattern. But the client uses **default options**: no `staleTime`, no `retry` policy, no `refetchOnWindowFocus` decision, and no QueryClient module where those are centralized. No query keys factory exists. No `QueryErrorResetBoundary`. All of this is fine for a scaffold but should be centralized before real data flows.

**Tailwind.** v3 config with `content` covering `index.html` + `src`; empty theme `extend`; JIT works. No custom design tokens/theme yet — expected. Note Tailwind v4 exists and is a config-breaking upgrade; staying on v3 is a deliberate, defensible choice but should be tracked.

**Forms.** `react-hook-form` is installed but unused; no `zodResolver` (`@hookform/resolvers`) — the RHF↔Zod bridge is missing (§3). No form component primitives or `FormProvider` conventions established.

**Charts.** `recharts v3` installed but unused; no chart wrapper/theme conventions yet. Recharts 3 is the current major (good — avoids the deprecated 2.x line).

**Client infra.** `apiClient` is a clean fetch wrapper with `ApiError` and a JSON header default, but: no timeout/`AbortController`, no auth header hook, no error-body parsing (the server's structured `ApiErrorBody` is ignored — client only reads status), no request serialization, and no per-call cancellation. The Vite dev proxy to `:5000` is configured well.

---

## 9. Shared Package Review

**Exported types.** Well-scoped first pass: primitives (`Id`, `ISODateString`), API envelopes (`ApiResponse`, `ApiErrorResponse`, `Paginated`, `PaginationParams`), and six domain models (User, Category, Transaction, Budget, SavingsGoal, Loan) with reasonable fields and union-typed enums (`UserRole`, `TransactionType`, `LoanStatus`, …). Type-only barrel (`export type *`) keeps the emitted runtime empty. Correct use of `.js` extensions under NodeNext.

**Future scalability.** The package is a good foundation: it centralizes the client↔server contract, which is the single most important long-term decision. It will scale as long as discipline is kept (all cross-package DTOs must live here). Current structure (one barrel `index.ts`) will need subpath exports or file-level imports as the type count grows.

**Possible improvements**

- **Add Zod schemas alongside the types** (a `schemas/` sibling or co-located files) so client forms and server validation share one source of truth. Today `zod` is duplicated on both sides but there are **no shared runtime schemas** — the types are compile-time only, so validation contracts can drift from types.
- Replace ad-hoc string unions with `as const` objects where a runtime value list is useful (e.g., for dropdown options on the client).
- Consider `branded` types (`Id` as a branded string) to prevent mixing IDs across domains.
- Document the versioning/breaking-change policy for the shared contract (SemVer on the package).
- Add request/response DTO types (Create/Update/List) per feature early, before endpoints multiply.

---

## 10. Security Review

### Current strengths

- `helmet` security headers on by default.
- CORS restricted to an explicit allowlist (`CORS_ORIGIN`).
- Rate limiting on the entire API surface.
- Zod-validated environment with fail-fast startup.
- Consistent, non-leaky error envelope; error messages masked in production.
- `app.disable('x-powered-by')`.
- `.env` files git-ignored; only `.env.example` committed (with placeholders).
- JWT/bcrypt present as reserved building blocks for planned auth.
- No secrets in source; `package-lock.json` present for reproducible installs.
- `npm audit` currently reports **0 vulnerabilities**.

### Future improvements (not implemented)

- **Make `JWT_SECRET` and `CORS_ORIGIN` required (no defaults) when `NODE_ENV=production`**, failing fast at startup. The current dev default would silently ship if env vars are forgotten.
- **Auth hardening**: use `httpOnly`+`secure`+`SameSite` cookies (or carefully scoped bearer storage), refresh-token rotation, account lockout/rate-limited login, bcrypt cost tuning, and role-based middleware (`owner`/`member`/`viewer` per the shared `UserRole`).
- **DB access**: dedicated MongoDB user with least-privilege role; enable auth; consider TLS (`mongodb+srv`/tls) and `autoIndex: false` in production.
- **Input security**: explicit handling of Mongoose CastError/duplicate-key (avoid leaking schema internals); enforce max lengths at the schema and validation layers; the `validate` middleware should be applied to params/query as well, not only body.
- **Request-level security**: structured access/audit logging for financial mutations, request IDs, per-user rate-limit keys once auth exists, and a forced-exit timeout in shutdown.
- **Supply chain**: keep `npm audit`/`npm outdated` in CI; add `npm dedupe` (see §11 Problem 1); consider `npx lockfile-lint` or OSS scanning once CI exists.
- **General**: disable `trust proxy` unless actually behind a proxy (it currently trusts `X-Forwarded-For` unconditionally, which can let clients spoof IPs and bypass rate-limit bucketing); add `Content-Security-Policy` if any inline/third-party assets appear; add secrets scanning in CI.

---

## 11. Potential Problems

1. **Duplicate React instances (real, observed).** `npm ls` shows `react@19.2.8` for the app and `react@18.3.1` nested under `recharts → @reduxjs/toolkit → react-redux` (also `@tanstack/react-query`, `framer-motion`, `react-hook-form` resolve against the hoisted 18). A single bundle containing two React copies risks hook-context mismatches, and any library that must share React context with the app may silently misbehave. Fixable by `npm dedupe`/clean reinstall; must be verified at runtime when components using those libraries land.
2. **Shared package build ordering.** `shared` ships compiled `dist/`, and `client`/`server` typecheck against it. On a fresh clone, `npm run typecheck` (or editor IntelliSense) fails until `npm run build:shared` runs, because `dist/` doesn't exist. `npm run dev`/`build` build shared first, but the typecheck script does not — an ordering trap that will confuse contributors and any future CI.
3. **Zero tests.** No unit/integration/e2e infrastructure at all. For a financial application this is the largest long-term risk on the board.
4. **Unused-but-installed runtime deps** (`bcryptjs`, `jsonwebtoken`, `framer-motion`, `recharts`) add bundle size and audit surface with no code paths. Watch for drift between installed and actually-used dependencies.
5. **`validate` middleware type-unsafety.** It assigns `req[part] = result.data` onto Express's `Request`, whose `body` is typed `any`. Consumers won't get inferred types, and assigning parsed data over the original field is a subtle mutation pattern. Prefer a typed wrapper that returns the parsed value or augments the request type.
6. **Insecure-by-default env.** `JWT_SECRET` and `CORS_ORIGIN` have localhost/placeholder defaults that would pass in production (no prod-mode requirement). Also `trust proxy: 1` is set unconditionally.
7. **Node version drift.** `engines.node >=20` is looser than Vite 7's requirement (`^20.19 || >=22.12`), and the runtime is Node 24 while `@types/node` targets ^22. Tighten engines; align `@types/node` with the supported runtime.
8. **No production logging / health fidelity.** No request logging in prod; `/api/health` doesn't check DB connectivity; no `unhandledRejection` handling; shutdown lacks a force-exit timeout.
9. **Monorepo drift risks.** Two ESLint configs (client/server) can diverge; no shared lint config; `shared` has no lint script at all.
10. **Import hygiene.** No path aliases + no import-ordering rule; `client/src/features/auth` is currently a directory, so if authentication is never implemented the empty `auth` folder is dead weight on both sides.
11. **Windows/Windows bash environment.** Paths, line endings, and `concurrently` output work, but any future `*.sh` scripts or git hooks must account for the Windows environment.
12. **`package-lock.json` inconsistency risk.** The lockfile reflects the nested React 18/19 split; a later clean install on a different machine may dedupe differently, producing environment-dependent behavior.

---

## 12. Recommendations

### High Priority

1. Resolve the **duplicate React** situation: run `npm dedupe` (and verify the tree), or pin/`overrides` to a single React major; add a runtime smoke check when recharts/framer-motion first render.
2. Fix the **shared-package build ordering**: add `build:shared` as a `pretest`/`pretypecheck` step, or make `shared` source-consumed via aliases, or wire `prepare`/CI to build shared first. Document it in README.
3. **Add a test foundation** (vitest + supertest + mongodb-memory-server) before writing any business logic — especially given the app will handle money. This is the single biggest de-risk.
4. **Fail fast in production**: make `JWT_SECRET`, `CORS_ORIGIN`, and `MONGODB_URI` required when `NODE_ENV=production`; remove insecure defaults; revisit `trust proxy`.
5. Align `engines` with actual requirements (`^20.19 || >=22.12`) and `@types/node` with the deployed runtime.

### Medium Priority

6. Add **production request logging** (pino or morgan `combined`) and make `/api/health` reflect DB state (`mongoose.connection.readyState`).
7. Add a **CI workflow** running `format:check → typecheck → lint → build → test` on push/PR, including `npm audit`.
8. Centralize **TanStack Query defaults** (staleTime/retry/GC time) in a QueryClient module; add query-key factories; consider React Query DevTools (dev).
9. Add **client path aliases** (`@/`), and server aliases if the tree grows; add an import-order lint rule (perfectionist/simple-import-sort) with the existing Prettier/ESLint setup.
10. Add `@hookform/resolvers` + establish the RHF+Zod form pattern, and `clsx`/`tailwind-merge` before building UI primitives.
11. Move **validation contracts into `shared`** (Zod schemas co-located with types) so client forms and server routes share one source of truth.

### Low Priority

12. Enable type-aware ESLint rules (`no-floating-promises`, etc.) once async code exists; add a11y linting (`eslint-plugin-jsx-a11y`).
13. Add `unhandledRejection`/`uncaughtException` handlers and a force-exit timeout on graceful shutdown.
14. Add an aggregate `npm run check` script (`format:check && typecheck && lint`) and a lint script for `shared`.
15. Document per-feature conventions (what lives in `features/<x>/`) and an ADR for the shared-contract versioning policy.
16. Track the Tailwind v4 / Express v5 upgrade paths deliberately rather than reactively.
17. Add `.vscode` recommended extensions/settings and a `CONTRIBUTING.md` once the team grows.

---

## 13. Overall Score

**78 / 100**

**Why not higher:** This is an excellent _initialization_ but it is still an initialization. There are **zero tests**, **no CI**, and **no business logic** — the feature folders and modules are empty placeholders, so the architecture's quality is unproven by actual code. There are several concrete, non-hypothetical defects: a **duplicate React version nesting in the installed tree**, a **shared-package build-ordering trap** that breaks `typecheck` on a fresh clone, **insecure default environment values** (JWT/CORS defaults would silently pass in production), **no production logging** and a **health endpoint that doesn't check the database**, and a handful of unused-but-installed runtime dependencies. The `engines`/`@types/node` drift also suggests the runtime constraints weren't fully reconciled.

**Why not lower:** The foundations are genuinely strong and above average for a scaffold. Strict TypeScript with `verbatimModuleSyntax` across all three packages, ESM-first NodeNext config, a correctly ordered Express middleware chain with a decoupled `createApp()` factory, Zod-validated environment with fail-fast startup, a centralized type-only shared contract package, current toolchain versions (Vite 7, React 19, React Router 8, ESLint 10, Recharts 3), clean feature-first folder structure on both sides, a **clean `npm audit`**, and consistent lint/format/typecheck gates that all pass. Every weakness above is addressable without restructuring — the bones are right.

**Bottom line:** Structure 9/10, tooling 8.5/10, security posture 7/10, test coverage 0/10, operational readiness 5/10. It deserves ~78/100 today and is well positioned to reach 90+ once tests, CI, auth, and the first real feature module land.
