# Family Finance Tracker — Domain & Database Design

| | |
|---|---|
| **Document** | 01-domain-model.md |
| **Status** | Approved — Master Blueprint |
| **Version** | 1.1 |
| **Relates to** | docs/00-project-requirements.md (PRD) |
| **Purpose** | Master blueprint for the data model before MongoDB implementation |

---

## 1. Purpose & Scope

This document defines the complete domain model for Family Finance Tracker. It is the authoritative reference for entity structure, field-level rules, relationships, and database design. MongoDB models, APIs, and frontend components shall be implemented against this blueprint.

Version 1 targets a **single household (one family)**. Ownership is nevertheless explicit on every entity so that the data model can be extended to multiple households in the future without redesign.

---

## 2. Global Conventions & Rules

### 2.1 Naming & Identity

- **Field naming:** camelCase.
- **Entity naming:** singular (e.g., `Wallet`, not `Wallets`).
- **Enum values:** UPPERCASE_SNAKE (e.g., `ACTIVE`, `INCOME`). Free-text values such as `"done"` or `"finished"` are forbidden wherever an enum exists.
- **IDs:** MongoDB `ObjectId`, serialized as `string` across the API. Foreign keys are referenced by their ID.

### 2.2 Audit Fields

Every entity carries:

| Field | Type | Rule |
|---|---|---|
| `createdAt` | ISODate | Always present, set on create. |
| `updatedAt` | ISODate | Always present, updated on every write. |
| `createdBy` | ObjectId (User) | Present where a user performed the create; **optional for system-generated records** (e.g., seeded categories, widget definitions). |
| `updatedBy` | ObjectId (User) | Present where a user performed the update; optional for system writes. |

### 2.3 Soft Delete / Archive

- For user-managed entities, **prefer archiving over hard deletion**. Applies to: `Wallet`, `SuperCategory`, `SubCategory`, `Tag`, `Budget`, `SavingsGoal`, `Loan`.
- Each such entity includes `isArchived: boolean` (default `false`).
- An archived entity is hidden from active lists and new selections, but **never deleted**.
- **Historical transactions must always remain valid.** Archiving a category, wallet, or tag must never break or alter existing transactions that reference it.

### 2.4 Ownership Model

Ownership is explicit on every entity. In Version 1 there is exactly one family; this is represented implicitly, with a future `householdId` as the expansion path.

| Entity | Owner |
|---|---|
| User | Self (account holder) |
| Wallet | One User |
| SavingsGoal | One User |
| Loan | One User |
| Transaction | One User (owner) |
| Budget | The Family |
| SuperCategory | The Family |
| SubCategory | The Family |
| Tag | The Family |
| DashboardWidgetDefinition | The Family (system-defined catalog) |
| DashboardLayout | The Family (household-level singleton) |

### 2.5 Status & Type Enums

All enumerable fields use enums:

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

### 2.6 Money Strategy

- **Currency:** `BDT` for Version 1. A `currency` field is present on every monetary entity to keep the model currency-aware.
- **Non-negativity:** transaction amounts must **never be negative**. Entry-time validation rejects negative values; direction is expressed by the transaction `type`, not by the sign of the amount. **Enforcement is application logic, not a schema constraint** — the schema does not reject negatives, so future business rules may allow them (e.g., a wallet balance going negative; see 3.2).
- **Precision strategy:** a single consistent money strategy applies to all monetary fields.
  - Values use a fixed scale of **2 decimal places** (BDT poisha, i.e., 1 BDT = 100 poisha).
  - **Recommended storage:** integer minor units (poisha) to eliminate floating-point drift, OR a fixed-precision decimal type (`Decimal128`). **Final decision (integer poisha vs. decimal) is pending** — the model does not depend on it; only the storage representation differs.
  - Arithmetic on sums (balances, budgets, report totals) must never be performed in raw JavaScript floating point.

### 2.7 Notes Fields

Optional free-text notes are supported on:

- `Transaction.notes`
- `Loan.notes`
- `SavingsGoal.notes`

Notes are for human context (e.g., *"Bought groceries for Eid."*). They are searchable (see 2.8) but carry no business meaning.

### 2.8 Searchability

