# Family Finance Tracker — Project Requirements Document (PRD)

| | |
|---|---|
| **Document** | 00-project-requirements.md |
| **Status** | Draft v1.0 |
| **Version** | 1.0 |
| **Project** | Family Finance Tracker |
| **Classification** | Private / Internal |

---

## 1. Project Overview

- **Project Name:** Family Finance Tracker
- **Purpose:** A private web application for a single household to manage family finances, budgets, savings, loans, and financial reports.
- **Current Scope:** One family only.
- **Future Scope:** The architecture should allow future expansion if desired, but **multi-family support is NOT part of Version 1**.

The application is a household financial management system that gives every member of the family a clear, real-time view of money coming in, money going out, money saved, and money owed. It replaces scattered notes, spreadsheets, and memory with a single, reliable, always-accessible record of the family's financial life.

---

## 2. Vision

Family Finance Tracker exists to give one family complete, effortless visibility and control over its financial life.

Every member — regardless of technical comfort — should be able to answer three questions in under a minute: **"How much do we have?", "Where is the money going?", and "Are we on track?"** The application removes the guesswork from household finance by turning every day-to-day transaction, budget, savings goal, and loan into a clear picture that the whole family can see and act on together.

The vision is a simple, fast, mobile-friendly tool that takes less effort to maintain than it saves — a financial "family bank book" that is accurate, private, and built to last for years of real household use. It is intentionally simple: no investment tracking, no predictions, no automation that hides the numbers. Just clarity, ownership, and trust in the family's money.

---

## 3. Objectives

The product must deliver the following objectives:

- **Track income** — record and categorize all money coming into the household.
- **Track expenses** — record and categorize all money going out of the household.
- **Manage wallets** — maintain multiple wallets (cash, bank accounts, mobile money) with current balances.
- **Manage budgets** — set monthly spending limits per spending category and monitor remaining amounts.
- **Track savings goals** — define targets, set deadlines, and track progress.
- **Track loans** — record money borrowed and lent, with status and due dates.
- **Financial analytics** — provide clear household-wide reports and trends.
- **Simple and intuitive UI** — usable by every family member without training.
- **Mobile-friendly** — fully usable on phones and tablets as well as desktops.
- **Secure authentication** — protect family financial data with strong, role-based access.
- **Long-term maintainability** — a clean, documented, scalable codebase built for years of incremental improvement.

---

## 4. User Roles

Two roles are defined for Version 1.

### Admin

- Full access to all application features and all household data.
- Can create **Super Categories** (see §8).
- Can configure the household dashboard (see §12).
- Can manage family members.
- Can promote a **Member** to **Admin** and demote an **Admin** to **Member**.
- At least one Admin must always exist in the household. An Admin cannot demote themselves if they are the last remaining Admin.

### Member

- Full access to their own transactions, wallets, budgets, savings goals, and loan records.
- Can create **Sub Categories** under existing Super Categories.
- Can view household-wide dashboard and reports (read-only aggregate views).
- Cannot create Super Categories.
- Cannot manage family members or roles.
- Cannot modify or delete another member's transactions.

### Role Permissions Matrix

| Capability | Admin | Member |
|---|---|---|
| Create/manage own transactions | Yes | Yes |
| View household dashboard & reports | Yes | Yes |
| Create Super Categories | Yes | No |
| Create Sub Categories | Yes | Yes |
| Manage dashboard widgets | Yes | No |
| Manage family members | Yes | No |
| Promote/demote admins | Yes | No |

---

## 5. Family Members

- Every family member has a **personal account** and authenticates individually.
- **Income ownership remains individual.** An income transaction is owned by the member who created it; ownership is never ambiguous.
- **Expense ownership remains individual.** Each expense is attributed to the member who made it.
- The **dashboard displays household-wide analytics**, aggregating across all members, while detailed records preserve individual ownership.
- Members may have multiple roles over time (e.g., a Member promoted to Admin), but a member is always the sole owner of their own records.

This model balances two needs: accurate attribution of money movements to the person responsible, and a shared household view for decisions made together.

---

## 6. Wallet System

- **Wallets belong to users.** Each wallet is owned by exactly one member.
- A user may own multiple wallets.
- Wallet types are user-definable. Examples for Version 1:
  - **Cash**
  - **Bank**
  - **bKash**
  - **Nagad**
  - **Rocket**
  - **House Cash**
