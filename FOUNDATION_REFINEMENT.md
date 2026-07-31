# FOUNDATION_REFINEMENT.md

Sprint 1.2 — Foundation Refinement

> **Date:** 2026-07-31
> **Scope:** React version consistency, workspace build order, TypeScript path aliases, shared validation structure, tooling verification.
> **Architecture:** Unchanged (see §7).

---

## 1. Changes Made

| # | Change | Where |
|---|---|---|
| 1 | Root `overrides` forcing a single React 19 version | `package.json` (root) |
| 2 | `prepare` script that builds `shared` on install | `package.json` (root) |
| 3 | Client TypeScript path aliases | `client/tsconfig.json` |
| 4 | Vite `resolve.alias` mirroring client aliases | `client/vite.config.ts` |
| 5 | Client internal imports converted to aliases (proves resolution) | `client/src/App.tsx`, `client/src/app/router/index.tsx`, `client/src/lib/apiClient.ts` |
| 6 | Server TypeScript path aliases | `server/tsconfig.json` |
| 7 | Shared path alias `@shared/*` | `shared/tsconfig.json` |
| 8 | Reserved `schemas/` structure for future shared validation | `shared/src/schemas/index.ts` + export in `shared/src/index.ts` |
| 9 | `@types/node` added to client devDependencies (types `node:url` in `vite.config.ts`) | `client/package.json` |
| 10 | Reserved folders matching the requested aliases | `client/src/services/`, `client/src/types/`, `client/src/utils/`, `server/src/types/` (each `.gitkeep`) |
| 11 | Clean reinstall of the dependency tree | `node_modules/` + regenerated `package-lock.json` |

---

## 2. Task 1 — React Version Consistency

