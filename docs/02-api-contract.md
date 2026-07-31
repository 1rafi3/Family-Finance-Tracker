# Family Finance Tracker — REST API Contract

| | |
|---|---|
| **Document** | 02-api-contract.md |
| **Status** | Draft for review |
| **Version** | 1.0 |
| **Relates to** | docs/01-domain-model.md (v1.1, authoritative), docs/00-project-requirements.md (PRD) |
| **Purpose** | Complete REST API contract before implementation |

---

## 1. Purpose & Scope

This document defines the REST API for Family Finance Tracker. It is derived **exclusively** from the locked **v1.1 domain model** (`docs/01-domain-model.md`), which remains the authoritative source for entity structure, field rules, and enums. Where this document states a field, enum value, or rule, it matches the domain model unless explicitly flagged as a **transport convention** (a wire-format decision that does not alter the domain).

The contract covers:

- Authentication & authorization (JWT, Admin/Member roles)
- Request/response formats and envelopes
- Validation rules (per entity, taken from the domain model)
- Pagination, sorting, and filtering
- Error handling
- Endpoint reference for every resource
- Future API considerations

---

## 2. Conventions

### 2.1 Base URL & Versioning

- Base URL: `/api/v1` (e.g., `POST /api/v1/auth/login`).
- The version is a **path prefix** and is immutable once released. Breaking changes introduce `/api/v2` (see §9).
- The client must send `Accept: application/json`.

### 2.2 Content Type & Encoding

- Request bodies: `application/json` (UTF-8).
- Response bodies: `application/json`.
- Timestamps: **ISO 8601 UTC** (`2026-07-31T12:34:56.789Z`), sent and received.

### 2.3 IDs

- All IDs are MongoDB `ObjectId`s, serialized as **strings** (24 hex chars). See domain model §2.1.
- Foreign-key references (`ownerId`, `walletId`, `sourceWalletId`, `destinationWalletId`, `subCategoryId`, `superCategoryId`, `tagIds`) are plain ID strings.

### 2.4 Money (transport convention)

The domain model (v1.1, §2.6) leaves **storage** representation (integer poisha vs. `Decimal128`) pending. This contract defines the **wire format** independently:

- Every monetary value (`amount`, `balance`, `targetAmount`, `currentAmount`, `principal`, `remainingBalance`, budget `amount`) is serialized as a **JSON string with exactly 2 decimal places** — e.g., `"1250.50"`, `"0.00"`.
- Negative money is represented with a leading `-` (e.g., `"-250.00"`); the domain allows a negative wallet `balance` at the schema level (see domain §3.2).
- Clients must never send monetary values as JSON numbers (floating-point drift risk). The server **rejects** bare numbers for monetary fields with `400 INVALID_MONEY_FORMAT`.
- `currency` is a three-letter ISO 4217 code; `BDT` for V1.

### 2.5 Enums

All enum values are **UPPERCASE_SNAKE** strings exactly as defined in domain model §2.5:

| Enum | Values |
|---|---|
| `UserRole` | `ADMIN`, `MEMBER` |
| `TransactionType` | `INCOME`, `EXPENSE`, `TRANSFER` |
| `TransactionStatus` | `COMPLETED`, `PENDING`, `CANCELLED` |
| `CategoryType` | `INCOME`, `EXPENSE` |
| `BudgetPeriod` | `MONTHLY`, `YEARLY` |
| `SavingsGoalStatus` | `ACTIVE`, `COMPLETED`, `CANCELLED` |
| `LoanDirection` | `BORROWED`, `LENT` |
| `LoanStatus` | `ACTIVE`, `PAID`, `OVERDUE`, `CANCELLED` |
| `WidgetSize` | `SMALL`, `MEDIUM`, `LARGE` |

Any other casing or free-text value is rejected with `422 VALIDATION_FAILED`.

### 2.6 Audit Fields

Entities carry the domain-model audit fields (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`). The API treats them as:

- **Read-only** for clients on write operations; the server sets `createdAt`/`createdBy` on create and `updatedAt`/`updatedBy` on update.
- `createdBy`/`updatedBy` are the **acting** user; `ownerId` (where present) is the **owning** user and may differ (e.g., an ADMIN records a transaction for another member — domain §3.3).

### 2.7 Boolean & Partial Updates

- Updates use **`PATCH`** with JSON Merge Patch semantics: only provided fields are changed; `null` clears optional fields where allowed.
- `PATCH` never accepts read-only fields (`id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `balance`, `usageCount`, `superCategoryId` denormalized on transactions, `lastLoginAt`). Providing them returns `422 VALIDATION_FAILED`.

### 2.8 Archive (soft delete)

- User-managed entities are **archived, never hard-deleted** (domain §2.3). Archiving is done via `DELETE` (see each resource), which sets `isArchived: true`.
- Archived records remain readable by explicit `isArchived=true` queries but are excluded from active lists and new selections.
- **Historical transactions are never altered** when a referenced category, wallet, or tag is archived (domain §2.3).

