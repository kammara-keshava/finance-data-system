# Implementation Plan: Finance Dashboard

## Overview

Incremental implementation of the Finance Dashboard MERN application. Tasks build from project scaffolding through backend API, middleware, analytics, and finally the React frontend. Each step integrates with the previous before moving on.

## Tasks

- [x] 1. Project scaffolding and environment setup
  - Create `server/` and `client/` directory structure
  - Initialize `package.json` for both server (Express, Mongoose, bcryptjs, jsonwebtoken, joi, cors, dotenv) and client (React, React Router, Axios, Recharts)
  - Create `server/.env.example` documenting `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `CORS_ORIGIN`
  - Create `server/index.js` with Express app bootstrap, CORS config reading from env, and MongoDB connection via Mongoose
  - _Requirements: 11.1, 11.3, 11.4_

- [ ] 2. Data models
  - [x] 2.1 Implement User Mongoose schema (`server/models/User.js`)
    - Fields: name, email (unique, lowercase), password, role enum, status enum, isDeleted, createdAt, updatedAt
    - Add compound indexes: `{ isDeleted: 1, status: 1 }` and unique on `email`
    - _Requirements: 2.1_

  - [x] 2.2 Implement Transaction Mongoose schema (`server/models/Transaction.js`)
    - Fields: amount (min 0.01), type enum, category enum, date, description, isDeleted, createdAt, updatedAt
    - Add indexes: `{ isDeleted: 1, date: -1 }` and `{ isDeleted: 1, category: 1 }`
    - _Requirements: 3.1_

- [ ] 3. Middleware layer
  - [x] 3.1 Implement JWT auth middleware (`server/middleware/auth.js`)
    - Verify `Authorization: Bearer <token>` header using `JWT_SECRET`
    - Attach `req.user = { id, role }` on success
    - Call `next(err)` with 401 error for missing, malformed, or expired tokens (distinguish expiry message)
    - _Requirements: 1.6, 1.7_

  - [x] 3.2 Implement role guard middleware (`server/middleware/roleGuard.js`)
    - Export `requireRole(...roles)` factory returning middleware
    - Return 403 if `req.user.role` is not in the allowed roles array
    - _Requirements: 2.5, 3.6, 5.6, 5.7_

  - [x] 3.3 Implement Joi validation middleware (`server/middleware/validate.js`)
    - Export `validate(schema)` factory that validates `req.body` (or `req.query`) against a Joi schema
    - On failure, collect all errors and call `next` with a 422 error containing the full error list
    - _Requirements: 6.1_

  - [x] 3.4 Implement global error handler (`server/middleware/errorHandler.js`)
    - Map Mongoose `CastError` → 400, duplicate key code `11000` → 409, Joi `ValidationError` → 422
    - Map JWT `JsonWebTokenError` → 401, `TokenExpiredError` → 401
    - All responses: `{ success: false, error: string, statusCode: number }`
    - Append `stack` in development only; register a 404 catch-all route before this handler
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 4. Joi validation schemas (`server/validators/`)
  - [x] 4.1 Create auth schemas (`authSchemas.js`)
    - `registerSchema`: name required, email valid format, password min 8 chars, role enum
    - `loginSchema`: email valid format, password required
    - _Requirements: 6.5, 6.6_

  - [x] 4.2 Create transaction schemas (`transactionSchemas.js`)
    - `createTransactionSchema` and `updateTransactionSchema`: amount positive number, type enum, category enum, date, description optional
    - _Requirements: 6.2, 6.3, 6.4_

- [ ] 5. Auth controller and routes
  - [x] 5.1 Implement `server/controllers/authController.js`
    - `register`: validate body, check duplicate email, hash password with bcrypt cost 10, create user, sign JWT with `JWT_SECRET`/`JWT_EXPIRE`, return `{ success: true, data: { token } }`
    - `login`: validate credentials, check `isDeleted` and `status === 'Active'` (403 if inactive), compare bcrypt hash, return JWT
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.6_

  - [x] 5.2 Wire auth routes (`server/routes/authRoutes.js`)
    - `POST /api/auth/register` → validate(registerSchema) → register
    - `POST /api/auth/login` → validate(loginSchema) → login
    - Mount on Express app
    - _Requirements: 1.1, 1.3_

  - [-] 5.3 Write property test for registration round-trip (Property 1)
    - **Property 1: Registration round-trip produces valid JWT**
    - **Validates: Requirements 1.1, 11.2**

  - [ ] 5.4 Write property test for password hashing (Property 2)
    - **Property 2: Stored passwords are bcrypt hashes with cost >= 10**
    - **Validates: Requirements 1.5**

  - [ ] 5.5 Write property test for login round-trip (Property 3)
    - **Property 3: Login round-trip returns JWT for valid credentials**
    - **Validates: Requirements 1.3**

  - [ ] 5.6 Write unit tests for auth edge cases
    - Duplicate email → 409; invalid password → 401; inactive user → 403; missing JWT → 401; expired JWT → 401
    - _Requirements: 1.2, 1.4, 1.6, 1.7, 2.6_

- [ ] 6. Checkpoint — Ensure all auth tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. User controller and routes
  - [x] 7.1 Implement `server/controllers/userController.js`
    - `listUsers`: return all non-deleted users with `.select('-password')`
    - `updateUser`: update role or status, return updated record
    - `deleteUser`: soft-delete by setting `isDeleted: true`
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 7.2 Wire user routes (`server/routes/userRoutes.js`)
    - All routes protected by `auth` + `requireRole('Admin')`
    - `GET /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [ ] 7.3 Write property test for user list excludes password (Property 4)
    - **Property 4: User list never exposes password field**
    - **Validates: Requirements 2.2**

  - [ ] 7.4 Write property test for user update persistence (Property 5)
    - **Property 5: User update persists role and status changes**
    - **Validates: Requirements 2.3**

  - [ ] 7.5 Write property test for user soft-delete (Property 6)
    - **Property 6: User soft-delete sets isDeleted flag**
    - **Validates: Requirements 2.4**

  - [ ] 7.6 Write unit tests for user role guard
    - Viewer/Analyst on user endpoints → 403
    - _Requirements: 2.5_

