# 🚀 FinFlow — Master Product Roadmap & Architectural Blueprint

> **Product Name:** FinFlow (Personal Finance & Wealth Management)  
> **Lead Architect & AI Handler:** Antigravity AI & Rafi  
> **Repository:** `1rafi3/Family-Finance-Tracker`  
> **Status:** Active Development (Continuous Integration)  
> **Last Updated:** September 17, 2026  

---

## 🎯 1. Product Vision & Architecture Principles

FinFlow is designed as a **premium, private personal wealth portal** for individuals to gain 100% clarity over where their money goes.

### Core Tenets:
1. **Personal First (Not Multi-User)**: Users manage their own accounts without forcing family members to create separate accounts.
2. **"Spent For" Beneficiary Tracking**: Track expenses spent on behalf of dependents (Children, Parents, Spouse, Pets, Friends) with zero friction.
3. **High-Performance 3-Tier Architecture**:
   - `shared`: Strict TypeScript models and Zod validation schemas.
   - `server`: Node.js, Express, Mongoose, cursor-based pagination, MongoDB aggregations.
   - `client`: React 19, Vite, TanStack Query, Tailwind CSS, Lucide icons, Framer Motion.
4. **Visual Excellence**: Dark/Light mode ready, subtle glassmorphism, responsive data density, zero placeholder text.

---

## 📊 2. Milestone Overview & Status

| Phase | Module / Feature | Status | Description |
|---|---|---|---|
| **P0** | **Authentication & System Health** | ✅ **Done** | Mongo SRV DNS fix, 1-Click quick login, Register tab, JWT sessions |
| **P1** | **FinFlow Rebranding & Core Taxonomy** | ✅ **Done** | Accounts (Wallets), Categories taxonomy, unified sidebar |
| **P2** | **Phase A: People & Dependents (Core)** | ✅ **Done** | Person profiles, color tags, relationships, live total spent aggregation |
| **P3** | **Phase A+: Person Deep Analytics & Breakdown** | ✅ **Done** | Spending Drawer, category breakdown, person transaction list, filters |
| **P4** | **Phase B: Printable Statements & Receipts** | ✅ **Done** | Daily/Monthly/Custom statements, `@media print` A4 layout, PDF export |
| **P5** | **Phase C: Budgets & Allowance Limits** | ✅ **Done** | Category budgets & Person-specific monthly spending allowance |
| **P6** | **Phase D: Advanced Analytics & Charts** | ✅ **Done** | Beneficiary donut chart (Myself vs Family), cashflow trends |
| **P7** | **Phase E: Savings Goals & Debt Payoff** | ✅ **Done** | Visual goal progress, quick deposits, loans & borrowing balance tracker, repayments |
| **P8** | **Phase F: Security Hardening & Mobile Optimization** | ✅ **Done** | Full OWASP audit, auth rate-limiter, JWT guards, mobile bottom nav, responsive tables & modals |

---

## 🛠️ 3. Detailed Phase Breakdown

### ✅ Phase 0: System Health & Authentication
- [x] Node DNS fallback (`1.1.1.1`) to resolve MongoDB Atlas SRV under all ISP/Windows environments.
- [x] Pre-configured demo accounts (`rafi@example.com` / `Rafi1234!` & `admin@family.com` / `Admin1234!`).
- [x] Tabbed Login Page with 1-Click fast login buttons and full in-app account registration.

### ✅ Phase A: People & Dependents ("Spent For" Core)
- [x] Shared data models (`Person`, `PERSON_RELATIONSHIPS`) and Zod schemas.
- [x] Transaction schema update with optional `personId`.
- [x] Server Mongoose model & MongoDB aggregation for `totalSpent` and `txCount`.
- [x] Frontend management interface (`/people`) with relationship filter tabs.
- [x] "Spent For" beneficiary selector inside Transaction creation & editing forms.
- [x] Badge indicator on transaction rows showing `For: [Name]`.

---

### ✅ Phase A+: Person Deep Analytics & Spending Breakdown
*Goal: Provide complete visibility into exactly what, where, and when money was spent for any person.*

- [x] **Backend `personId` Filter Support**:
  - Added `personId?: Id` to `TransactionListFilter` in `transaction.repository.ts`.
  - Added `personId` query parameter handling in `transaction.schema.ts` and `transaction.service.ts`.
  - Fixed backend `personId` persistence & serialization in `transaction.service.ts`, `transaction.types.ts`, and `transaction.serializer.ts`.
- [x] **Person Spending Detail Drawer (`PersonDetailDrawer.tsx`)**:
  - Clicking any Person card in `/people` opens an interactive slide-over drawer.
  - **KPI Metrics**: All-time total spent, current month spending, transaction count, average expense.
  - **Category Breakdown**: Visual progress bars showing spending by category (e.g. Food & Groceries, Education).
  - **Dedicated Transaction List**: Chronological feed of all transactions tagged for this person with dates and account info.
  - **Direct Action**: "Open in Transactions Table" button deep-linking to pre-filtered `/transactions?personId=xxx`.