---

## 3. Authentication & Authorization

### 3.1 Authentication (JWT)

- All endpoints require a valid Bearer token **except** `GET /api/v1/health` and `POST /api/v1/auth/login` (and `POST /api/v1/auth/register` only when no ADMIN exists yet — bootstrap).
- Token: signed JWT issued by the server. Claims:

  | Claim | Value |
  |---|---|
  | `sub` | User ID |
  | `role` | `ADMIN` \| `MEMBER` |
  | `iat` | issued-at |
  | `exp` | expiry (access token) |

- Header: `Authorization: Bearer <token>`.
- Access-token lifetime: short-lived (e.g., 15 min). Refresh tokens are **future expansion** (domain §3.1 Future Expansion), so V1 clients re-login on expiry; a `401 TOKEN_EXPIRED` signals this.
- On login the server updates the user's `lastLoginAt`.
- Deactivated users (`isActive = false`) cannot authenticate; existing tokens of a deactivated user are rejected (server checks `isActive` per request).

### 3.2 Authorization (RBAC)

| Capability | ADMIN | MEMBER |
|---|---|---|
| Manage members (create member, change role, deactivate) | ✅ | — |
| Create SuperCategories | ✅ | — |
| Edit dashboard layout | ✅ | — |
| Read all family data (incl. other members' owned records) | ✅ | — |
| Manage own Wallets | ✅ | ✅ |
| Create/read/update/archive Transactions | own + on behalf (set `ownerId`) | own only |
| Create SubCategories, Tags, Budgets | ✅ | ✅ |
| Manage own SavingsGoals, Loans | ✅ | ✅ |
| Read family-shared data (Super/SubCategories, Tags, Budgets, Widgets, Layout, Reports) | ✅ | ✅ |

Enforcement is **server-side on every request** (PRD §15). Role/permission claims are never trusted from the client.

### 3.3 Ownership Rules

- **MEMBER** writing an owned entity (Wallet, SavingsGoal, Loan, Transaction) is restricted to their own `ownerId`.
- **ADMIN** may write owned entities for any member by supplying the target `ownerId` (e.g., `POST /transactions` with `ownerId` of another member).
- Reads of owned entities are restricted to the owner, or any ADMIN.
- Family-scoped entities (Budget, SuperCategory, SubCategory, Tag, DashboardLayout) are readable by every member; write rules follow the matrix above.

---

## 4. Response Envelope

All successful responses use a consistent envelope. **HTTP status** is meaningful; the envelope adds structure.

### 4.1 Single resource

```json
{
  "data": { "...resource..." }
}
```

### 4.2 List

```json
{
  "data": [ "...resources..." ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 137,
    "hasMore": true,
    "nextCursor": null
  }
}
```

- `total` is the count matching the filters (before pagination).
- `hasMore` indicates another page exists.
- `nextCursor` is populated only for cursor-paged resources (Transactions, Reports). `page`/`total` remain present for compatibility.

### 4.3 No content

- `204 No Content` with an empty body is used where nothing is returned (e.g., logout, tag unlink).

### 4.4 Errors

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request failed validation.",
    "details": [
      { "field": "amount", "code": "MONEY_GT_ZERO", "message": "Amount must be greater than 0." }
    ]
  }
}
```

- `code`: stable machine-readable error code (see §5).
- `message`: human-readable summary (may be localized by the client).
- `details`: optional; present for `422` and some `409` cases; each entry is field-scoped.

---

## 5. Error Handling

### 5.1 HTTP status codes

| Status | Usage |
|---|---|
| `200 OK` | Successful read/update |
| `201 Created` | Successful create; response body carries the created resource |
| `204 No Content` | Successful operation with no body |
| `400 Bad Request` | Malformed JSON, wrong money format, invalid query parameter syntax |
| `401 Unauthorized` | Missing/invalid/expired token, deactivated user |
| `403 Forbidden` | Authenticated but insufficient role/permission, or non-owner access |
| `404 Not Found` | Resource does not exist, or is archived and queried without `isArchived=true` |
| `409 Conflict` | Uniqueness/state conflict (duplicate name, one-active-budget rule, transfer self-wallet, invalid status transition) |
| `422 Unprocessable Entity` | Validation failure (field-level, per §6) |
| `429 Too Many Requests` | Rate limited (see §9) |
| `500 Internal Server Error` | Unexpected server error (details never exposed) |
| `503 Service Unavailable` | Maintenance / DB unavailable |

### 5.2 Error codes

| Code | Status | Meaning |
|---|---|---|
| `INVALID_JSON` | 400 | Body is not valid JSON |
| `INVALID_MONEY_FORMAT` | 400 | Monetary value not a 2-decimal string |
| `INVALID_QUERY` | 400 | Filter/sort/pagination parameter malformed |
| `UNAUTHENTICATED` | 401 | Token missing |
| `INVALID_CREDENTIALS` | 401 | Bad email/password on login |
| `TOKEN_INVALID` | 401 | Token malformed, expired, or signature invalid |
| `ACCOUNT_INACTIVE` | 401 | User `isActive = false` |
| `FORBIDDEN` | 403 | Role or ownership check failed |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_NAME` | 409 | Case-insensitive unique name violated |
| `BUDGET_ALREADY_EXISTS` | 409 | Active budget exists for SuperCategory+period |
| `TRANSFER_SAME_WALLET` | 409 | `sourceWalletId === destinationWalletId` |
| `INVALID_STATUS_TRANSITION` | 409 | Illegal enum/status change |
| `LAST_ADMIN_DEMOTION` | 409 | Demoting the last remaining ADMIN |
| `ARCHIVED_RESOURCE` | 409 | Operation conflicts with an archived reference |
| `VALIDATION_FAILED` | 422 | Field-level validation errors (`details`) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