Fields expected to be searchable are listed per entity (see each entity's **Searchability** subsection) and are used to guide index design (§7). General rule: any field a user can filter on in the UI is marked searchable.

---

## 3. Entities

---

### 3.1 User

**Purpose:** Identity, authentication, and role of each family member.

**Description:** One record per person with an account in the household. A User owns their wallets, transactions, savings goals, and loans, and acts on family-level entities.

**Fields**

| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| `id` | ObjectId | Yes | — | Generated |
| `firstName` | string | Yes | — | 1–50 chars |
| `lastName` | string | Yes | — | 1–50 chars |
| `email` | string | Yes | — | Valid email, stored lowercase, unique (case-insensitive) |
| `passwordHash` | string | Yes | — | bcrypt hash; plaintext never stored |
| `role` | UserRole | Yes | `MEMBER` | `ADMIN` \| `MEMBER` |
| `isActive` | boolean | Yes | `true` | — |
| `lastLoginAt` | ISODate | No | — | — |
| `createdAt` | ISODate | Yes | now | — |
| `updatedAt` | ISODate | Yes | now | — |
| `createdBy` | ObjectId | No | — | Optional — first account is system-seeded |
| `updatedBy` | ObjectId | No | — | — |

**Relationships**

- Owns `1..*` Wallets
- Owns `0..*` Transactions (as owner)
- Owns `0..*` SavingsGoals
- Owns `0..*` Loans
- Creates `0..*` SubCategories, Tags

**Business Rules**

- The household must always have **at least one ADMIN**.
- An ADMIN can promote a MEMBER to ADMIN and demote an ADMIN to MEMBER.
- An ADMIN cannot demote themselves if they are the last remaining ADMIN.
- Only ADMINs can create SuperCategories.
- Deactivation (`isActive = false`) disables login but preserves all historical records.

**Searchability:** `email`, `firstName`, `lastName`, `role`, `isActive`.

**Future Expansion:** `householdId`, refresh-token storage, profile preferences, notification settings.

---

### 3.2 Wallet

**Purpose:** A balance container owned by one family member.

**Description:** Represents a store of money (cash, bank account, mobile-money wallet, etc.). Wallet type is a **free-form string** so that new wallet kinds can be added **without schema changes**.

**Fields**

| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| `id` | ObjectId | Yes | — | Generated |
| `ownerId` | ObjectId (User) | Yes | — | Must reference an existing User |
| `name` | string | Yes | — | 1–50 chars |
| `type` | string | Yes | `cash` | Non-empty string. Recommended vocabulary: `cash`, `bank`, `bkash`, `nagad`, `rocket`, `houseCash`. Additional values allowed by design. |
| `currency` | string | Yes | `BDT` | ISO 4217 code |
| `balance` | Money | Yes | `0` | Any number — **negative values are permitted by the schema**; non-negativity is an application-level rule that future business rules may relax. **Denormalized**; updated transactionally with every linked transaction/transfer. |
| `isArchived` | boolean | Yes | `false` | — |
| `createdAt` | ISODate | Yes | now | — |
| `updatedAt` | ISODate | Yes | now | — |
| `createdBy` | ObjectId | Yes | — | The owning member |
| `updatedBy` | ObjectId | Yes | — | — |

**Relationships**

- Belongs to exactly **one User**.
- Has `0..*` Transactions as `walletId` (INCOME/EXPENSE).
- Is referenced by `0..*` Transfers as `sourceWalletId` or `destinationWalletId`.

**Business Rules**

- A wallet belongs to exactly one user.
- The schema does **not** enforce a non-negative balance; whether a negative balance is allowed is a business rule enforced in application logic (future rules may permit overdrafts).
- Wallet type is intentionally **not an enum** — future wallet types (e.g., a new mobile-money provider) require no schema or code-enum change.
- A Transfer updates the balance of exactly two wallets (source down, destination up).
- Archiving hides the wallet from new entry selection but preserves its balance and all history.

**Searchability:** `name`, `type`, `ownerId`, `isArchived`.

**Future Expansion:** shared wallets, bank/mobile-money synchronization metadata, wallet-level budgets.

---

### 3.3 Transaction

**Purpose:** The single source of truth for all money movement: income, expense, and wallet transfer.

**Description:** A Transaction records one money event. Its shape depends on `type` (see 4.1 Transaction Rules).

**Fields**

| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| `id` | ObjectId | Yes | — | Generated |
| `type` | TransactionType | Yes | — | `INCOME` \| `EXPENSE` \| `TRANSFER` |
| `status` | TransactionStatus | Yes | `COMPLETED` | `COMPLETED` \| `PENDING` \| `CANCELLED` |
| `amount` | Money | Yes | — | **> 0**, never negative |
| `currency` | string | Yes | `BDT` | ISO 4217 |
| `walletId` | ObjectId (Wallet) | Only for `INCOME`/`EXPENSE` | — | `null` for `TRANSFER` |
| `sourceWalletId` | ObjectId (Wallet) | Only for `TRANSFER` | — | `null` otherwise |
| `destinationWalletId` | ObjectId (Wallet) | Only for `TRANSFER` | — | Must differ from `sourceWalletId` (never the same wallet) |
| `ownerId` | ObjectId (User) | Yes | — | The member who **owns** the transaction; may differ from `createdBy` |
| `subCategoryId` | ObjectId (SubCategory) | Only for `INCOME`/`EXPENSE` | — | `null` for `TRANSFER` |
| `superCategoryId` | ObjectId (SuperCategory) | Only for `INCOME`/`EXPENSE` | — | **Denormalized** from `subCategoryId` for analytics |
| `tagIds` | ObjectId[] (Tag) | No | `[]` | Zero or more references |
| `notes` | string | No | — | Max 500 chars |
| `date` | ISODate | Yes | now | Effective date of the transaction |
| `createdAt` | ISODate | Yes | now | — |
| `updatedAt` | ISODate | Yes | now | — |
| `createdBy` | ObjectId | Yes | — | The **acting** member who recorded the transaction; may differ from `ownerId` (e.g., an ADMIN recording a transaction on another member's behalf) |

**Relationships**

- Belongs to one User (`ownerId`).
- References one Wallet (`walletId`) **or** two Wallets (`sourceWalletId` / `destinationWalletId`).
- References one SubCategory (INCOME/EXPENSE) which belongs to one SuperCategory (denormalized on the transaction).
- Has `0..*` Tags (many-to-many via `tagIds`).

**Business Rules**

- `TRANSFER` never affects household income or expense totals (see 4.1).
- `sourceWalletId` and `destinationWalletId` must **never be the same** wallet — a transfer must always move money between two distinct wallets.
- `ownerId` and `createdBy` may differ: the owner is who the transaction belongs to; the creator is who recorded it (e.g., an ADMIN recording a transaction for another member).
- Amount is always positive; direction comes from `type`.
- `status` lifecycle: `PENDING` (recorded, not yet effective) → `COMPLETED` (default, effective and balance-applied), or `CANCELLED` (voided; balance must be reversed).
- Category is required for INCOME/EXPENSE; category `type` must match the transaction `type`.
- Wallet balance(s) must be updated atomically with the transaction.
- Editing or deleting a transaction recalculates the owning wallet's balance.
- Archiving a referenced category/wallet/tag must not invalidate this transaction.

**Searchability:** `date`, `amount`, `type`, `category` (via `subCategoryId` / `superCategoryId`), `wallet`, `tag` (via `tagIds`), `ownerId`, `notes`.

**Future Expansion:** recurring transactions, attachments, original currency/amount, reversal/void links.

---

### 3.4 SuperCategory

**Purpose:** Top-level grouping of categories used for analytics, budgets, and reports.

**Description:** The first level of the two-level category system. All analytics roll up to the Super Category level.

**Fields**

| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| `id` | ObjectId | Yes | — | Generated |
| `name` | string | Yes | — | 1–50 chars, unique per `type` (case-insensitive) |
| `type` | CategoryType | Yes | — | `INCOME` \| `EXPENSE`; fixed at creation |
| `isSystem` | boolean | Yes | `false` | System-seeded categories |
| `isArchived` | boolean | Yes | `false` | — |
| `createdAt` | ISODate | Yes | now | — |
| `updatedAt` | ISODate | Yes | now | — |
| `createdBy` | ObjectId | Yes | — | Must be an ADMIN |
| `updatedBy` | ObjectId | Yes | — | — |

**Relationships**

- Belongs to the Family.
- Has `1..*` SubCategories.
- Has `0..*` Budgets.
- Is referenced (denormalized) by `0..*` Transactions.

**Business Rules**

- **Only an ADMIN can create a Super Category.**
- Duplicate names are discouraged via case-insensitive uniqueness per type.
- Archive instead of delete. Archiving preserves all SubCategories, Budgets, and historical transactions.
- Analytics are always computed at the Super Category level.

**Searchability:** `name`, `type`, `isArchived`.

**Future Expansion:** display order, per-period default budgets, icon.

---

### 3.5 SubCategory

**Purpose:** Specific value under a Super Category.

**Description:** The second level of the two-level category system. Every transaction is categorized to a Sub Category; its Super Category is derived.

**Fields**

| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| `id` | ObjectId | Yes | — | Generated |
| `superCategoryId` | ObjectId (SuperCategory) | Yes | — | Must reference an existing SuperCategory |
| `name` | string | Yes | — | 1–50 chars, unique within parent (case-insensitive) |
| `type` | CategoryType | Yes | — | Must match the parent Super Category's type |
| `isArchived` | boolean | Yes | `false` | — |
| `createdAt` | ISODate | Yes | now | — |
| `updatedAt` | ISODate | Yes | now | — |
| `createdBy` | ObjectId | Yes | — | Any member |
| `updatedBy` | ObjectId | Yes | — | — |

**Relationships**

- Belongs to exactly **one SuperCategory**.
- Is referenced by `0..*` Transactions.

**Business Rules**

- **Any member can create a Sub Category.**
- Every Sub Category belongs to exactly one Super Category. No orphaned or shared Sub Categories.
- `type` is inherited from and must equal the parent's type.
- Duplicate names within a parent are discouraged (case-insensitive).
- Archiving hides the Sub Category from new transaction entry and reports; existing transactions remain valid and unchanged.

**Searchability:** `name`, `superCategoryId`, `isArchived`.

**Future Expansion:** per-member default subcategories, aliases.

---

### 3.6 Budget

**Purpose:** A spending limit for the family per Super Category per period.

**Description:** Monthly budgets (V1) per Super Category, aggregated across all members.

**Fields**

| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| `id` | ObjectId | Yes | — | Generated |
| `superCategoryId` | ObjectId (SuperCategory) | Yes | — | Must be an EXPENSE SuperCategory |
| `amount` | Money | Yes | — | **> 0** |
| `currency` | string | Yes | `BDT` | ISO 4217 |
| `period` | BudgetPeriod | Yes | `MONTHLY` | `MONTHLY` (V1), `YEARLY` (future) |
| `periodYear` | int | Yes | current year | e.g., `2026` |
| `periodMonth` | int | No | — | 1–12; required when `period = MONTHLY` |
| `isArchived` | boolean | Yes | `false` | — |
| `createdAt` | ISODate | Yes | now | — |
| `updatedAt` | ISODate | Yes | now | — |
| `createdBy` | ObjectId | Yes | — | The acting member |
| `updatedBy` | ObjectId | Yes | — | — |

**Relationships**

- Belongs to the Family (household-level).
- References one EXPENSE SuperCategory.

**Business Rules**

- At most **one active budget per SuperCategory per period**.
- Progress = sum of EXPENSE transactions in that SuperCategory for the period (enabled by the denormalized `superCategoryId` on transactions).
- Budget spend aggregates across all members.
- Archiving a budget stops it from appearing in active views but preserves the record.

**Searchability:** `superCategoryId`, `periodYear`, `periodMonth`, `amount`, `isArchived`.

**Future Expansion:** yearly budgets, carry-over, `warningThreshold` (optional spend-warning level, e.g. 80% of the budget amount), over-budget notifications.

---

### 3.7 SavingsGoal

**Purpose:** A personal savings target with progress tracking.

**Description:** A member-defined goal with a target amount, current progress, optional deadline, and lifecycle status.

**Fields**

| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| `id` | ObjectId | Yes | — | Generated |
| `ownerId` | ObjectId (User) | Yes | — | The owning member |
| `name` | string | Yes | — | 1–50 chars |
| `targetAmount` | Money | Yes | — | **> 0** |
| `currentAmount` | Money | Yes | `0` | ≥ 0 |
| `currency` | string | Yes | `BDT` | ISO 4217 |
| `deadline` | ISODate | No | — | May be in the future |
| `status` | SavingsGoalStatus | Yes | `ACTIVE` | `ACTIVE` \| `COMPLETED` \| `CANCELLED` |
| `notes` | string | No | — | Max 500 chars |
| `isArchived` | boolean | Yes | `false` | — |
| `createdAt` | ISODate | Yes | now | — |
| `updatedAt` | ISODate | Yes | now | — |
| `createdBy` | ObjectId | Yes | — | The owner |
| `updatedBy` | ObjectId | Yes | — | — |

**Relationships**

- Belongs to exactly **one User**.

**Business Rules**

- **Progress percentage is derived** — `currentAmount / targetAmount × 100` (may exceed 100; not stored).
- Contributions to a goal do **not** affect household income/expense totals unless separately recorded.
- Status transitions: `ACTIVE → COMPLETED` (when `currentAmount ≥ targetAmount`, manual or automatic), `ACTIVE → CANCELLED`. Completed/Cancelled goals are read-only for progress.
- Archiving hides the goal from active lists; the record is retained.

**Searchability:** `name`, `ownerId`, `status`, `deadline`, `isArchived`.

**Future Expansion:** linked contribution transactions, auto-transfer from wallets.

---

### 3.8 Loan

**Purpose:** Tracks money borrowed or lent by a family member.

**Description:** A single record representing one borrowing or lending relationship.

**Fields**

| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| `id` | ObjectId | Yes | — | Generated |
| `ownerId` | ObjectId (User) | Yes | — | The owning member |
| `direction` | LoanDirection | Yes | — | `BORROWED` \| `LENT` |
| `counterpartyName` | string | Yes | — | 1–100 chars |
| `principal` | Money | Yes | — | **> 0** |
| `interestRate` | number | No | — | 0–100 (percent); decimal allowed |
| `currency` | string | Yes | `BDT` | ISO 4217 |
| `termMonths` | int | No | — | > 0 |
| `dueDate` | ISODate | No | — | — |
| `remainingBalance` | Money | Yes | = principal | ≥ 0 |
| `status` | LoanStatus | Yes | `ACTIVE` | `ACTIVE` \| `PAID` \| `OVERDUE` \| `CANCELLED` |
| `notes` | string | No | — | Max 500 chars |
| `isArchived` | boolean | Yes | `false` | — |
| `createdAt` | ISODate | Yes | now | — |
| `updatedAt` | ISODate | Yes | now | — |
| `createdBy` | ObjectId | Yes | — | The owner |
| `updatedBy` | ObjectId | Yes | — | — |

**Relationships**

- Belongs to exactly **one User**.

**Business Rules**

- `direction` distinguishes borrowed vs. lent; principal and remaining balance are always non-negative.
- Repayments/payments reduce `remainingBalance`; `PAID` when `remainingBalance = 0`.
- `OVERDUE` applies when `dueDate < today` and `remainingBalance > 0` (derived or maintained by a routine).
- `CANCELLED` is a manual lifecycle status (e.g., agreement voided).
- Loan activity never affects household income/expense totals.
- Archiving hides the loan from active views; the record is retained.

**Searchability:** `counterpartyName`, `ownerId`, `direction`, `status`, `dueDate`, `isArchived`.

**Future Expansion:** payment schedules, repayment transactions, linked wallet transfers.

---

### 3.9 Tag

**Purpose:** Optional, family-managed labels attached to transactions for search and reporting.

**Description:** Free-form labels shared across the household. Tags form a many-to-many relationship with transactions.

**Fields**

| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| `id` | ObjectId | Yes | — | Generated |
| `name` | string | Yes | — | 1–30 chars, unique (case-insensitive), trimmed |
| `usageCount` | int | Yes | `0` | ≥ 0; **denormalized**, maintained on link/unlink |
| `isArchived` | boolean | Yes | `false` | — |
| `createdAt` | ISODate | Yes | now | — |
| `updatedAt` | ISODate | Yes | now | — |
| `createdBy` | ObjectId | No | — | Optional — family-managed |
| `updatedBy` | ObjectId | No | — | — |

**Relationships**

- Belongs to the Family.
- Has `0..*` Transactions (many-to-many through `Transaction.tagIds`).

**Business Rules**

- Tags are optional (a transaction may have zero tags).
- Duplicate names are discouraged via case-insensitive uniqueness.
- Tags improve searching and reporting (filter/group by tag).
- Archiving a tag removes it from new selections; existing transaction links remain valid.

**Searchability:** `name`, `isArchived`.

**Future Expansion:** optional `color` (UI display, e.g. a hex code), auto-suggest, tag management UI.

---

### 3.10 DashboardWidgetDefinition

**Purpose:** The catalog of available dashboard widget types.

**Description:** A system-managed, read-only registry describing every widget the dashboard can display. Admin users pick from this catalog when customizing the layout.

**Fields**

| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| `id` | ObjectId | Yes | — | Generated |
| `key` | string | Yes | — | Unique, immutable machine key (e.g., `current-balance`, `income`, `expense`, `savings-progress`) |
| `title` | string | Yes | — | Display title (e.g., "Current Balance") |
| `description` | string | No | — | Help text |
| `defaultSize` | WidgetSize | Yes | `MEDIUM` | `SMALL` \| `MEDIUM` \| `LARGE` |
| `allowedSizes` | WidgetSize[] | No | — | If absent, all sizes allowed |
| `isSystem` | boolean | Yes | `true` | System-defined catalog entry |
| `createdAt` | ISODate | Yes | now | — |
| `updatedAt` | ISODate | Yes | now | — |
| `createdBy` | ObjectId | No | — | Optional — system-seeded |
| `updatedBy` | ObjectId | No | — | — |

**Relationships**

- Belongs to the Family (system catalog).
- Referenced by `DashboardLayout.widgets[].widgetKey`.

**Business Rules**

- The catalog is **read-only in V1**; new widget types are added by developers (seeded data).
- `key` is immutable once shipped.
- Each available widget type has a sensible `defaultSize` and optional `allowedSizes` constraints.

**Searchability:** `key`, `title` (configuration data; not a primary search target).

**Future Expansion:** custom/user-defined widget definitions, pluggable widget components.

---

### 3.11 DashboardLayout

**Purpose:** Stores the admin's customization of the household dashboard.

**Description:** A household-level singleton document describing which widgets are enabled, their order, and their size.

**Fields**

| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| `id` | ObjectId | Yes | — | Generated; singleton document |
| `widgets` | WidgetPlacement[] | Yes | `[]` | Embedded array (see below) |
| `createdAt` | ISODate | Yes | now | — |
| `updatedAt` | ISODate | Yes | now | — |
| `updatedBy` | ObjectId | Yes | — | The ADMIN who customized the layout |

**WidgetPlacement (embedded object)**

| Field | Type | Required | Default | Validation |
|---|---|---|---|---|
| `widgetKey` | string | Yes | — | Must reference a DashboardWidgetDefinition.key |
| `enabled` | boolean | Yes | `true` | — |
| `order` | int | Yes | — | ≥ 0; unique within the layout |
| `size` | WidgetSize | Yes | definition's `defaultSize` | Must be within the definition's `allowedSizes` |

**Example**

```
Widget:    Current Balance
Enabled:   true
Order:     1
Size:      LARGE
```

**Relationships**

- Belongs to the Family (household-level singleton — one layout per household in V1).
- References `1..*` DashboardWidgetDefinitions.

**Business Rules**

- **Admins control the layout** (enable/disable, reorder, resize).
- Exactly one active layout exists per household (singleton document).
- `order` values are unique; disabling a widget keeps its placement but suppresses rendering.
- New widget definitions (added in future releases) are appended with their `defaultSize` and enabled.
- Non-admin members read the layout but cannot modify it.

**Searchability:** not a search target (configuration data).

**Future Expansion:** per-user layout overrides, multiple dashboard sections/tabs, grid-based sizing.

---

## 4. Domain Rules

### 4.1 Transaction Rules

- Three types exist: `INCOME`, `EXPENSE`, `TRANSFER`.
- A status exists on every transaction: `COMPLETED` (default, balance applied), `PENDING` (recorded but not yet effective), or `CANCELLED` (voided; balance reversed).
- **A Transfer is ONLY a wallet movement.** It moves funds between two wallets and **never affects family income or expense totals.** Transfers are excluded from budgets, reports, and analytics aggregates.
- `sourceWalletId` and `destinationWalletId` must **never be the same** wallet.
- Every transaction belongs to: a wallet (or two for transfers), an owner, a category (income/expense only), optional tags, a date, and an amount.
- `ownerId` (owner) and `createdBy` (acting recorder) may differ.
- Amount is always positive; the sign is implied by type.

### 4.2 Wallet Rules

- A wallet belongs to exactly one user.
- The schema does **not** enforce a non-negative balance; whether negative balances are allowed is an application-level business rule (see 3.2).
- Supported types: `cash`, `bank`, `bkash`, `nagad`, `rocket`, `houseCash`.
- **Future wallet types must be supported without schema changes** — `type` is a free-form string.
- Transfers between wallets are not income or expense; they are wallet transfers.

### 4.3 Category Rules

- Two levels: **Super Category → Sub Category**.
- **Admin creates Super Categories.**
- **Members create Sub Categories.**
- Every Sub Category belongs to exactly one Super Category.
- Sub Categories support archive status.
- **Analytics use Super Categories.**

### 4.4 Budget Rules

- Budgets are **monthly** (V1).
- One budget **per Super Category**.
- **Future support for yearly budgets** is anticipated (`period` enum already includes `YEARLY`).

### 4.5 Savings Goal Rules

- Multiple goals per user.
- Tracks: **Target Amount, Current Amount, Deadline, Status, Owner.**
- **Progress Percentage** is derived, not stored.

### 4.6 Loan Rules

- Tracks **Borrowed** and **Lent** money.
- Includes: Amount, **Interest (optional)**, Due Date, Status, Counterparty.

### 4.7 Dashboard Widget Rules

- Two concepts: **DashboardWidgetDefinition** (available widget types) and **DashboardLayout** (admin's customization).
- Widgets support: **enabled**, **order**, **size**, and future customization via `settings`-style extension points.
- **Admin controls layout.**

### 4.8 Tag Rules

- Optional.
- **Many-to-many** relationship with transactions.
- Improve searching and reporting.

---

## 5. Relationships (ER)

```
Family (single household — V1)
│
├── User ───────────────────────────── 1..*
│    ├── Wallet ────────────────────── 1..*      (wallet.ownerId)
│    ├── Transaction (as owner) ────── 0..*      (transaction.ownerId)
│    ├── SavingsGoal ───────────────── 0..*      (savingsGoal.ownerId)
│    ├── Loan ──────────────────────── 0..*      (loan.ownerId)
│    └── creates ─ Tag / SubCategory ─ 0..*
│
├── SuperCategory ──────────────────── 1..*      (family-managed)
│    ├── SubCategory ───────────────── 1..*      (subCategory.superCategoryId)
│    │    └── Transaction ──────────── 0..*      (transaction.subCategoryId)
│    ├── Budget ────────────────────── 0..*      (budget.superCategoryId)
│    └── Transaction (denormalized) ── 0..*      (transaction.superCategoryId)
│
├── Wallet
│    ├── Transaction ───────────────── 0..*      (transaction.walletId)
│    └── Transfer
│         ├── source ───────────────── 0..*      (transaction.sourceWalletId)
│         └── destination ──────────── 0..*      (transaction.destinationWalletId)
│
├── Transaction ──────────── N:M ──── Tag       (transaction.tagIds)
│
├── DashboardWidgetDefinition ──────── 1..*      (system catalog)
│    └── DashboardLayout.widgets ───── 1..*      (widgets[].widgetKey)
└── DashboardLayout ────────────────── 1          (singleton)
```

Summary of cardinalities:

| Relationship | Cardinality | Foreign Key |
|---|---|---|
| User → Wallet | 1 : N | `Wallet.ownerId` |
| User → Transaction | 1 : N | `Transaction.ownerId` |
| User → SavingsGoal | 1 : N | `SavingsGoal.ownerId` |
| User → Loan | 1 : N | `Loan.ownerId` |
| SuperCategory → SubCategory | 1 : N | `SubCategory.superCategoryId` |
| SuperCategory → Budget | 1 : N | `Budget.superCategoryId` |
| SubCategory → Transaction | 1 : N | `Transaction.subCategoryId` |
| Wallet → Transaction (in/out) | 1 : N | `Transaction.walletId` |
| Wallet → Transfer (source/dest) | 1 : N | `Transaction.sourceWalletId` / `destinationWalletId` |
| Transaction ↔ Tag | N : M | `Transaction.tagIds` |
| WidgetDefinition → Layout | 1 : N | `DashboardLayout.widgets[].widgetKey` |

---

## 6. Recommended MongoDB Collections

| Collection | Stores | Notes |
|---|---|---|
| `users` | User | One document per member |
| `wallets` | Wallet | Balance denormalized on the document |
| `transactions` | Transaction | Core ledger; denormalized `superCategoryId` |
| `superCategories` | SuperCategory | Family-managed catalog |
| `subCategories` | SubCategory | Child of a SuperCategory |
| `budgets` | Budget | Per SuperCategory per period |
| `savingsGoals` | SavingsGoal | Owned per member |
| `loans` | Loan | Borrowed/lent per member |
| `tags` | Tag | Family-managed, shared |
| `dashboardWidgetDefinitions` | DashboardWidgetDefinition | System catalog (seeded, read-only) |
| `dashboardLayouts` | DashboardLayout | Singleton — one document per household |

**Naming:** collections are the lowercase plural of the entity, as standard for MongoDB.

---

## 7. Recommended Indexes

| Collection | Index | Uniqueness | Purpose |
|---|---|---|---|
| `users` | `{ email: 1 }` | Unique (collation: case-insensitive) | Login lookup, duplicate prevention |
| `wallets` | `{ ownerId: 1, isArchived: 1 }` | — | Owner wallet lists |
| `wallets` | `{ type: 1 }` | — | Wallet-type queries |
| `transactions` | `{ ownerId: 1, date: -1 }` | — | Member transaction lists (paged) |
| `transactions` | `{ walletId: 1, date: -1 }` | — | Wallet statement/history |
| `transactions` | `{ sourceWalletId: 1 }`, `{ destinationWalletId: 1 }` | — | Transfer lookups |
| `transactions` | `{ superCategoryId: 1, date: -1 }` | — | Budgets & category analytics |
| `transactions` | `{ subCategoryId: 1 }` | — | Subcategory filtering |
| `transactions` | `{ tagIds: 1, date: -1 }` | — | Tag filtering/reporting |
| `transactions` | `{ type: 1, date: -1 }` | — | Household income/expense rolls |
| `transactions` | `{ date: -1 }` | — | Household-wide time-ordered reports |
| `superCategories` | `{ name: 1, type: 1 }` | Unique (collation: case-insensitive) | Duplicate discouragement |
| `subCategories` | `{ superCategoryId: 1, name: 1 }` | Unique (collation: case-insensitive) | Duplicate discouragement per parent |
| `budgets` | `{ superCategoryId: 1, period: 1, periodYear: 1, periodMonth: 1 }` | Partial unique (`isArchived: false`) | One active budget per SuperCategory per period |
| `savingsGoals` | `{ ownerId: 1, status: 1 }` | — | Goal lists per member |
| `loans` | `{ ownerId: 1, status: 1 }` | — | Loan lists per member |
| `loans` | `{ dueDate: 1, status: 1 }` | — | Overdue detection |
| `tags` | `{ name: 1 }` | Unique (collation: case-insensitive) | Duplicate discouragement |
| `dashboardWidgetDefinitions` | `{ key: 1 }` | Unique | Catalog lookup |

> Collation indexes (case-insensitive) trade a small insert/update cost for user-friendly duplicate prevention — acceptable at household scale.

---

## 8. Potential Performance Considerations

- **Denormalized `superCategoryId`** on transactions avoids `$lookup` for the most common analytics (budget progress, category reports). Cost: write-time consistency must be maintained when a Sub Category moves or its Super Category changes.
- **Denormalized wallet `balance`** keeps dashboard reads O(1). It must be updated atomically with each transaction/transfer.
- **Cross-wallet transfers** update two documents. Use MongoDB **transactions (sessions)** for the transfer + two balance updates, or a carefully ordered compensating routine. At single-family scale, the simple session approach is sufficient.
- **Money as fixed-precision values** (integer poisha or `Decimal128`) prevents floating-point drift in balances and report totals. Never sum in raw JavaScript `number` arithmetic.
- **Aggregation pipelines** for reports should open with indexed `$match` filters (`date`, `type`, `superCategoryId`, `ownerId`) before grouping.
- **Transaction lists** should use cursor-based pagination (e.g., `{ date, _id }` compound) rather than `skip`/`limit` for large histories.
- **Archived entities** are excluded via the `isArchived` filter; partial indexes on that flag keep hot scans small.

---

## 9. Future Scalability Notes

- **Multi-family:** add `householdId` to family-scoped entities (`Wallet`, `Transaction`, `SuperCategory`, `SubCategory`, `Budget`, `Tag`, `DashboardLayout`, and User membership). No structural redesign needed; ownership is already explicit.
- **Large histories:** archive or tier old transactions into a secondary collection; keep active queries bounded by date.
- **Analytics load:** serve reports from a replica-set secondary; pre-aggregated rollups (capped collections or materialized summaries) can be added behind the same indexes.
- **Sharding (far future):** `transactions` is the natural shard candidate, sharded by `ownerId` (or future `householdId`).
- **Widget ecosystem:** `DashboardWidgetDefinition` is a registry; new widget types are added as seeded documents plus a rendered component — no schema change.
- **Wallet integration (bKash sync etc.):** extend `Wallet` with sync metadata (fields are additive, no schema change).
- **Notification entity (future):** a `Notification` entity is anticipated for budget warning/over-spend alerts, loan due-date reminders, goal milestone alerts, and member mentions. It would follow the same audit, ownership (`ownerId`), and `isArchived` conventions, with a `type`, `readAt`, and optional entity links — added as a new collection with no changes to existing entities.

---

## 10. Shared Types Reconciliation

The existing `shared/src/types/*` package must be aligned with this blueprint in a later sprint. The deltas:

| Shared type (current) | Blueprint entity | Required changes |
|---|---|---|
| `UserRole` (`owner`/`member`/`viewer`) | User | Use `ADMIN` \| `MEMBER`; add `passwordHash`, `lastLoginAt` |
| `Category` (flat) | SuperCategory + SubCategory | Split into two entities; add `type`, `isArchived`, audit fields |
| `Transaction` (`income`/`expense` only) | Transaction | Add `TRANSFER`, `status` (`COMPLETED`/`PENDING`/`CANCELLED`), `walletId`/`sourceWalletId`/`destinationWalletId`, `tagIds`, `notes`, `superCategoryId` |
| `Budget` (`categoryId`, `weekly`/`monthly`/`yearly`) | Budget | `categoryId` → `superCategoryId`; `period` → `MONTHLY`/`YEARLY`; add `periodYear`/`periodMonth`, `isArchived` |
| `SavingsGoal` (no owner) | SavingsGoal | Add `ownerId`, `notes`, `isArchived`; status → `ACTIVE`/`COMPLETED`/`CANCELLED` |
| `Loan` | Loan | Status → `ACTIVE`/`PAID`/`OVERDUE`/`CANCELLED`; add `notes`, `isArchived` |
| — (new) | Wallet, Tag, DashboardWidgetDefinition, DashboardLayout | Add new types |

This document is the **master blueprint**; the shared type package and MongoDB schemas must be derived from it.