- [x] **Transaction Table Filters**:
  - Added **"Spent For" (Person)** dropdown filter in `TransactionFilters.tsx`.
  - Added URL synchronization (`useSearchParams`) for instant deep-linking.
  - Added reset filters handling.

---

### ✅ Phase B: Printable Financial Statements & Receipt Generator
*Goal: Allow users to generate clean, professional financial statements for themselves or specific dependents.*

- [x] **Statement Generator View (`/reports`)**:
  - **Period Presets**: `This Month`, `Last Month`, `Today`, `Last 30 Days`, `This Year`, and `Custom Date Range`.
  - **Beneficiary Filter**: `All Household & Family`, `Myself Only (Personal)`, or specific Dependent (e.g. Child).
  - **Account & Type Selectors**: Filter by specific wallet account or transaction type (Expense/Income).
  - **Live Executive Summary**: Dynamic Inflow, Outflow, and Net Cash Flow KPI metric cards.
  - **Category Allocation Summary**: Table with transaction counts, total spent, and percent allocation.
  - **Itemized Ledger**: Clean ledger with item index, transaction date, note/category, account, beneficiary badge, and monetary amounts.
- [x] **Printable Document Layout & PDF Export (`@media print`)**:
  - Clean A4 styling with automated `@media print` rules hiding sidebar, header, navigation, and control bars.
  - Print-friendly table typography, page-break inside avoidance, and black/white high contrast.
  - Certified computer-generated document footer with reference ID.
  - 1-Click **"Print / Save PDF"** and **"Export CSV"** data downloads.

---

### ✅ Phase C: Budgets & Person Spending Allowances
*Goal: Prevent overspending with real-time budget tracking.*

- [x] **Unified Budget & Allowance Model (`shared` & `server`)**:
  - Expanded `Budget` and `BudgetWithAnalytics` contracts in `@family-finance/shared`.
  - Created `server/src/models/budget.ts` and `BudgetRepository` with real-time transaction aggregation.
  - Automatically rolls up granular subcategories into parent SuperCategory budgets.
  - Mounted `/api/budgets` endpoints with CRUD and period query filters.
- [x] **Interactive Budgets Dashboard (`/budgets`)**:
  - **Month & Year Navigator**: Seamless period switcher with previous/next buttons and "Current Month" quick reset.
  - **Dynamic Filter Tabs**: `All Limits`, `Category Budgets`, `Person Allowances`, and `Alerts & Nearing`.
  - **Executive Stats Widget**: 4-card KPI row tracking Total Monthly Cap, Spent So Far, Remaining Buffer, and Overall Budget Health.
  - **Spotlight Cards with Micro-Animations**: Radial cursor glow, amount breakdown, transaction counts, and edit/archive actions.
  - **Visual Warning & Exceeded States**: Real-time progress bars with green (<75%), amber (75-99%), and red (≥100%) thresholds.
  - **Prominent Exceeded Warning Banner**: Alerts users directly at the top of the dashboard when a planned limit has been breached.
  - **Comprehensive Modal Dialog**: 1-Click creation and editing for both Category Budgets and Person Allowances.

---

### ✅ Phase D: Visual Analytics & Distribution Insights
*Goal: High-level visual reports for monthly and annual financial planning.*

- [x] **Dedicated Analytics Command Center (`/analytics`)**:
  - Global Period Selector: `Last 3 Months`, `Last 6 Months`, `This Year (12M)`, and `All Time`.
  - 4 Executive KPI Metric Cards: Household Allocation split bar (`Personal % / Family %`), Top Family Beneficiary, Monthly Burn Rate, and Peak Outflow Month.
- [x] **Beneficiary Distribution Donut Chart (`BeneficiaryDonutChart.tsx`)**:
  - Recharts Donut (`PieChart`) with center total outflow badge and slice percentage indicators.
  - Interactive Mode Toggle: **"By Person"** (individual dependent accounts) vs **"By Role"** (aggregated relationship grouping e.g. Child, Spouse).
  - Custom glassmorphic tooltip displaying currency amounts, shares, and transaction counts.
  - Also embedded in compact dashboard mode directly on the Home Dashboard (`/`).
- [x] **Monthly Spending & Flow Comparison (`MonthlySpendingComparisonChart.tsx`)**:
  - Multi-month trend bar chart comparing Inflow vs Outflow.
  - Dedicated **"Personal vs Family"** mode separating own expenses from family dependents.
  - Viewport Range Selector: `3M`, `6M`, and `12M`.
  - Month-over-Month (MoM) % change indicators (e.g. `+100% MoM`) and Net Flow tags.