### 5.3 Validation failure shape

Each `details` entry targets one field with a stable per-field `code`:

| Field code | Meaning |
|---|---|
| `REQUIRED` | Field missing |
| `TYPE_MISMATCH` | Wrong JSON type |
| `STRING_MIN` / `STRING_MAX` | Length out of range |
| `EMAIL_INVALID` | Not a valid email |
| `MONEY_FORMAT` | Not a 2-decimal string |
| `MONEY_GT_ZERO` | Must be > 0 |
| `MONEY_GTE_ZERO` | Must be ≥ 0 |
| `ENUM_INVALID` | Not a valid enum value |
| `REF_INVALID` | Referenced ID does not exist |
| `REF_ARCHIVED` | Referenced entity is archived |
| `REF_TYPE_MISMATCH` | Referenced entity has the wrong type (e.g., EXPENSE supercategory used as INCOME) |
| `CATEGORY_TYPE_MISMATCH` | Transaction type vs. category type mismatch |
| `DATE_RANGE_INVALID` | `dateFrom` > `dateTo`, or invalid range |
| `UNIQUE_CONSTRAINT` | Uniqueness violated (deduplicated with the parent `409` code where applicable) |
| `MIN` / `MAX` | Numeric range violation (e.g., `periodMonth` 1–12, `interestRate` 0–100) |

---

## 6. Validation Rules (per entity, from domain model v1.1)

The server validates every write against these rules. Rules are sourced from the domain model's per-entity **Fields** tables and **Business Rules**.

### 6.1 User

| Field | Rules |
|---|---|
| `firstName`, `lastName` | required; 1–50 chars |
| `email` | required; valid email; stored lowercase; unique case-insensitive |
| `password` (input) | required on create; min 8 chars; never returned; stored only as bcrypt `passwordHash` |
| `role` | `ADMIN` \| `MEMBER`; default `MEMBER`; only ADMIN may set |
| `isActive` | boolean; default `true` |

Business rules enforced:
- Household must always retain **at least one ADMIN**; demoting the last ADMIN → `409 LAST_ADMIN_DEMOTION`.
- Deactivating a user keeps all historical records intact (domain §3.1).

### 6.2 Wallet

| Field | Rules |
|---|---|
| `ownerId` | required; must reference an existing User |
| `name` | required; 1–50 chars |
| `type` | required; non-empty string; recommended vocabulary `cash`, `bank`, `bkash`, `nagad`, `rocket`, `houseCash`; **additional values allowed** (domain §3.2) |
| `currency` | required; ISO 4217; default `BDT` |
| `balance` | **read-only on write**; denormalized, updated transactionally; negative permitted at schema level (domain §3.2, §2.6) |

- Archive via `DELETE`; an archived wallet is excluded from new transaction selection.

### 6.3 Transaction

Shape depends on `type` (domain §3.3):

| Field | Rules |
|---|---|
| `type` | required; `INCOME` \| `EXPENSE` \| `TRANSFER` |
| `status` | `COMPLETED` (default) \| `PENDING` \| `CANCELLED` |
| `amount` | required; **> 0**; never negative |
| `currency` | required; ISO 4217; default `BDT` |
| `walletId` | required for INCOME/EXPENSE; `null` for TRANSFER |
| `sourceWalletId` | required for TRANSFER; `null` otherwise |
| `destinationWalletId` | required for TRANSFER; **must never equal `sourceWalletId`** (domain §4.1) |
| `ownerId` | required; owning member (MEMBER restricted to self; ADMIN may set another member) |
| `subCategoryId` | required for INCOME/EXPENSE; `null` for TRANSFER |
| `superCategoryId` | **denormalized, read-only** — derived from `subCategoryId` by the server |
| `tagIds` | optional array; zero or more existing, non-archived Tags |
| `notes` | optional; max 500 chars |
| `date` | required; ISO 8601; default now |