- [ ] 8. Transaction controller and routes
  - [x] 8.1 Implement `server/controllers/transactionController.js`
    - `listTransactions`: query `{ isDeleted: false }` + optional filters (startDate/endDate, category, type as AND conditions), paginate with `page`/`limit`, return `{ success: true, data, total, page, limit }`
    - `createTransaction`: Admin only; persist and return 201
    - `updateTransaction`: Admin only; update fields, return updated record
    - `deleteTransaction`: Admin only; soft-delete
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 8.2 Wire transaction routes (`server/routes/transactionRoutes.js`)
    - `GET /api/transactions` → auth → all roles
    - `POST /api/transactions` → auth → requireRole('Admin') → validate(createTransactionSchema)
    - `PUT /api/transactions/:id` → auth → requireRole('Admin') → validate(updateTransactionSchema)
    - `DELETE /api/transactions/:id` → auth → requireRole('Admin')
    - _Requirements: 3.2, 3.5, 3.6_

  - [ ] 8.3 Write property test for transaction creation fields (Property 7)
    - **Property 7: Transaction creation returns 201 with all required fields**
    - **Validates: Requirements 3.1, 3.2**

  - [ ] 8.4 Write property test for transaction update persistence (Property 8)
    - **Property 8: Transaction update persists specified field changes**
    - **Validates: Requirements 3.3**

  - [ ] 8.5 Write property test for transaction soft-delete (Property 9)
    - **Property 9: Transaction soft-delete sets isDeleted flag**
    - **Validates: Requirements 3.4**

  - [ ] 8.6 Write property test for read excludes deleted (Property 10)
    - **Property 10: Read endpoint never returns soft-deleted transactions**
    - **Validates: Requirements 3.5**

  - [ ] 8.7 Write property test for date range filter (Property 11)
    - **Property 11: Date range filter returns only in-range transactions**
    - **Validates: Requirements 4.1**

  - [ ] 8.8 Write property test for category filter (Property 12)
    - **Property 12: Category filter returns only matching transactions**
    - **Validates: Requirements 4.2**

  - [ ] 8.9 Write property test for type filter (Property 13)
    - **Property 13: Type filter returns only matching transactions**
    - **Validates: Requirements 4.3**

  - [ ] 8.10 Write property test for combined filters (Property 14)
    - **Property 14: Combined filters apply as AND condition**
    - **Validates: Requirements 4.4**

  - [ ] 8.11 Write property test for pagination correctness (Property 15)
    - **Property 15: Pagination returns correct subset and accurate total count**
    - **Validates: Requirements 4.5**

  - [ ] 8.12 Write unit tests for transaction role guard
    - Viewer/Analyst on write endpoints → 403
    - _Requirements: 3.6_