- [x] **Category Spending Heatmap Matrix (`CategorySpendingHeatmap.tsx`)**:
  - Category rows × Month columns intensity matrix (levels 0 to 4).
  - Peak Month highlight badge for each category (e.g. `Sept (BDT 2,500)`).
  - Dynamic cell hover inspect popover showing category, month, transaction count, and exact expenditure.
  - Summary footer row calculating monthly outflow across all active categories.

---

### ✅ Phase E: Savings Goals & Debt Payoff
*Goal: Track wealth building milestones and personal liabilities/loans.*

- [x] **Savings Goals Management (`/savings-goals`)**:
  - Target amounts, current saved progress, and celebration milestones (`COMPLETED`).
  - Bangladeshi cultural preset templates: Emergency Fund (জরুরি ফান্ড), Eid Shopping (ঈদের শপিং), Sajek/Cox's Bazar Tour (ফ্যামিলি ট্যুর), Hajj & Umrah (হজ্জ-ওমরাহ), Gadgets (ল্যাপটপ), Gold/Jewelry (স্বর্ণ ক্রয়), and Bank DPS (ডিপিএস).
  - 1-Click **"Add Funds / Deposit"** modal with quick BDT chip selectors (+৳500, +৳1,000, +৳5,000, +৳10,000) and live progress preview.
  - Days-remaining and deadline overdue indicators with interactive spotlight cards.
  - Executive KPI metrics row: Total Target, Total Saved, Remaining Gap, and Achieved Milestones.
- [x] **Loans & Borrowing Tracker (`/loans`)**:
  - Personal debts, lending to friends/family ("Owed to Me" / পাওনা টাকা) vs borrowings ("I Owe" / দেনা টাকা).
  - 1-Click **"Record Payment / Collection"** modal with quick full/partial settlement shortcuts.
  - Net Position tracking (`Total Lent - Total Borrowed`) for complete liability visibility.
  - Overdue warning badges, due date counters, 0% friendly loan support, and automatic settlement when remaining balance reaches zero.
- [x] **Home Dashboard Integration (`/`)**:
  - Embedded **Savings Goals & Debts Snapshot** widget directly on the main dashboard.
  - QuickActions bar expanded with direct 1-click links to Savings Goals and Loans & Debts.

---

### ✅ Phase F: Production Readiness, Security Hardening & Mobile Optimization
*Goal: Ensure personal financial data safety, robust defenses against OWASP Top 10 vulnerabilities, and seamless mobile responsiveness on phones and tablets.*

- [x] **Security Hardening & OWASP Compliance**:
  - Patched 8 auto-fixable dependency vulnerabilities via npm audit fix.
  - Hardened `JWT_SECRET` with minimum 32-character requirement and production fail-fast check if placeholder secret is used.
  - Added dedicated `authRateLimiter` (10 req/15min) on `/register` and `/login` to mitigate brute-force and bcrypt CPU exhaustion.
  - Implemented token revocation via `passwordChangedAt` timestamp — immediately invalidates old tokens upon password change.
  - Token verification extracts and validates `iat` (issued-at) against user's `passwordChangedAt`.
  - Added 30-second request timeout with `AbortController` in client API caller.
- [x] **Mobile Responsiveness & Usability (Bangladeshi UX)**:
  - Added **Mobile Bottom Navigation Bar** (`BottomNav.tsx`) for instant 1-thumb navigation between Home, Wallets, Transactions, Budgets, and full menu drawer.
  - Optimized `Dialog.tsx` with responsive padding (`p-4 sm:p-6`), top-right close button, and viewport sizing.
  - Enhanced `Sheet.tsx` drawer navigation with backdrop blur and smooth sliding animation.
  - Made data tables (`ReportsPage.tsx`, `TransactionListPage.tsx`, `CategorySpendingHeatmap.tsx`) fully scrollable horizontally (`overflow-x-auto`) on mobile with no truncated columns.
  - Added `flex-wrap` and compact spacing across all filter bars (Savings Goals, Loans & Debts, People, Categories).
  - Main content padding optimized with `pb-24 md:pb-6` so the mobile bottom nav never obscures cards, buttons, or charts.

---

## 📝 4. User Feedback & Custom Notes

*This section is for you (the user) to write notes, add feature ideas, or list tasks you want the agent to prioritize. You can edit this file directly at any time.*

- [ ] *User note: Add any custom requests here...*

---

## 🔧 5. Technical Commands Quick Reference

- **Run Dev Server (All workspaces)**: `npm run dev`
- **Run Backend Only**: `npm run dev:server`
- **Run Frontend Only**: `npm run dev:client`
- **Compile Shared**: `npm run build:shared`
- **Typecheck Entire Monorepo**: `npm run typecheck`