Business rules enforced server-side:
- Category required for INCOME/EXPENSE; category `type` must match transaction `type` (`REF_TYPE_MISMATCH` / `CATEGORY_TYPE_MISMATCH`).
- `sourceWalletId` ≠ `destinationWalletId` (`TRANSFER_SAME_WALLET`).
- Balance updates happen **atomically** with the transaction (domain §3.3 Business Rules).
- Status lifecycle (domain §4.1):
  - `PENDING → COMPLETED`: applies the balance.
  - `COMPLETED → PENDING`: reverses the balance application.
  - `→ CANCELLED`: voids the transaction; balance is reversed. Cancelled is terminal.
  - Editing or deleting a transaction recalculates the owning wallet balance(s).
- TRANSFER never affects income/expense totals, budgets, or reports.

### 6.4 SuperCategory

| Field | Rules |
|---|---|
| `name` | required; 1–50 chars; unique per `type`, case-insensitive |
| `type` | required; `INCOME` \| `EXPENSE`; fixed at creation |
| `isSystem` | boolean; default `false`; system-seeded categories are read-only |

- **Only ADMIN may create** (domain §4.3).
- Archive via `DELETE`; archiving preserves SubCategories, Budgets, and historical transactions.

### 6.5 SubCategory

| Field | Rules |
|---|---|
| `superCategoryId` | required; existing SuperCategory |
| `name` | required; 1–50 chars; unique within parent, case-insensitive |
| `type` | required; must equal the parent's type (domain §3.5) |

- Any member may create.
- Archive via `DELETE`.

### 6.6 Budget

| Field | Rules |
|---|---|
| `superCategoryId` | required; must be an **EXPENSE** SuperCategory |
| `amount` | required; **> 0** |
| `currency` | required; ISO 4217; default `BDT` |
| `period` | `MONTHLY` (V1); `YEARLY` (future) |
| `periodYear` | required; int (e.g., `2026`); default current year |
| `periodMonth` | required when `period = MONTHLY`; 1–12 |
| `isArchived` | boolean; default `false` |

- At most **one active budget per SuperCategory per period** (`409 BUDGET_ALREADY_EXISTS`).
- Budget spend aggregates EXPENSE transactions across all members for the period (via denormalized `superCategoryId`).

### 6.7 SavingsGoal

| Field | Rules |
|---|---|
| `ownerId` | required; owning member (MEMBER restricted to self) |
| `name` | required; 1–50 chars |
| `targetAmount` | required; **> 0** |
| `currentAmount` | required; ≥ 0; default `0`; updates limited by status (read-only once COMPLETED/CANCELLED) |
| `currency` | required; ISO 4217; default `BDT` |
| `deadline` | optional; future date allowed |
| `status` | `ACTIVE` (default) \| `COMPLETED` \| `CANCELLED`; transitions `ACTIVE → COMPLETED` (auto when `currentAmount ≥ targetAmount`) or `ACTIVE → CANCELLED` |
| `notes` | optional; max 500 chars |

- Progress percentage is **derived**, never stored (domain §3.7).

### 6.8 Loan

| Field | Rules |
|---|---|
| `ownerId` | required; owning member |
| `direction` | required; `BORROWED` \| `LENT` |
| `counterpartyName` | required; 1–100 chars |
| `principal` | required; **> 0** |
| `interestRate` | optional; 0–100 percent; decimal allowed |
| `currency` | required; ISO 4217; default `BDT` |
| `termMonths` | optional; int > 0 |
| `dueDate` | optional |
| `remainingBalance` | required; ≥ 0; default = principal; `PAID` when 0 |
| `status` | `ACTIVE` (default) \| `PAID` \| `OVERDUE` \| `CANCELLED`; `OVERDUE` when `dueDate < today` and `remainingBalance > 0` |
| `notes` | optional; max 500 chars |

- Loan activity never affects household income/expense totals (domain §3.8).

### 6.9 Tag

| Field | Rules |
|---|---|
| `name` | required; 1–30 chars; unique case-insensitive; trimmed |
| `usageCount` | **read-only**; ≥ 0; denormalized, maintained on link/unlink |
| `isArchived` | boolean; default `false` |

- Archive via `DELETE`; archived tags are removed from new selections; existing transaction links remain valid.
- Optional `color` is **future expansion** (domain §3.9) — not accepted in V1 (`422 VALIDATION_FAILED`).

### 6.10 DashboardWidgetDefinition

- **Read-only in V1** (system-seeded catalog, domain §3.10). No create/update/delete endpoints.
- Fields: `key` (unique, immutable), `title`, `description`, `defaultSize`, `allowedSizes`, `isSystem`, audit fields.

### 6.11 DashboardLayout

| Field | Rules |
|---|---|
| `widgets` | required; array of WidgetPlacement |
| `widgetKey` | required; must reference an existing DashboardWidgetDefinition.key |
| `enabled` | boolean; default `true` |
| `order` | required; ≥ 0; unique within the layout |
| `size` | required; `SMALL` \| `MEDIUM` \| `LARGE`; must be within the definition's `allowedSizes` |

- Household-level **singleton** — `PUT` replaces the whole layout.
- **Only ADMIN may modify**; members read (domain §3.11).