- [ ] 9. Checkpoint — Ensure all transaction tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Analytics controller and routes
  - [x] 10.1 Implement `server/controllers/analyticsController.js`
    - `getSummary`: Mongoose aggregation summing Income and Expense amounts from non-deleted transactions; return `{ totalIncome, totalExpenses, netBalance }`
    - `getCategoryBreakdown`: group by category, sum amounts; return `[{ category, total }]`
    - `getMonthlyTrends`: group by calendar month for trailing 12 months; return `[{ period, income, expenses }]`
    - `getWeeklyTrends`: group by ISO week for trailing 8 weeks; return `[{ period, income, expenses }]`
    - `getRecentActivity`: find top 10 non-deleted transactions sorted by date descending
    - `getInsights`: Analyst + Admin only; advanced summary (extend as needed)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 10.2 Wire analytics routes (`server/routes/analyticsRoutes.js`)
    - `GET /api/analytics/summary`, `/category-breakdown`, `/monthly-trends`, `/weekly-trends`, `/recent-activity` → auth (all roles)
    - `GET /api/analytics/insights` → auth → requireRole('Analyst', 'Admin')
    - _Requirements: 5.6, 5.7_

  - [ ] 10.3 Write property test for summary arithmetic (Property 16)
    - **Property 16: Summary totals are arithmetically correct**
    - **Validates: Requirements 5.1**

  - [ ] 10.4 Write property test for category breakdown grouping (Property 17)
    - **Property 17: Category breakdown correctly groups and sums amounts**
    - **Validates: Requirements 5.2**

  - [ ] 10.5 Write property test for monthly trends aggregation (Property 18)
    - **Property 18: Monthly trends correctly aggregate by calendar month**
    - **Validates: Requirements 5.3**

  - [ ] 10.6 Write property test for weekly trends aggregation (Property 19)
    - **Property 19: Weekly trends correctly aggregate by ISO week**
    - **Validates: Requirements 5.4**

  - [ ] 10.7 Write property test for recent activity ordering (Property 20)
    - **Property 20: Recent activity returns exactly 10 most recent non-deleted transactions**
    - **Validates: Requirements 5.5**

  - [ ] 10.8 Write unit tests for analytics role guard
    - Viewer on `/insights` → 403
    - _Requirements: 5.7_

- [ ] 11. Validation and error handler property tests
  - [ ] 11.1 Write property test for validation 422 with all errors (Property 21)
    - **Property 21: Validation errors return 422 with all error details**
    - **Validates: Requirements 6.1**

  - [ ] 11.2 Write property test for error envelope shape (Property 22)
    - **Property 22: Error responses always follow the structured envelope**
    - **Validates: Requirements 7.1**

  - [ ] 11.3 Write unit tests for error handler edge cases
    - Undefined route → 404 JSON; Mongoose CastError → 400; duplicate key → 409
    - _Requirements: 7.2, 7.3, 7.4_

