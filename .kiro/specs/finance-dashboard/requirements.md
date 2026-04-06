# Requirements Document

## Introduction

The Finance Dashboard is a full-stack MERN application that provides financial record management, role-based access control (RBAC), and aggregated analytics. The system supports three user roles (Viewer, Analyst, Admin) with progressively elevated permissions. The backend prioritizes secure JWT authentication, route-level authorization middleware, and validated API endpoints. The frontend delivers a responsive dashboard with summary cards, charts, a paginated transactions table, and an admin panel.

---

## Glossary

- **System**: The Finance Dashboard application as a whole
- **API**: The Express.js REST API backend
- **Auth_Service**: The module responsible for JWT issuance and verification
- **User_Manager**: The module responsible for user CRUD and role assignment
- **Record_Manager**: The module responsible for financial transaction CRUD
- **Analytics_Engine**: The module that computes aggregated financial metrics
- **Access_Guard**: The middleware that enforces role-based route protection
- **Validator**: The request validation layer (Joi or express-validator)
- **Dashboard_UI**: The React.js frontend application
- **Viewer**: A user with read-only access to the dashboard
- **Analyst**: A user with read access plus advanced summary and insights access
- **Admin**: A user with full CRUD permissions over records and users
- **Transaction**: A financial record with Amount, Type, Category, Date, and Description
- **Soft_Delete**: Marking a record with `isDeleted: true` instead of permanent removal
- **JWT**: JSON Web Token used for stateless authentication

---

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a user, I want to register and log in securely, so that I can access the dashboard with my assigned role.

#### Acceptance Criteria

1. WHEN a registration request is received with a valid Name, Email, Password, and Role, THE Auth_Service SHALL create a new user account with a hashed password and return a JWT.
2. WHEN a registration request is received with a duplicate Email, THE Auth_Service SHALL return a 409 Conflict error with a descriptive message.
3. WHEN a login request is received with a valid Email and Password, THE Auth_Service SHALL return a signed JWT containing the user's ID and Role.
4. WHEN a login request is received with an invalid Email or incorrect Password, THE Auth_Service SHALL return a 401 Unauthorized error.
5. THE Auth_Service SHALL hash all passwords using bcrypt with a minimum cost factor of 10 before persisting them.
6. IF a JWT is missing or malformed in a protected request, THEN THE Access_Guard SHALL reject the request with a 401 Unauthorized response.
7. IF a JWT has expired, THEN THE Access_Guard SHALL reject the request with a 401 Unauthorized response and a message indicating token expiry.

---

### Requirement 2: User Model and Role Management

**User Story:** As an Admin, I want to manage user accounts and roles, so that I can control who has access to what functionality.

#### Acceptance Criteria

1. THE User_Manager SHALL store each user with the fields: Name, Email, Password (hashed), Role (one of: Viewer, Analyst, Admin), and Status (one of: Active, Inactive).
2. WHEN an Admin requests the list of all users, THE User_Manager SHALL return all user records excluding password fields.
3. WHEN an Admin updates a user's Role or Status, THE User_Manager SHALL persist the change and return the updated user record.
4. WHEN an Admin deletes a user, THE User_Manager SHALL perform a Soft_Delete by setting `isDeleted: true` on the user record.
5. IF a non-Admin user attempts to access user management endpoints, THEN THE Access_Guard SHALL return a 403 Forbidden response.
6. WHILE a user's Status is Inactive, THE Auth_Service SHALL reject login attempts for that user with a 403 Forbidden response.

---

### Requirement 3: Financial Record Management

**User Story:** As an Admin, I want full CRUD control over financial transactions, so that I can maintain accurate financial records.

#### Acceptance Criteria

1. THE Record_Manager SHALL store each Transaction with the fields: Amount (positive number), Type (one of: Income, Expense), Category (one of: Food, Salary, Rent, Transport, Healthcare, Entertainment, Other), Date, and Description.
2. WHEN an Admin submits a valid create-transaction request, THE Record_Manager SHALL persist the Transaction and return the created record with a 201 status.
3. WHEN an Admin submits an update-transaction request for an existing Transaction, THE Record_Manager SHALL update the specified fields and return the updated record.
4. WHEN an Admin deletes a Transaction, THE Record_Manager SHALL perform a Soft_Delete by setting `isDeleted: true` on the Transaction record.
5. WHEN a read request is received from a Viewer, Analyst, or Admin, THE Record_Manager SHALL return all Transactions where `isDeleted` is false.
6. IF a create, update, or delete request is submitted by a Viewer or Analyst, THEN THE Access_Guard SHALL return a 403 Forbidden response.

---

### Requirement 4: Transaction Filtering and Search

**User Story:** As a Viewer or Analyst, I want to filter and search transactions, so that I can find relevant financial records quickly.

#### Acceptance Criteria

1. WHEN a read request includes a `startDate` and `endDate` query parameter, THE Record_Manager SHALL return only Transactions whose Date falls within the specified range (inclusive).
2. WHEN a read request includes a `category` query parameter, THE Record_Manager SHALL return only Transactions matching the specified Category.
3. WHEN a read request includes a `type` query parameter, THE Record_Manager SHALL return only Transactions matching the specified Type (Income or Expense).
4. WHEN multiple filter parameters are provided simultaneously, THE Record_Manager SHALL apply all filters as a combined AND condition.
5. WHEN a read request includes a `page` and `limit` query parameter, THE Record_Manager SHALL return the corresponding paginated subset of results along with total record count.

---

### Requirement 5: Dashboard Analytics API

**User Story:** As a Viewer or Analyst, I want to see aggregated financial metrics, so that I can understand the overall financial health.

#### Acceptance Criteria