- **Future wallet types must be supported** without schema changes — wallet type is a configurable value, not a fixed enum.
- **Transfers between wallets are NOT income or expense.** They are a distinct transaction type: **wallet transfers**.
- A transfer reduces the balance of the source wallet and increases the balance of the destination wallet. Transfers between members' wallets are permitted and likewise do not affect household totals.
- Every wallet maintains a current balance derived from its transactions.

---

## 7. Transaction Rules

Three transaction types are defined:

1. **Income**
2. **Expense**
3. **Transfer**

### Core Rule

- **A Transfer does NOT affect household income or expense totals.** Only Income and Expense transactions are included in income/expense calculations, budgets, and reports. Transfers affect only wallet balances.

### Transaction Attributes

Every transaction belongs to:

- **wallet** — the wallet the money came from or went into
- **owner** — the member who owns the transaction
- **category** — the applicable Sub Category (Income transactions use an income Sub Category; Expense transactions use an expense Sub Category)
- **optional tags** — zero or more tags for search and reporting
- **date** — the effective date of the transaction
- **amount** — a positive monetary value (the sign is determined by transaction type)

### Additional Rules

- Amounts must be greater than zero; negative amounts are not permitted at the point of entry.
- The transaction type and category must be compatible (income categories for income, expense categories for expense).
- Deleting or editing a transaction recalculates the owning wallet's balance.
- A transaction's date may be in the past or present; future-dated transactions are outside Version 1 scope.

---

## 8. Categories

Categories use a **two-level system**:

- **Super Category** — the top-level grouping (e.g., Housing, Food, Transport, Salary, Savings).
- **Sub Category** — a specific value under a Super Category (e.g., Food → Groceries, Dining Out).

### Rules

- **Only an Admin can create Super Categories.**
- **Any member can create Sub Categories** under any Super Category.
- **Every Sub Category belongs to exactly one Super Category.** No orphaned or shared Sub Categories.
- **Analytics are calculated using Super Categories.** Reports, budgets, and trends roll up to the Super Category level.
- **Sub Categories can be archived.** An archived Sub Category is hidden from new transaction entry and reports, but existing transactions linked to it remain valid and unchanged.
- **Duplicates should be discouraged.** Creation of a Super Category or Sub Category with a name that already exists (within the same level/parent) should be flagged or blocked, with case-insensitive matching.

---

## 9. Budgets

- Budgets are **monthly** by default.
- A budget applies **per Super Category**.
- Budgets are household-level: a Super Category budget covers spending across all members for the calendar month.
- Budget progress is the sum of Expense transactions in that Super Category for the period versus the budgeted amount.
- **Future support for yearly budgets** is anticipated and should not be precluded by the data model.

---

## 10. Savings Goals

- Users can create **multiple savings goals**.
- Each goal tracks:
  - **Target Amount** — the amount to be saved.
  - **Current Amount** — progress toward the target.
  - **Deadline** — optional target date.
  - **Status** — active, completed, or paused.
- Goals are owned by the member who created them; household analytics may aggregate them.
- Progress is updated through goal contributions; contributions are not treated as expenses and do not affect household income/expense totals unless explicitly recorded as such.

---

## 11. Loans

The system tracks both sides of lending within and outside the household:

- **Money Borrowed** — the household (a member) borrowed money.
- **Money Lent** — the household (a member) lent money.

Each loan record tracks:

- **Direction** — borrowed or lent.
- **Counterparty** — the person or entity on the other side.
- **Amount** — principal.
- **Status** — active, paid, or overdue.
- **Due Date** — the expected settlement date.
- Remaining balance, interest rate (optional), and term (optional).

Loan activity does not affect household income/expense totals.

---

## 12. Dashboard

- The dashboard is **widget-based**.
- **Admins can:**
  - **reorder** widgets
  - **enable** widgets
  - **disable** widgets
- Widget preferences are household-level and shared.

### Example Widgets

- **Current Balance**
- **Income**
- **Expense**
- **Savings**
- **Budget Remaining**
- **Top Spending Category**
- **Recent Activity**
- **Expense Trends**

The dashboard aggregates household-wide data for all members (§5) and is the primary "how are we doing?" view.

---

## 13. Tags