- [ ] 12. Checkpoint — Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. React app bootstrap and auth state
  - [x] 13.1 Bootstrap React app (`client/src/`)
    - Set up React Router with routes: `/login`, `/dashboard`, `/transactions`, `/admin`
    - Implement `AuthContext` (`client/src/context/AuthContext.jsx`) storing `{ user, token, login(), logout() }`
    - Implement Axios instance (`client/src/api/axios.js`) with request interceptor attaching `Authorization: Bearer <token>` and response interceptor clearing auth + redirecting on 401
    - _Requirements: 8.5, 8.6_

  - [x] 13.2 Implement `PrivateRoute` and `AdminRoute` components
    - `PrivateRoute`: redirect to `/login` if no token in context
    - `AdminRoute`: redirect to `/dashboard` if role is not Admin
    - Wrap routes accordingly in the router
    - _Requirements: 8.6, 10.1, 10.2_

  - [x] 13.3 Implement `LoginPage` (`client/src/pages/LoginPage.jsx`)
    - Email/password form calling `POST /api/auth/login`
    - On success, store token via `AuthContext.login()` and redirect to `/dashboard`
    - Surface 401/403 errors inline
    - _Requirements: 8.6_

- [ ] 14. Dashboard page and shared chart components
  - [x] 14.1 Implement shared components
    - `SummaryCard` (`client/src/components/SummaryCard.jsx`): renders label + formatted value
    - `TrendChart` (`client/src/components/TrendChart.jsx`): Recharts `BarChart` for monthly/weekly income vs expenses
    - `CategoryChart` (`client/src/components/CategoryChart.jsx`): Recharts `PieChart` for category breakdown
    - _Requirements: 8.2, 8.3_

  - [x] 14.2 Implement `DashboardPage` (`client/src/pages/DashboardPage.jsx`)
    - Fetch `/api/analytics/summary`, `/category-breakdown`, `/monthly-trends`, `/recent-activity` on mount
    - Render three `SummaryCard` components, `TrendChart`, `CategoryChart`, and a recent activity list (10 items)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 14.3 Write unit tests for SummaryCard and DashboardPage
    - `SummaryCard` renders label and value; `DashboardPage` renders three cards with mocked API data
    - `TrendChart` and `CategoryChart` render given data
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 14.4 Write property test for SummaryCard numeric display
    - For any summary data object, `SummaryCard` components display the correct numeric values
    - _Requirements: 8.1_

- [ ] 15. Transactions page with filtering and pagination
  - [x] 15.1 Implement `FilterBar` component (`client/src/components/FilterBar.jsx`)
    - Date range inputs, category select, type select
    - On change, call parent callback with updated filter params
    - _Requirements: 9.2, 9.3_

  - [x] 15.2 Implement `TransactionTable` component (`client/src/components/TransactionTable.jsx`)
    - Render paginated rows; accept `data`, `total`, `page`, `limit`, `onPageChange` props
    - _Requirements: 9.1, 9.4_

  - [x] 15.3 Implement `TransactionsPage` (`client/src/pages/TransactionsPage.jsx`)
    - Manage filter state and page state; fetch `/api/transactions` with query params on state change
    - Pass data to `TransactionTable` and `FilterBar`; handle page navigation without full reload
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 15.4 Write unit tests for TransactionTable and FilterBar
    - Table renders correct row count; filter bar sends correct query params; page nav triggers API call with correct `page`
    - _Requirements: 9.1, 9.3, 9.4_

  - [ ] 15.5 Write property test for TransactionTable row count
    - For any array of transaction objects, `TransactionTable` renders exactly as many rows as items provided
    - _Requirements: 9.1_

- [ ] 16. Admin panel
  - [x] 16.1 Implement `AdminPage` (`client/src/pages/AdminPage.jsx`)
    - Transaction management section: create/update/soft-delete forms calling the transaction API
    - User management section: table of users with role update and deactivate actions calling the user API
    - _Requirements: 10.1, 10.3, 10.4_

  - [ ] 16.2 Write unit tests for AdminPage
    - Renders for Admin role; `PrivateRoute`/`AdminRoute` redirect for Viewer/Analyst
    - _Requirements: 10.1, 10.2_

- [ ] 17. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` (backend) and `fast-check` + Vitest (frontend) with `{ numRuns: 100 }`
- All property tests must include the comment `// Feature: finance-dashboard, Property N: <text>`
- Backend tests run with `jest --runInBand`; frontend tests run with `vitest --run`