1. WHEN a summary request is received, THE Analytics_Engine SHALL return the Total Income, Total Expenses, and Net Balance computed from all non-deleted Transactions.
2. WHEN a category breakdown request is received, THE Analytics_Engine SHALL return the total spending amount grouped by each Category.
3. WHEN a monthly trends request is received, THE Analytics_Engine SHALL return the total Income and total Expenses aggregated by calendar month for the trailing 12 months.
4. WHEN a weekly trends request is received, THE Analytics_Engine SHALL return the total Income and total Expenses aggregated by ISO week for the trailing 8 weeks.
5. WHEN a recent activity request is received, THE Analytics_Engine SHALL return the 10 most recently created non-deleted Transactions ordered by Date descending.
6. WHERE the Analyst role is active, THE Analytics_Engine SHALL expose the advanced summary and insights endpoints exclusively to users with the Analyst or Admin role.
7. IF a Viewer attempts to access an Analyst-only analytics endpoint, THEN THE Access_Guard SHALL return a 403 Forbidden response.

---

### Requirement 6: Request Validation

**User Story:** As a developer, I want all incoming requests to be validated, so that invalid data never reaches the database.

#### Acceptance Criteria

1. WHEN a request body fails schema validation, THE Validator SHALL return a 422 Unprocessable Entity response containing a list of all validation errors.
2. THE Validator SHALL enforce that Amount is a positive number on all Transaction create and update requests.
3. THE Validator SHALL enforce that Type is one of the allowed enum values (Income, Expense) on all Transaction create and update requests.
4. THE Validator SHALL enforce that Category is one of the allowed enum values on all Transaction create and update requests.
5. THE Validator SHALL enforce that Email conforms to a valid email format on all user registration and login requests.
6. THE Validator SHALL enforce that Password meets a minimum length of 8 characters on all user registration requests.

---

### Requirement 7: Global Error Handling

**User Story:** As a developer, I want a centralized error handler, so that all unhandled errors return consistent, structured responses.

#### Acceptance Criteria

1. WHEN an unhandled error propagates to the error-handling middleware, THE API SHALL return a JSON response containing a `success: false` flag, an `error` message, and the appropriate HTTP status code.
2. WHEN a request is made to an undefined route, THE API SHALL return a 404 Not Found JSON response.
3. IF a MongoDB operation fails due to a duplicate key constraint, THEN THE API SHALL return a 409 Conflict response with a descriptive message.
4. IF a MongoDB operation fails due to a cast error (e.g., invalid ObjectId), THEN THE API SHALL return a 400 Bad Request response.

---

### Requirement 8: Frontend Dashboard UI

**User Story:** As a Viewer, I want a visual dashboard, so that I can quickly understand the current financial status.

#### Acceptance Criteria

1. WHEN a Viewer, Analyst, or Admin logs in, THE Dashboard_UI SHALL display summary cards showing Total Income, Total Expenses, and Net Balance fetched from the Analytics API.
2. WHEN the dashboard loads, THE Dashboard_UI SHALL render a chart displaying monthly or weekly Income and Expense trends using Recharts or Chart.js.
3. WHEN the dashboard loads, THE Dashboard_UI SHALL render a chart displaying category-wise spending breakdown.
4. WHEN the dashboard loads, THE Dashboard_UI SHALL display the 10 most recent Transactions in a recent activity list.
5. THE Dashboard_UI SHALL manage authentication state and API tokens using Context API or Redux Toolkit.
6. WHEN a user is not authenticated, THE Dashboard_UI SHALL redirect the user to the login page.

---

### Requirement 9: Transactions Table with Filtering

**User Story:** As a Viewer or Analyst, I want a paginated and filterable transactions table, so that I can browse and search financial records efficiently.

#### Acceptance Criteria

1. WHEN the transactions page loads, THE Dashboard_UI SHALL display Transactions in a paginated table with configurable page size.
2. WHEN a user applies a date range filter, THE Dashboard_UI SHALL send the `startDate` and `endDate` parameters to the API and re-render the table with the filtered results.
3. WHEN a user applies a category or type filter, THE Dashboard_UI SHALL send the corresponding query parameters to the API and re-render the table.
4. WHEN a page navigation action is triggered, THE Dashboard_UI SHALL fetch and display the corresponding page of results without a full page reload.

---

### Requirement 10: Admin Panel

**User Story:** As an Admin, I want a protected admin panel, so that I can manage users and financial records from the UI.

#### Acceptance Criteria

1. WHEN an Admin navigates to the admin panel route, THE Dashboard_UI SHALL verify the user's role and render the admin panel.
2. IF a non-Admin user attempts to navigate to the admin panel route, THEN THE Dashboard_UI SHALL redirect the user to the dashboard home page.
3. WHEN an Admin uses the admin panel, THE Dashboard_UI SHALL provide interfaces to create, update, and soft-delete Transactions.
4. WHEN an Admin uses the admin panel, THE Dashboard_UI SHALL provide interfaces to view, update roles, and deactivate user accounts.

---

### Requirement 11: Security and Configuration

**User Story:** As a developer, I want the application to follow security best practices, so that sensitive data and routes are protected.

#### Acceptance Criteria

1. THE API SHALL read sensitive configuration values (MONGO_URI, JWT_SECRET, JWT_EXPIRE) exclusively from environment variables and SHALL NOT hardcode these values in source code.
2. THE Auth_Service SHALL sign JWTs using the JWT_SECRET environment variable with a configurable expiry defined by JWT_EXPIRE.
3. THE API SHALL include a README documenting all required environment variables and their expected formats.
4. WHERE CORS is configured, THE API SHALL restrict allowed origins to values specified in environment configuration.