- Transactions may have **optional tags** (zero or more per transaction).
- Tags are free-form labels (e.g., `travel`, `school`, `gift`).
- Tags **improve searching and reporting** — transactions can be filtered and grouped by tag.
- Tags are not a replacement for categories; they are a secondary, flexible dimension.

---

## 14. Reports

The system provides the following report types:

- **Monthly** — income, expense, and net for a month.
- **Yearly** — income, expense, and net for a year.
- **Category Reports** — spending/income by Super Category.
- **Wallet Reports** — balances and activity per wallet.
- **Member Reports** — per-member income and expense.
- **Savings Reports** — progress across all savings goals.
- **Loan Reports** — outstanding borrowed and lent positions.

Reports are read-only aggregate views. Report parameters (period, category, wallet, member, tag) are selectable by the user. Reports may be printed or exported in Version 1 if feasible; export is otherwise listed in §17.

---

## 15. Security

Version 1 must enforce the following:

- **JWT Authentication** — stateless, signed authentication tokens for all API access.
- **Role-based authorization** — Admin/Member permissions enforced server-side on every protected resource.
- **Password hashing** — passwords stored only as strong, salted hashes.
- **Input validation** — all request input validated and sanitized server-side (and mirrored client-side for UX).
- **Audit logging (future)** — a log of sensitive actions (role changes, member management, destructive edits) is planned but not required for Version 1.

Additional expectations:

- Sensitive environment configuration (secrets, database credentials) never committed to version control.
- All API access requires authentication except explicitly public endpoints (e.g., health check).
- Data access must enforce ownership: a member can read/write only their own records; household-level reads require membership in the household.

---

## 16. Out of Scope

The following are explicitly **NOT part of Version 1**:

- **Multi-family** support (tenants, households as a first-class entity).
- **Investments** tracking.
- **Stocks** tracking.
- **Crypto** tracking.
- **OCR** (receipt scanning / text recognition).
- **AI Predictions** (spending forecasts, categorization automation, insights).

Any design or data-model decision that depends on these features is deferred.

---

## 17. Future Ideas

The following are candidate enhancements for later versions (not committed for Version 1):

- **Assets** — physical and financial asset tracking.
- **Financial snapshots** — point-in-time balance and net-worth snapshots.
- **Export** — full data export (CSV/PDF) for reporting and backup.
- **Notifications** — reminders for budgets, savings deadlines, and loan due dates.
- **bKash payment integration** — automatic import/sync of bKash transactions.
- **Wallet synchronization** — automatic synchronization with bank and mobile-money providers.

---

## 18. Version Roadmap

| Version | Focus | Description |
|---|---|---|
| **v0.1** | Foundation | Monorepo scaffolding, shared types, base infrastructure |
| **v0.2** | Authentication | Accounts, login, roles (Admin/Member), JWT, authorization |
| **v0.3** | Transactions | Wallets, categories, income/expense/transfer entry, tags |
| **v0.4** | Budgets | Monthly per-Super-Category budgets and progress |
| **v0.5** | Savings | Savings goals with targets, deadlines, and status |
| **v0.6** | Loans | Borrowed/lent tracking with status and due dates |
| **v0.7** | Reports | Monthly, yearly, category, wallet, member, savings, loan reports |
| **v1.0** | Production Release | Dashboard finalization, polish, hardening, and release |

---

## Executive Summary

Family Finance Tracker is a private, single-household web application that gives a family a single trusted record of its financial life — income, expenses, wallets, budgets, savings goals, and loans — with individual ownership of records and a shared household view for decisions.

Version 1 supports exactly one family, two roles (Admin and Member), three transaction types (income, expense, and transfer) with a two-level category system, monthly per-category budgets, multiple savings goals, borrowed/lent loan tracking, a configurable widget dashboard, and a full set of monthly, yearly, category, wallet, member, savings, and loan reports. Transfers never distort income or expense totals, and category analytics roll up to the Super Category level.

Security is a first-class requirement: JWT authentication, server-side role-based authorization, hashed passwords, and strict input validation. Multi-family support, investments, stocks, crypto, OCR, and AI predictions are explicitly out of scope, keeping the product simple, focused, and maintainable.

The roadmap is incremental — foundation, authentication, transactions, budgets, savings, loans, reports, then a production release — so the family gets a working, valuable system at each step. The architecture is deliberately extensible, allowing future features such as assets, exports, notifications, and wallet synchronization without redesign.