---

## 7. Pagination, Sorting & Filtering

### 7.1 Pagination

Two strategies:

**Offset pagination** (default; small collections — users, wallets, categories, tags, budgets, goals, loans, widget definitions, layout):

| Param | Default | Rules |
|---|---|---|
| `page` | `1` | int ≥ 1 |
| `limit` | `20` | int 1–100 |

**Cursor pagination** (Transactions, Reports; domain §8 recommends `{ date, _id }`):

| Param | Default | Rules |
|---|---|---|
| `limit` | `50` | int 1–200 |
| `cursor` | — | opaque string returned as `pagination.nextCursor`; `null`/absent = first page |

Cursor pages are ordered by `date` descending then `_id` (stable). Do not combine offset and cursor params (`400 INVALID_QUERY`).

### 7.2 Sorting

- Query param `sort`; default per resource documented below.
- Format: comma-separated field names; `-` prefix = descending. Examples: `sort=-date`, `sort=name,type`.
- Only whitelisted fields are accepted; others → `400 INVALID_QUERY`.

Default sorts: Users `-createdAt`, Wallets `createdAt`, Transactions `-date`, Categories `name`, Budgets `periodYear,-periodMonth`, SavingsGoals `-createdAt`, Loans `-createdAt`, Tags `name`, Reports `-period`.

### 7.3 Filtering (query parameters)

**Equality filters** (repeated for OR within the same field, e.g., `?status=ACTIVE,PAID`):

| Param | Applied to |
|---|---|
| `type` | Transactions |
| `status` | Transactions, SavingsGoals, Loans |
| `ownerId` | Wallets, Transactions, SavingsGoals, Loans |
| `walletId` | Transactions |
| `superCategoryId` | SubCategories, Budgets, Transactions |
| `subCategoryId` | Transactions |
| `tagIds` (comma-separated) | Transactions (match any) |
| `period` | Budgets |
| `periodYear`, `periodMonth` | Budgets |
| `direction` | Loans |
| `role`, `isActive` | Users |

**Range filters**:

| Param | Applied to |
|---|---|
| `dateFrom`, `dateTo` | Transactions, Reports (`dateFrom ≤ dateTo` else `400 DATE_RANGE_INVALID`) |
| `amountFrom`, `amountTo` | Transactions |

**Text search**:

| Param | Behavior |
|---|---|
| `search` | Case-insensitive substring match across that entity's **Searchability** fields (domain §2.8, per-entity lists); e.g., Transactions match `notes`, Wallets match `name`/`type`, Loans match `counterpartyName` |

**Archive filter**:

| Param | Behavior |
|---|---|
| `isArchived` | `true` returns archived records; default excludes them for active lists |
| `includeArchived` | `true` returns both; convenience for admin views |

Unknown filter parameters are **ignored** (forward-compatible) rather than rejected.

### 7.4 Filtering examples

```
GET /api/v1/transactions?ownerId=507f1f77bcf86cd799439011&type=EXPENSE&dateFrom=2026-07-01&dateTo=2026-07-31&search=groceries&sort=-date&limit=50
GET /api/v1/budgets?period=MONTHLY&periodYear=2026&periodMonth=7&isArchived=false
GET /api/v1/loans?status=OVERDUE&ownerId=507f1f77bcf86cd799439011
```

---

## 8. Endpoint Reference

All endpoints require JWT unless noted. `*` = ADMIN only.

### 8.1 Health & Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | none | Liveness + dependency status |
| `POST` | `/api/v1/auth/register` | none | Bootstrap first ADMIN (only while zero ADMINS exist) |
| `POST` | `/api/v1/auth/login` | none | Email+password → `{ accessToken, user }` |
| `POST` | `/api/v1/auth/logout` | ✓ | Client-side token discard (no server state in V1) |
| `GET` | `/api/v1/auth/me` | ✓ | Current user profile |
| `PATCH` | `/api/v1/auth/password` | ✓ | Change own password |

`POST /api/v1/auth/register` — **body** (bootstrap only):

```json
{
  "firstName": "Rahim",
  "lastName": "Uddin",
  "email": "rahim@example.com",
  "password": "S3curePass!",
  "role": "ADMIN"
}
```

`POST /api/v1/auth/login` — **request / response**:

```json
{ "email": "rahim@example.com", "password": "S3curePass!" }
```

```json
{
  "data": {
    "accessToken": "eyJhbGciOi...",
    "user": { "id": "507f1f77bcf86cd799439011", "firstName": "Rahim", "lastName": "Uddin", "email": "rahim@example.com", "role": "ADMIN", "isActive": true, "lastLoginAt": "2026-07-31T12:00:00.000Z", "createdAt": "...", "updatedAt": "..." }
  }
}
```

`GET /api/v1/auth/me` — returns the `user` resource without `passwordHash`.