### What was wrong
The tree contained **two copies of React**: `react@19.2.8` (the app's real version, at `client/node_modules`) and `react@18.3.1` (hoisted to the root `node_modules` and used by the transitive chain under `recharts` → `@reduxjs/toolkit` → `react-redux`).

### Root cause
1. The original scaffold was installed with React 18, which hoisted `react@18.3.1` to the workspace root.
2. Later, `client` was upgraded to `react@^19.2.7`; npm's **incremental** install placed React 19 at the workspace-local `client/node_modules` but left the stale React 18 hoisted at root.
3. `recharts`, `@reduxjs/toolkit`, and `react-redux` all declare peer ranges that accept **both** React 18 and 19 (`^16.9 || ^17 || ^18 || ^19`), so npm considered the leftover React 18 a *valid* resolution and never replaced it. Result: a fresh `npm ci` reproduced the mismatch because it was encoded in the lockfile.

### Why it matters
Two React copies in one bundle can cause hook-context mismatch (`Invalid hook call`), inconsistent contexts between libraries and the app, subtle state bugs, and wasted bundle weight.

### How it was resolved
- Added a root-level `overrides` entry pinning `react`/`react-dom` to `^19.2.7` — the same range as the client's direct dependency — so **every** resolver in the tree (direct and transitive) is forced to the same React major and resolves to the same version.
- Performed a **clean reinstall** (`node_modules` + `package-lock.json` removed, `npm install` run fresh) so the lockfile was regenerated deterministically instead of inheriting the stale hoisted 18.

### Result
```
npm ls react react-dom
└── react@19.2.8          (single copy, hoisted to root)
└── react-dom@19.2.8      (single copy, hoisted to root)
```
Every consumer — `react-router`, `recharts`/`@reduxjs/toolkit`/`react-redux`, `@tanstack/react-query`, `framer-motion`, `react-hook-form` — dedupes to the same `react@19.2.8`. The `overrides` entry also guards against this class of regression in the future. `npm audit`: **0 vulnerabilities**.

---

## 3. Task 2 — Workspace Build Order

### What was wrong
`shared` ships as a **compiled** package (`main`/`types` → `dist/`). `client` and `server` typecheck against `shared/dist`. On a fresh clone, before anything builds, `shared/dist` does not exist, so `npm run typecheck` (and editor IntelliSense) failed.

### How it was resolved
Added a root `prepare` script:

```json
"prepare": "npm run build:shared"
```

npm runs `prepare` automatically after `npm install` / `npm ci`, so `shared/dist` always exists before any consumer runs. This complements the already-correct explicit ordering in `npm run dev` and `npm run build` (both build `shared` first). The build order is now deterministic end-to-end:

```
npm install  ──► prepare ──► build:shared ──► (dist ready)
npm run dev  ──► build:shared ──► concurrently(shared, server, client)
npm run build ──► build:shared ──► build:client ──► build:server
```

### Verified
Simulated a clean install (deleted `shared/dist`), ran `npm run prepare`, then `npm run typecheck` — **0 errors**.

---

## 4. Task 3 — TypeScript Path Aliases

Aliases are configured in all three packages and verified to compile.

### Client (`client/tsconfig.json` + `client/vite.config.ts`)
```json
"paths": {
  "@/*":            ["./src/*"],
  "@components/*":  ["./src/components/*"],
  "@features/*":    ["./src/features/*"],
  "@hooks/*":       ["./src/hooks/*"],
  "@lib/*":         ["./src/lib/*"],
  "@services/*":    ["./src/services/*"],
  "@types/*":       ["./src/types/*"],
  "@utils/*":       ["./src/utils/*"]
}
```
Mirrored in Vite via `resolve.alias` (using `node:url` — hence `@types/node` added to client devDependencies). Existing imports were converted to prove end-to-end resolution:
- `src/App.tsx` → `@/app/providers/AppProviders`, `@/app/router`
- `src/app/router/index.tsx` → `@components/common/Placeholder`, `@components/layout/AppLayout`
- `src/lib/apiClient.ts` → `@/config/env`

Verified in **both** dev (Vite transforms `@/app/...` to `/src/app/...`) and the production build.

### Server (`server/tsconfig.json`)
```json
"paths": {
  "@/*":            ["./src/*"],
  "@config/*":      ["./src/config/*"],
  "@modules/*":     ["./src/modules/*"],
  "@middleware/*":  ["./src/middleware/*"],
  "@utils/*":       ["./src/utils/*"],
  "@types/*":       ["./src/types/*"]
}
```
Verified with a temporary type-check file (removed after): aliases **compile** under NodeNext when the specifier carries the `.js` extension.

> **Important caveat (server):** with `moduleResolution: NodeNext` and a plain `tsc` emit (no bundler), `tsc` does **not** rewrite module specifiers. A *value* import such as `import { env } from '@config/env.js'` would emit that `@config/...` specifier into `dist`, which Node cannot resolve at runtime. Existing server source files therefore keep **relative `.js` imports** (safe in dev via `tsx`, in typecheck, and in `node dist`). Alias imports in server code are safe only for **type-only** imports (elided at emit). If alias-heavy server code is desired later, introduce a bundler (see §6). Dev runtime (`tsx`) resolves *extensionless* aliases.

### Shared (`shared/tsconfig.json`)
```json
"paths": { "@shared/*": ["./src/*"] }
```
Verified to compile.

> **Important caveat (shared):** the emitted `dist/**/*.d.ts` **preserves** alias specifiers (e.g. `@shared/types/common.js`), which consumers (`client`/`server`) cannot resolve — they do not define `@shared` in their own `paths`. Exported types in `shared` must therefore keep **relative** imports. No shared source file uses the alias.

---

## 5. Task 4 — Shared Validation Structure

Created the container for future shared schemas — **no schemas, no business logic**.

- `shared/src/schemas/index.ts` — placeholder module (`export {}`)
- `shared/src/index.ts` — now exports it: `export * from './schemas/index.js'`

The built package mirrors the structure:
```
shared/dist/
├── index.js / index.d.ts        # exports schemas + all shared types
└── schemas/
    └── index.js / index.d.ts    # empty for now
```

When validation is implemented, schemas will be added here (co-located with the existing types) and shared by both client and server. Nothing else changed.

---

## 6. Tooling Verification (Task 5) & Validation Run (Task 6)

All commands were executed and succeeded:

| Check | Result |
|---|---|
| `npm install` (clean, on Windows) | ✅ 425 packages, **0 vulnerabilities** |
| `npm ls react react-dom` | ✅ single `react@19.2.8` / `react-dom@19.2.8` |
| `npm run lint` (client + server) | ✅ 0 errors |
| `npm run typecheck` (client + server + shared) | ✅ 0 errors |
| `npm run build` (shared → client → server) | ✅ Vite production build + `tsc` builds |
| `npm run format:check` | ✅ all files Prettier-clean |
| `npm run prepare` on simulated fresh clone + `typecheck` | ✅ 0 errors |
| Vite dev server (client) | ✅ HTTP 200, aliases resolved, no errors |
| Server env parsing (`tsx` import of `@config/env.js`… via tsx) | ✅ Zod env validation passes |

Remaining recommendations (not implemented — out of sprint scope):
- **Server runtime aliases:** introduce a bundler (e.g. esbuild/tsup) for the server build if alias-based value imports are wanted in production; until then keep relative `.js` imports in server runtime files.
- **Shared package:** keep relative imports for exported types; add subpath exports if the type/schema count grows.
- **CI:** wire `format:check → typecheck → lint → build` into a pipeline once CI/CD is in scope.
- **Tests:** still none — recommend adding a test foundation before business logic (deferred by sprint constraints).

---

## 7. Architecture Confirmation

The approved architecture is **unchanged**:

- Folder organization: preserved. The only additions are *reserved* folders that exist solely to back the requested aliases (`client/src/services`, `client/src/types`, `client/src/utils`, `server/src/types`) and the planned `shared/src/schemas` container. No existing folder was moved, renamed, or removed.
- No new **runtime** libraries were added. (`@types/node` is a dev-only type package required to type the Vite config.)
- No authentication, MongoDB models, API routes, UI, or business logic were implemented.
- No Redux, Zustand, Prisma, Docker, testing frameworks, or CI/CD were added.
- The Express `createApp` factory, ESM/`NodeNext` settings, feature-based `modules`/`features` layout, and the compiled `shared` contract package all remain exactly as approved.

The refinement is strictly additive to configuration and build hygiene.
