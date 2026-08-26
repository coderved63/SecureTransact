# SecureTransact Project Knowledge Base

This document is derived from the current codebase. It is meant to be the working map for future refactors and feature work.

## Product Summary

SecureTransact is a full-stack banking simulation focused on secure account management, transaction processing, fraud scoring, and admin review. The backend is a Spring Boot API with PostgreSQL persistence, JWT authentication stored in an HTTP-only cookie, CSRF protection for cookie-authenticated mutations, and a rule-based fraud engine. The frontend is a React/Vite dashboard for customers and admins.

## Current User Roles

- `USER`: can register, log in, manage profile/password, create accounts, view own accounts, submit transactions, view own transaction history, and fetch account statements.
- `ADMIN`: can access admin endpoints, view dashboard metrics, list flagged transactions, approve/reject flagged transactions, and list all accounts.

Admin accounts are seeded at startup if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured and the email does not already exist.

## Backend Architecture

Root package: `com.securetransact`

- `controller`: REST API layer.
- `service`: business workflows and transaction orchestration.
- `model`: JPA entities and enums.
- `repository`: Spring Data JPA repositories and custom JPQL queries.
- `fraud`: fraud detection service and scoring result.
- `fraud.rules`: pluggable rule implementations.
- `security`: cookie/JWT auth, user details, request filter, auth rate limiter.
- `exception`: domain exceptions and global HTTP error mapping.
- `config`: Spring Security configuration and admin seeding.
- `dto`: request/response objects with validation.

## Main Backend Workflows

### Authentication

Endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

Registration normalizes email to lowercase, checks uniqueness, hashes the password with BCrypt, creates a `USER`, authenticates the new user, generates a JWT, and returns user profile fields. Login authenticates with Spring Security, generates a JWT, and returns profile fields. The token is not returned in the JSON body; it is set as an HTTP-only `AUTH_TOKEN` cookie. Logout clears that cookie.

### CSRF

Endpoint:

- `GET /api/csrf`

The frontend calls this endpoint to issue an `XSRF-TOKEN` cookie. Mutating frontend requests read that cookie and send it as the `X-XSRF-TOKEN` header. Auth endpoints are exempt from CSRF in `SecurityConfig`.

### Account Management

Endpoints:

- `POST /api/accounts`
- `GET /api/accounts`
- `GET /api/accounts/lookup?accountNumber=...`
- `GET /api/accounts/{id}`
- `GET /api/accounts/{id}/statement?start=...&end=...`

Users can create `SAVINGS` or `CHECKING` accounts. Account numbers are generated as `ST` plus 10 uppercase UUID-derived characters. Accounts default to `ACTIVE` and zero balance if values are not supplied. Access checks ensure users can only fetch details/statements for their own accounts. Lookup returns minimal holder/account information and does not include balance.

### Transaction Processing

Endpoint:

- `POST /api/transactions`

Supported transaction types:

- `DEPOSIT`: requires `toAccountId` owned by the caller.
- `WITHDRAWAL`: requires `fromAccountId` owned by the caller and sufficient balance.
- `TRANSFER`: requires `fromAccountId` owned by the caller and a different destination account.

The service supports optional idempotency keys through the unique `transactions.idempotency_key` column. If the same key is submitted again, the existing transaction is returned instead of creating a duplicate.

After initial validation, a transaction is persisted as `PENDING`, analyzed by fraud rules, and saved with a risk score. High or critical risk transactions are set to `FLAGGED`; lower-risk transactions are processed immediately and move money between accounts.

Money movement uses `Account.version` optimistic locking and retries up to three times inside `TransactionService.processTransaction`.

### Transaction Reads

Endpoints:

- `GET /api/transactions/{id}`
- `GET /api/transactions/history`

Users can read transactions where they own either the source or destination account. Admins can read any transaction. History is paginated and returns transactions involving any of the current user's accounts.

### Admin Review

Endpoints:

- `GET /api/admin/dashboard`
- `GET /api/admin/fraud/flagged`
- `PUT /api/admin/fraud/{id}/review`
- `GET /api/admin/accounts`

Admin review accepts decision strings:

- `APPROVE`: moves funds for a flagged transaction, marks the transaction `COMPLETED` if successful, and marks the fraud log `ADMIN_APPROVED`.
- `REJECT`: marks the transaction `FAILED` and the fraud log `ADMIN_REJECTED`.

Important distinction: `ADMIN_APPROVED` and `ADMIN_REJECTED` are `FraudDecision` values, not `TransactionStatus` values.

## Fraud Engine

`FraudDetectionService` receives all Spring beans implementing `FraudRule`, evaluates each rule, sums their points, and returns a `FraudResult`.

Current thresholds:

- `0-20`: `LOW`
- `21-50`: `MEDIUM`
- `51-75`: `HIGH`
- `76+`: `CRITICAL`

Current rules:

- `LARGE_AMOUNT`: amount greater than `50000`, adds `30`.
- `HIGH_VELOCITY`: at least 5 recent transactions from the source account in 1 minute, adds `25`.
- `ODD_HOURS`: current server time after 01:00 and before 05:00, adds `15`.
- `NEW_ACCOUNT_LARGE_TXN`: account newer than 7 days and amount greater than `10000`, adds `20`.
- `RAPID_TRANSFER`: transfer with at least 3 recent transfers from the same source to the same destination in 10 minutes, adds `20`.

Transactions with `HIGH` or `CRITICAL` risk are flagged for admin review. Transactions with `LOW` or `MEDIUM` risk are auto-approved by the fraud log and processed immediately.

## Data Model

### `users`

- `id`
- `email`, unique
- `password`
- `first_name`
- `last_name`
- `role`: `USER` or `ADMIN`
- `created_at`

### `accounts`

- `id`
- `user_id`
- `account_number`, unique
- `account_type`: `SAVINGS` or `CHECKING`
- `balance`
- `status`: `ACTIVE`, `FROZEN`, or `CLOSED`
- `version`: optimistic locking column
- `created_at`

### `transactions`

- `id`
- `from_account_id`, nullable for deposits
- `to_account_id`, nullable for withdrawals
- `type`: `DEPOSIT`, `WITHDRAWAL`, or `TRANSFER`
- `amount`
- `status`: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, or `FLAGGED`
- `risk_score`
- `idempotency_key`, unique
- `description`
- `created_at`

### `fraud_logs`

- `id`
- `transaction_id`, unique
- `rules_triggered`
- `total_score`
- `decision`: `AUTO_APPROVED`, `FLAGGED`, `ADMIN_APPROVED`, or `ADMIN_REJECTED`
- `reviewed_by`
- `reviewed_at`
- `created_at`

## Frontend Architecture

The frontend is a React app built with Vite. It uses:

- `react-router-dom` for routes.
- `framer-motion` for transitions.
- `lucide-react` for icons.
- `recharts` for chart components.
- Tailwind CSS plus substantial inline styles and CSS variables.

Routes:

- `/`: landing page.
- `/login`: login form.
- `/register`: registration form.
- `/dashboard`: authenticated user dashboard.
- `/admin`: authenticated admin dashboard.
- `*`: not found.

Frontend auth state is held in `AuthContext`. On mount, it calls `/api/csrf` and then `/api/user/profile` to hydrate the session from the HTTP-only cookie. The API layer uses `credentials: 'include'` for all requests and has a global unauthorized handler that logs the user out locally on 401 responses.

Customer dashboard features:

- Account balance overview.
- Account cards.
- Account creation modal.
- Deposit, withdrawal, and transfer modal.
- Transaction table.
- Paginated transaction history.
- Account statement modal with date range.
- Profile update.
- Password change.
- Local notification preferences.

Admin dashboard features:

- Metrics grid.
- Flagged transaction table.
- Approve/reject review actions.
- All accounts table.
- Auto-refresh metrics every 30 seconds.

## Runtime Configuration

Backend environment variables:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_JWT_SECRET`
- `APP_JWT_EXPIRATION_MS`
- `APP_COOKIE_SECURE`
- `APP_COOKIE_SAME_SITE`
- `CORS_ALLOWED_ORIGINS`
- `AUTH_RATE_LIMIT_PER_MINUTE`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `APP_SWAGGER_ENABLED`

Frontend environment variable:

- `VITE_API_URL`

For local Vite development, `VITE_API_URL` can stay empty because `vite.config.js` proxies `/api` to `http://localhost:8080`.

## Testing

Current backend tests:

- `AuthControllerTest`: registration, duplicate email, login, invalid credentials, invalid email.
- `FraudDetectionServiceTest`: low risk, large amount, high velocity, new account large transaction, multiple-rule risk, null source account.

The test profile uses H2 with `ddl-auto: create-drop` and disables Flyway.

## Known Implementation Notes

- The README currently describes `LargeAmount` as `+25`, but the code uses `+30`.
- The README transaction-state diagram mentions admin-approved/admin-rejected states, but those are fraud decisions rather than transaction statuses.
- `TransactionService` and `AdminService` both implement money movement logic. This is a good refactor target.
- `TransactionRequest` validates amount and description but does not validate required source/destination IDs per transaction type at DTO level.
- `UserController` returns raw `Map` responses instead of typed DTOs.
- `useApi.js` attempts to track unmounting with `useState` instead of `useEffect`.
- `AuthContext.login` calls `fetchCsrfToken()` without awaiting it.
- Fraud rules use `LocalDateTime.now()` / `LocalTime.now()` directly, which makes time-sensitive behavior harder to test.
- Auth rate limiting is in-memory, which is fine for a single local instance but not horizontally scalable.
- The frontend has large page components with many inline styles; extracting layout/components would make it much easier to maintain.