### 8.2 Users

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/users` | * | List members |
| `POST` | `/api/v1/users` | * | Create a member (default role `MEMBER`) |
| `GET` | `/api/v1/users/:id` | * | Member detail |
| `PATCH` | `/api/v1/users/:id` | * | Update name / email / role / isActive |
| `DELETE` | `/api/v1/users/:id` | * | Deactivate (`isActive = false`); keeps records |

`POST /api/v1/users` — **body**:

```json
{
  "firstName": "Salma",
  "lastName": "Begum",
  "email": "salma@example.com",
  "password": "TempP@ss123",
  "role": "MEMBER"
}
```

Rules: role change/demotion must keep ≥1 ADMIN (`409 LAST_ADMIN_DEMOTION`); a member cannot deactivate themselves if last ADMIN.

### 8.3 Wallets

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/wallets` | ✓ | List own (or all for ADMIN); filter `ownerId` |
| `POST` | `/api/v1/wallets` | ✓ | Create wallet |
| `GET` | `/api/v1/wallets/:id` | ✓ | Wallet detail (owner or ADMIN) |
| `PATCH` | `/api/v1/wallets/:id` | ✓ | Update `name` / `type` / `currency` |
| `DELETE` | `/api/v1/wallets/:id` | ✓ | Archive wallet |

`POST /api/v1/wallets` — **body**:

```json
{
  "ownerId": "507f1f77bcf86cd799439011",
  "name": "Bkash",
  "type": "bkash",
  "currency": "BDT"
}
```

**Response** (balance always server-managed):

```json
{
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "ownerId": "507f1f77bcf86cd799439011",
    "name": "Bkash",
    "type": "bkash",
    "currency": "BDT",
    "balance": "0.00",
    "isArchived": false,
    "createdAt": "2026-07-31T12:05:00.000Z",
    "updatedAt": "2026-07-31T12:05:00.000Z",
    "createdBy": "507f1f77bcf86cd799439011",
    "updatedBy": "507f1f77bcf86cd799439011"
  }
}
```

### 8.4 Transactions

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/transactions` | ✓ | Cursor-paged ledger; rich filters |
| `POST` | `/api/v1/transactions` | ✓ | Record income/expense/transfer (atomically updates balances) |
| `GET` | `/api/v1/transactions/:id` | ✓ | Transaction detail |
| `PATCH` | `/api/v1/transactions/:id` | ✓ | Update (recalculates balances) |
| `DELETE` | `/api/v1/transactions/:id` | ✓ | Void as `CANCELLED` (reverses balances); no hard delete |

`POST /api/v1/transactions` — **expense** body:

```json
{
  "type": "EXPENSE",
  "status": "COMPLETED",
  "amount": "1250.50",
  "currency": "BDT",
  "walletId": "507f1f77bcf86cd799439012",
  "ownerId": "507f1f77bcf86cd799439011",
  "subCategoryId": "507f1f77bcf86cd799439020",
  "tagIds": ["507f1f77bcf86cd799439030"],
  "notes": "Groceries for Eid",
  "date": "2026-07-31T10:30:00.000Z"
}
```

`POST /api/v1/transactions` — **transfer** body (`sourceWalletId` ≠ `destinationWalletId`):

```json
{
  "type": "TRANSFER",
  "status": "COMPLETED",
  "amount": "5000.00",
  "currency": "BDT",
  "sourceWalletId": "507f1f77bcf86cd799439012",
  "destinationWalletId": "507f1f77bcf86cd799439013",
  "ownerId": "507f1f77bcf86cd799439011",
  "date": "2026-07-31T11:00:00.000Z"
}
```

**Response** includes the server-derived `superCategoryId` (for INCOME/EXPENSE) and both denormalized wallet balances may be read back via the wallet endpoints.

### 8.5 SuperCategories

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/super-categories` | ✓ | List (filter `type`) |
| `POST` | `/api/v1/super-categories` | * | Create (type fixed at creation) |
| `GET` | `/api/v1/super-categories/:id` | ✓ | Detail |
| `PATCH` | `/api/v1/super-categories/:id` | * | Update `name` |
| `DELETE` | `/api/v1/super-categories/:id` | * | Archive (preserves children/history) |

`POST /api/v1/super-categories`:

```json
{ "name": "Food & Dining", "type": "EXPENSE" }
```

### 8.6 SubCategories

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/sub-categories` | ✓ | List (filter `superCategoryId`) |
| `POST` | `/api/v1/sub-categories` | ✓ | Create (any member) |
| `GET` | `/api/v1/sub-categories/:id` | ✓ | Detail |
| `PATCH` | `/api/v1/sub-categories/:id` | ✓ | Update `name` |
| `DELETE` | `/api/v1/sub-categories/:id` | ✓ | Archive |

`POST /api/v1/sub-categories`:

```json
{ "superCategoryId": "507f1f77bcf86cd799439020", "name": "Groceries" }
```

`type` is derived from the parent; a mismatch is rejected.

### 8.7 Budgets

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/budgets` | ✓ | List (filter `superCategoryId`, `period*`) |
| `POST` | `/api/v1/budgets` | ✓ | Create (one active per SuperCategory+period) |
| `GET` | `/api/v1/budgets/:id` | ✓ | Detail (includes derived `progress` — see below) |
| `PATCH` | `/api/v1/budgets/:id` | ✓ | Update `amount` / `period*` |
| `DELETE` | `/api/v1/budgets/:id` | ✓ | Archive |

`POST /api/v1/budgets`:

```json
{
  "superCategoryId": "507f1f77bcf86cd799439020",
  "amount": "15000.00",
  "currency": "BDT",
  "period": "MONTHLY",
  "periodYear": 2026,
  "periodMonth": 7
}
```

**Derived read-only field** on Budget responses: `progress` (`"62.5"`, a 2-decimal string percentage) = spend / amount × 100 for the period. Computed server-side; never stored.

### 8.8 SavingsGoals

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/savings-goals` | ✓ | List own (or all for ADMIN) |
| `POST` | `/api/v1/savings-goals` | ✓ | Create |
| `GET` | `/api/v1/savings-goals/:id` | ✓ | Detail (includes derived `progressPercentage`) |
| `PATCH` | `/api/v1/savings-goals/:id` | ✓ | Update (e.g., `currentAmount`, status) |
| `DELETE` | `/api/v1/savings-goals/:id` | ✓ | Archive |

`POST /api/v1/savings-goals`:

```json
{
  "ownerId": "507f1f77bcf86cd799439011",
  "name": "Hajj Fund",
  "targetAmount": "500000.00",
  "currentAmount": "120000.00",
  "currency": "BDT",
  "deadline": "2027-03-31T00:00:00.000Z",
  "notes": "Monthly contribution 10k"
}
```

`progressPercentage` is derived (`currentAmount / targetAmount × 100`, may exceed 100 — domain §3.7) and returned as a 2-decimal string.

### 8.9 Loans

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/loans` | ✓ | List own (or all for ADMIN); filter `status`/`direction` |
| `POST` | `/api/v1/loans` | ✓ | Create |
| `GET` | `/api/v1/loans/:id` | ✓ | Detail |
| `PATCH` | `/api/v1/loans/:id` | ✓ | Update (e.g., `remainingBalance`, `status`) |
| `DELETE` | `/api/v1/loans/:id` | ✓ | Archive |

`POST /api/v1/loans`:

```json
{
  "ownerId": "507f1f77bcf86cd799439011",
  "direction": "BORROWED",
  "counterpartyName": "Brother-in-law",
  "principal": "20000.00",
  "interestRate": 0,
  "currency": "BDT",
  "dueDate": "2026-10-31T00:00:00.000Z",
  "notes": "Home repair"
}
```

`remainingBalance` defaults to `principal`; server sets `PAID` when it reaches `0.00`.

### 8.10 Tags

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/tags` | ✓ | List |
| `POST` | `/api/v1/tags` | ✓ | Create |
| `GET` | `/api/v1/tags/:id` | ✓ | Detail |
| `PATCH` | `/api/v1/tags/:id` | ✓ | Update `name` |
| `DELETE` | `/api/v1/tags/:id` | ✓ | Archive |

`POST /api/v1/tags`:

```json
{ "name": "Eid" }
```

`usageCount` is denormalized and read-only; it increments/decrements as transactions link/unlink the tag. Tagging is done via `Transaction.tagIds`, not standalone link endpoints.

### 8.11 Dashboard

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/widget-definitions` | ✓ | List catalog (read-only) |
| `GET` | `/api/v1/dashboard-layout` | ✓ | Get singleton layout |
| `PUT` | `/api/v1/dashboard-layout` | * | Replace layout (full document) |

`PUT /api/v1/dashboard-layout` — **body**:

```json
{
  "widgets": [
    { "widgetKey": "current-balance", "enabled": true, "order": 1, "size": "LARGE" },
    { "widgetKey": "income", "enabled": true, "order": 2, "size": "SMALL" },
    { "widgetKey": "expense", "enabled": true, "order": 3, "size": "SMALL" },
    { "widgetKey": "savings-progress", "enabled": false, "order": 4, "size": "MEDIUM" }
  ]
}
```

### 8.12 Reports (read-only analytics)

Reports aggregate over the domain rules (income/expense only; **transfers excluded**; analytics at SuperCategory level — domain §4.1, §4.3). All reports support `dateFrom`/`dateTo` and the shared filters, plus cursor pagination on high-volume results.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/reports/overview` | Dashboard summary: total balance per wallet, month income, month expense, net, top SuperCategories |
| `GET` | `/api/v1/reports/monthly` | Monthly income/expense per SuperCategory for a month range |
| `GET` | `/api/v1/reports/yearly` | Yearly income/expense per SuperCategory |
| `GET` | `/api/v1/reports/category` | Breakdown by SuperCategory (and optional SubCategory drill-down) |
| `GET` | `/api/v1/reports/wallet` | Flow per wallet (income/expense/transfers) |
| `GET` | `/api/v1/reports/member` | Per-member income/expense |
| `GET` | `/api/v1/reports/savings` | Goal progress summary |
| `GET` | `/api/v1/reports/loans` | Borrowed vs. lent, outstanding balances, overdue |
| `GET` | `/api/v1/reports/tags` | Spend/income grouped by tag |

**Sample** — `GET /api/v1/reports/monthly?periodYear=2026&periodMonth=7`:

```json
{
  "data": [
    {
      "period": "2026-07",
      "superCategoryId": "507f1f77bcf86cd799439020",
      "superCategoryName": "Food & Dining",
      "income": "0.00",
      "expense": "1250.50",
      "net": "-1250.50"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 8, "hasMore": false, "nextCursor": null }
}
```

Money in report payloads uses the same 2-decimal string convention; net may be negative.

### 8.13 Health

`GET /api/v1/health` — **response**:

```json
{
  "status": "ok",
  "checks": { "database": "ok" },
  "timestamp": "2026-07-31T12:00:00.000Z"
}
```

Returns `503` with `status: "degraded"` when MongoDB is unreachable.

---

## 9. Future API Considerations

These do not change V1 behavior; they guide evolution and are recorded here so V1 design does not paint itself into a corner.

1. **Money storage decision** — when integer-poisha vs. `Decimal128` is finalized (domain §2.6), only the storage layer changes; the 2-decimal string wire format is unaffected.
2. **Multi-family (`householdId`)** — when households are added (domain §9), family-scoped endpoints gain a `householdId` path segment or header scoping. V1 routes must keep the current unscoped semantics for the single household.
3. **Refresh tokens & token rotation** — domain §3.1 Future Expansion; add `POST /auth/refresh` and `POST /auth/revoke`; revocation needs a token store (server-side `jti` blocklist).
4. **Notifications** — a future `Notification` entity is anticipated (domain §9). Planned surface: `GET /notifications`, `PATCH /notifications/:id` (mark read), `PATCH /notifications/read-all`, plus server-generated alerts for budget warnings (`warningThreshold`, domain §3.6 Future Expansion) and loan overdue reminders.
5. **API versioning strategy** — path-prefix versioning (`/api/v1`, then `/api/v2`). Deprecation: announce ≥ 1 release ahead; return `Sunset` header; keep deprecated minor endpoints behind `Deprecation` header during overlap.
6. **Rate limiting** — per-user token bucket on all endpoints; `429 RATE_LIMITED` with `Retry-After`. Health/login get stricter limits; sensitive mutations (login, password change, user management) rate-limited aggressively.
7. **Idempotency** — `Idempotency-Key` header on `POST` creates (Transactions especially) so retries cannot double-post. V1 Transactions are the highest-value candidate.
8. **Conditional requests / optimistic concurrency** — `ETag`/`If-Match` on `PATCH`/`PUT` for `DashboardLayout` (singleton, admin-shared) and Transactions, to prevent lost updates.
9. **Audit logging endpoints (future)** — PRD §15 lists audit logging as future; when added, expose `GET /audit-logs` (ADMIN) with cursor pagination.
10. **Webhooks / data export** — export endpoints (`GET /reports/*.csv`) and outbound webhooks for recurring notifications are anticipated; design reports to reuse the same aggregation pipelines.
11. **OpenAPI generation** — the contract should be emitted as an OpenAPI 3.1 spec from the shared types/schemas to keep client/server in sync; the shared `schemas` package (Zod) is the single source of truth once implemented.
12. **Performance** — high-volume list endpoints follow domain §8: cursor pagination on `{ date, _id }`, indexed `$match` first, archived exclusion via partial indexes. API design already supports this (Transactions/Reports use cursors).

---

## 10. Consistency Matrix

Quick reference mapping endpoint families to the domain entities (domain model v1.1):

| Endpoint family | Domain entity (§3.x) | Key validation authority |
|---|---|---|
| `/auth/*`, `/users` | User (§3.1) | §6.1 |
| `/wallets` | Wallet (§3.2) | §6.2 |
| `/transactions` | Transaction (§3.3) | §6.3 |
| `/super-categories` | SuperCategory (§3.4) | §6.4 |
| `/sub-categories` | SubCategory (§3.5) | §6.5 |
| `/budgets` | Budget (§3.6) | §6.6 |
| `/savings-goals` | SavingsGoal (§3.7) | §6.7 |
| `/loans` | Loan (§3.8) | §6.8 |
| `/tags` | Tag (§3.9) | §6.9 |
| `/widget-definitions` | DashboardWidgetDefinition (§3.10) | §6.10 |
| `/dashboard-layout` | DashboardLayout (§3.11) | §6.11 |
| `/reports/*` | derived (Transaction + entity joins) | domain §4.1, §4.3 |

This document is a **contract artifact**. Any change to the domain model (v1.1+) must be reflected here before implementation; the domain model remains authoritative.
