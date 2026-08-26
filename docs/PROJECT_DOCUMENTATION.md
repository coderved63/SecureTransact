# SecureTransact - Complete Project Documentation

> A production-grade transaction processing and fraud detection platform simulating real banking systems with ACID-compliant processing, concurrent transaction safety, and intelligent rule-based fraud scoring.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Backend - Complete API Reference](#3-backend---complete-api-reference)
4. [Data Models & Schema](#4-data-models--schema)
5. [Fraud Detection Engine](#5-fraud-detection-engine)
6. [Security Architecture](#6-security-architecture)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Transaction State Machine](#8-transaction-state-machine)
9. [Key Design Decisions](#9-key-design-decisions)
10. [Project File Inventory](#10-project-file-inventory)

---

## 1. Architecture Overview

### High-Level Flow

```
[React Frontend] --> [Spring Boot REST API] --> [PostgreSQL]
                           |
                    [Fraud Engine]
                    [JWT Auth]
                    [Rate Limiter]
```

### Request Lifecycle (Transaction)

```
1. User submits transaction via frontend
2. Rate limiter checks (auth endpoints only)
3. JWT filter extracts user from httpOnly cookie
4. Controller validates input (Jakarta Bean Validation)
5. Service layer:
   a. Idempotency check (if key provided)
   b. Account ownership + status validation
   c. Balance sufficiency check
   d. Self-transfer prevention
   e. Save transaction as PENDING
   f. Fraud detection (5 rules, composite scoring)
   g. Risk-based routing:
      - LOW/MEDIUM -> auto-process -> COMPLETED
      - HIGH/CRITICAL -> FLAGGED (waits for admin)
   h. Optimistic lock retry loop for balance updates
6. Response returned with fraud score + status
```

### Package Structure

```
com.securetransact
├── SecureTransactApplication.java        # Entry point
├── config/                                # SecurityConfig, AdminSeeder
├── controller/                            # 6 REST controllers
├── dto/                                   # 12 request/response DTOs
├── exception/                             # 5 custom exceptions + global handler
├── fraud/                                 # Fraud detection engine
│   ├── FraudDetectionService.java
│   ├── FraudResult.java
│   └── rules/                             # 5 pluggable fraud rules
├── model/                                 # 4 JPA entities + 7 enums
├── repository/                            # 4 Spring Data JPA repositories
├── security/                              # JWT, filters, rate limiter, cookie helper
└── service/                               # 3 business logic services
```

---

## 2. Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Language runtime |
| Spring Boot | 3.2.5 | Application framework |
| Spring Security | 3.2.5 (managed) | Authentication & authorization |
| Spring Data JPA | 3.2.5 (managed) | ORM / data access |
| Spring Validation | 3.2.5 (managed) | Bean validation |
| PostgreSQL | (runtime) | Primary database |
| Flyway | 11.20.1 | Database migrations |
| JJWT | 0.12.5 | JWT token generation/validation |
| SpringDoc OpenAPI | 2.5.0 | Swagger UI / API docs |
| Lombok | (managed) | Boilerplate reduction |
| Maven | 3.9.14 (wrapper 3.3.4) | Build tool |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 8.0.0 | Build tool & dev server |
| React Router | 7.13.1 | Client-side routing |
| Tailwind CSS | 3.4.19 | Utility-first CSS |
| Framer Motion | 12.38.0 | Animations |
| Recharts | 3.8.0 | Charts (imported, minimal use) |
| Lucide React | 0.577.0 | Icons |
| PostCSS + Autoprefixer | 8.5.8 / 10.4.27 | CSS processing |

### DevOps
- Multi-stage Docker build (Maven build -> JRE runtime)
- Flyway for schema versioning
- Environment-based configuration via `.env` files

---

## 3. Backend - Complete API Reference

### 3.1 Authentication (`/api/auth`)

| Method | Endpoint | Auth | Request | Response | Status |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | Public | `{ firstName, lastName, email, password }` | `{ email, role, firstName, lastName }` + AUTH_TOKEN cookie | 201 |
| POST | `/api/auth/login` | Public | `{ email, password }` | `{ email, role, firstName, lastName }` + AUTH_TOKEN cookie | 200 |
| POST | `/api/auth/logout` | Public | - | - (clears cookie) | 200 |

**Validation:**
- Email: `@NotBlank @Email`
- Password: 8-64 chars, must contain uppercase + lowercase + digit
- First/Last name: `@NotBlank @Size(max=50)`
- Duplicate email returns 409 Conflict

### 3.2 CSRF (`/api/csrf`)

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| GET | `/api/csrf` | Public | `{ token }` |

### 3.3 Accounts (`/api/accounts`)

| Method | Endpoint | Auth | Request | Response | Status |
|---|---|---|---|---|---|
| POST | `/api/accounts` | User | `{ accountType, initialDeposit }` | `AccountResponse` | 201 |
| GET | `/api/accounts` | User | - | `List<AccountResponse>` | 200 |
| GET | `/api/accounts/lookup?accountNumber=` | User | Query param | `AccountLookupResponse` | 200 |
| GET | `/api/accounts/{id}` | User (owner) | - | `AccountResponse` | 200 |
| GET | `/api/accounts/{id}/statement?start=&end=` | User (owner) | Date range | `List<TransactionResponse>` | 200 |

**Validation:**
- Account type: `@NotNull` SAVINGS or CHECKING
- Initial deposit: `@DecimalMin("0.0") @DecimalMax("99999999.99")`

### 3.4 Transactions (`/api/transactions`)

| Method | Endpoint | Auth | Request | Response | Status |
|---|---|---|---|---|---|
| POST | `/api/transactions` | User | `TransactionRequest` | `TransactionResponse` | 201 |
| GET | `/api/transactions/{id}` | User (owner/admin) | - | `TransactionResponse` | 200 |
| GET | `/api/transactions/history?page=0&size=20` | User | Pagination params | `Page<TransactionResponse>` | 200 |

**Transaction Types:** DEPOSIT, WITHDRAWAL, TRANSFER

**Validation:**
- Type: `@NotNull`
- Amount: `@DecimalMin("0.01") @DecimalMax("99999999.99")`
- Description: `@Size(max=200)`
- Idempotency key: `@Size(max=64)`, unique constraint

### 3.5 User Profile (`/api/user`)

| Method | Endpoint | Auth | Request | Response | Status |
|---|---|---|---|---|---|
| GET | `/api/user/profile` | User | - | `{ id, email, firstName, lastName, role, createdAt }` | 200 |
| PUT | `/api/user/profile` | User | `{ firstName, lastName }` | Updated profile | 200 |
| PUT | `/api/user/change-password` | User | `{ currentPassword, newPassword }` | - | 200 |

### 3.6 Admin (`/api/admin`) - ROLE_ADMIN only

| Method | Endpoint | Auth | Request | Response | Status |
|---|---|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin | - | `DashboardMetricsResponse` | 200 |
| GET | `/api/admin/fraud/flagged?page=0` | Admin | Pagination | `Page<TransactionResponse>` | 200 |
| PUT | `/api/admin/fraud/{id}/review` | Admin | `{ decision: "APPROVE"/"REJECT" }` | `TransactionResponse` | 200 |
| GET | `/api/admin/accounts?page=0` | Admin | Pagination | `Page<AccountResponse>` | 200 |

---

## 4. Data Models & Schema

### 4.1 Entity Relationship Diagram

```
users (1) ---< accounts (1) ---< transactions >--- accounts (1) ---< users
                  |                                       |
                  v                                       v
              fraud_logs (1:1 with transaction)
```

### 4.2 Entities

#### User
| Field | Type | Constraints |
|---|---|---|
| id | BIGSERIAL PK | Auto-generated |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL (BCrypt) |
| first_name | VARCHAR(255) | NOT NULL |
| last_name | VARCHAR(255) | NOT NULL |
| role | VARCHAR(255) | NOT NULL (USER/ADMIN) |
| created_at | TIMESTAMP(6) | NOT NULL, auto-set |

#### Account
| Field | Type | Constraints |
|---|---|---|
| id | BIGSERIAL PK | Auto-generated |
| user_id | BIGINT FK -> users | NOT NULL |
| account_number | VARCHAR(255) | NOT NULL, UNIQUE |
| account_type | VARCHAR(255) | NOT NULL (SAVINGS/CHECKING) |
| balance | NUMERIC(19,2) | NOT NULL, default 0 |
| status | VARCHAR(255) | NOT NULL (ACTIVE/FROZEN/CLOSED) |
| version | BIGINT | Optimistic lock version |
| created_at | TIMESTAMP(6) | NOT NULL, auto-set |

#### Transaction
| Field | Type | Constraints |
|---|---|---|
| id | BIGSERIAL PK | Auto-generated |
| from_account_id | BIGINT FK -> accounts | Nullable (deposits) |
| to_account_id | BIGINT FK -> accounts | Nullable (withdrawals) |
| type | VARCHAR(255) | NOT NULL (DEPOSIT/WITHDRAWAL/TRANSFER) |
| amount | NUMERIC(19,2) | NOT NULL |
| status | VARCHAR(255) | NOT NULL (PENDING/PROCESSING/COMPLETED/FAILED/FLAGGED) |
| risk_score | INTEGER | Nullable (set by fraud engine) |
| idempotency_key | VARCHAR(255) | UNIQUE |
| description | VARCHAR(255) | Nullable |
| created_at | TIMESTAMP(6) | NOT NULL, auto-set |

#### FraudLog
| Field | Type | Constraints |
|---|---|---|
| id | BIGSERIAL PK | Auto-generated |
| transaction_id | BIGINT FK -> transactions | NOT NULL, UNIQUE (1:1) |
| rules_triggered | TEXT | JSON string of triggered rule names |
| total_score | INTEGER | NOT NULL |
| decision | VARCHAR(255) | NOT NULL (AUTO_APPROVED/FLAGGED/ADMIN_APPROVED/ADMIN_REJECTED) |
| reviewed_by | BIGINT | Nullable (admin user ID) |
| reviewed_at | TIMESTAMP(6) | Nullable |
| created_at | TIMESTAMP(6) | NOT NULL, auto-set |

### 4.3 Enums

| Enum | Values | Used By |
|---|---|---|
| Role | USER, ADMIN | User |
| AccountType | SAVINGS, CHECKING | Account |
| AccountStatus | ACTIVE, FROZEN, CLOSED | Account |
| TransactionType | DEPOSIT, WITHDRAWAL, TRANSFER | Transaction |
| TransactionStatus | PENDING, PROCESSING, COMPLETED, FAILED, FLAGGED | Transaction |
| FraudDecision | AUTO_APPROVED, FLAGGED, ADMIN_APPROVED, ADMIN_REJECTED | FraudLog |
| RiskLevel | LOW, MEDIUM, HIGH, CRITICAL | FraudResult (in-memory) |

### 4.4 Database Indexes

```sql
idx_accounts_user_id           ON accounts(user_id)
idx_transactions_from_account  ON transactions(from_account_id)
idx_transactions_to_account    ON transactions(to_account_id)
idx_transactions_status        ON transactions(status)
idx_transactions_created_at    ON transactions(created_at)
idx_fraud_logs_decision        ON fraud_logs(decision)
```

---

## 5. Fraud Detection Engine

### 5.1 Architecture

Uses the **Strategy Pattern**. All rules implement the `FraudRule` interface:

```java
public interface FraudRule {
    String getName();
    int evaluate(Transaction transaction, Account sourceAccount);
}
```

Rules are auto-discovered via Spring DI (`List<FraudRule>` injection).

### 5.2 Rules

| Rule | Trigger Condition | Score | Notes |
|---|---|---|---|
| **LargeAmountRule** | Amount > $50,000 | +30 | Threshold is configurable concept |
| **HighVelocityRule** | >5 txns from same account in 1 minute | +25 | Queries TransactionRepository |
| **NewAccountRule** | Account <7 days old AND amount > $10,000 | +20 | Compares account createdAt |
| **OddHoursRule** | Transaction between 1:00 AM - 5:00 AM | +15 | Timezone-aware |
| **RapidTransferRule** | 3+ transfers to same destination in 10 minutes | +20 | Only for TRANSFER type |

### 5.3 Scoring & Risk Levels

| Score Range | Risk Level | Action |
|---|---|---|
| 0 - 20 | LOW | Auto-approve, process immediately |
| 21 - 50 | MEDIUM | Log risk, process immediately |
| 51 - 75 | HIGH | FLAGGED - requires admin review |
| 76+ | CRITICAL | FLAGGED - requires admin review |

**Maximum possible score:** 30 + 25 + 15 + 20 + 20 = 110

### 5.4 Decision Flow

```
Transaction submitted
    |
    v
FraudDetectionService.analyzeTransaction()
    |
    v
Each FraudRule.evaluate() -> individual score
    |
    v
Sum all scores -> FraudResult (totalScore, riskLevel, triggeredRules)
    |
    v
Save FraudLog with rules triggered and score
    |
    v
if HIGH/CRITICAL -> status = FLAGGED, wait for admin
if LOW/MEDIUM   -> status = PROCESSING -> process balance -> COMPLETED
```

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
1. User sends credentials -> POST /api/auth/login
2. AuthenticationManager validates via CustomUserDetailsService
3. JwtTokenProvider generates JWT (subject = userId, claims: email, role)
4. AuthCookieHelper builds httpOnly AUTH_TOKEN cookie
5. Cookie set on response (Secure, SameSite=lax, 24hr expiry)
6. NO token in response body (XSS protection)
```

### 6.2 Request Authentication

```
Request arrives
    |
    v
AuthRateLimitFilter (login/register only: 10 req/min sliding window)
    |
    v
JwtAuthenticationFilter:
    1. Extract token from AUTH_TOKEN cookie (primary)
    2. Fallback: Authorization: Bearer header (Swagger UI)
    3. Validate token signature + expiration
    4. Load user from DB via CustomUserDetailsService
    5. Set SecurityContextHolder authentication
    |
    v
Spring Security authorization check
```

### 6.3 CSRF Protection

- Cookie-based CSRF tokens (XSRF-TOKEN cookie, HttpOnly=false so JS can read)
- Frontend reads XSRF-TOKEN cookie and sends as `X-XSRF-TOKEN` header
- Exempt: `/api/auth/**` endpoints

### 6.4 Rate Limiting

- **Sliding window** algorithm per IP address
- Only on `/api/auth/login` and `/api/auth/register`
- Default: 10 requests per 60-second window
- Returns HTTP 429 with JSON error body
- Extracts real IP from `X-Forwarded-For` header (for proxies)

### 6.5 Password Security

- BCrypt password encoding
- Client-side + server-side validation:
  - 8-64 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit

### 6.6 CORS Configuration

- Configurable allowed origins (default: `http://localhost:5173`)
- All HTTP methods allowed
- Credentials allowed (for cookies)
- Max age: 1 hour (pre-flight caching)

---

## 7. Frontend Architecture

### 7.1 Routing

| Route | Component | Access | Description |
|---|---|---|---|
| `/` | LandingPage | Public | Marketing page with intro animation |
| `/login` | LoginPage | Public | Split-screen login form |
| `/register` | RegisterPage | Public | Registration with password strength |
| `/dashboard` | DashboardPage | Authenticated | Full user banking dashboard |
| `/admin` | AdminDashboardPage | Admin only | Fraud review + system metrics |
| `*` | NotFoundPage | Public | Animated 404 |

### 7.2 Design System

- **Fonts:** Playfair Display (headings), Outfit (body), JetBrains Mono (mono)
- **Colors:** Burnt orange accent (#E8752A light / #F0913A dark), warm off-white background (#F7F7F2), deep navy dark mode (#0B0B0F)
- **Dark mode:** Class-based toggle via `data-theme="dark"` on `<html>`, persisted to localStorage
- **Animations:** Framer Motion for page transitions, scroll reveals, hover effects, modal enter/exit

### 7.3 Component Architecture

```
src/
├── main.jsx                    # Provider stack: StrictMode > BrowserRouter > Theme > Auth > App
├── App.jsx                     # Lazy routes + ProtectedRoute + ToastProvider
├── context/
│   ├── AuthContext.jsx          # Session hydration from cookie, login/logout
│   └── ThemeContext.jsx         # Dark/light toggle, localStorage persistence
├── hooks/
│   ├── useApi.js               # Generic async API wrapper (loading/error/data)
│   └── useAuth.js              # Re-export of AuthContext
├── services/
│   └── api.js                  # Centralized HTTP client (cookie auth, CSRF headers)
├── pages/                      # 6 page components
└── components/
    ├── common/                  # Reusable: Button, Card, Input, Badge, Modal, Loader, Toast, ThemeToggle
    ├── landing/                 # Hero, Features, Architecture, HowItWorks, TechStack, Navbar, Footer, IntroAnimation
    ├── auth/                    # LoginForm (stub), RegisterForm (stub), PasswordStrength
    ├── dashboard/               # AccountCard, BalanceOverview, CreateAccountModal, NewTransactionModal, StatusBadge, TransactionTable
    └── admin/                   # MetricsGrid, FlaggedTable, ReviewActions (stub), AllAccountsTable
```

### 7.4 Key Frontend Features

- **Intro Animation:** One-time brand animation (shield logo + "SecureTransact" reveal), plays once per session
- **Landing Page:** Parallax isometric grid, feature cards, timeline, architecture diagram, tech stack display
- **User Dashboard:** 4 tabs (Dashboard, Accounts, Transactions, Settings), real-time balance overview, quick actions, browser notifications for transaction status
- **Admin Dashboard:** 4 tabs (Dashboard, Flagged, All Accounts, Settings), 6 KPI metrics, approve/reject flagged transactions with confirmation, auto-refresh every 30s
- **Modals:** Accessible (Escape key, body scroll lock, portal-rendered), mobile bottom-sheet variant
- **Responsive:** Mobile hamburger nav, stacked layouts, touch-friendly targets

### 7.5 API Client (`services/api.js`)

- Credentials: `include` (for cookie auth)
- CSRF: Reads XSRF-TOKEN cookie, attaches as `X-XSRF-TOKEN` header on POST/PUT/DELETE
- Auto-logout on 401 (registered by AuthContext)
- Configurable base URL via `VITE_API_URL` env var

---

## 8. Transaction State Machine

```
                    +-----------+
                    |  PENDING  |
                    +-----+-----+
                          |
                          v
                  +-------+--------+
                  |  Fraud Engine   |
                  |  Analyzes Txn   |
                  +-------+--------+
                          |
              +-----------+-----------+
              |                       |
              v                       v
        LOW/MEDIUM               HIGH/CRITICAL
              |                       |
              v                       v
      +-------+-------+       +------+------+
      |  PROCESSING    |       |   FLAGGED   |
      +-------+-------+       +------+------+
              |                       |
              v                       |
      +-------+-------+               v
      |   COMPLETED   |       +------+--------+
      +---------------+       | Admin Reviews |
                              +------+--------+
                                     |
                          +----------+----------+
                          |                     |
                          v                     v
                  ADMIN_APPROVED         ADMIN_REJECTED
                          |                     |
                          v                     v
                  +-------+-------+     +------+------+
                  |   COMPLETED   |     |    FAILED    |
                  +---------------+     +--------------+
```

**Note:** PROCESSING -> FAILED can also happen on optimistic lock exhaustion or insufficient balance during retry.

---

## 9. Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Locking Strategy | Optimistic (`@Version`) | Better throughput for read-heavy workloads; retry handles rare conflicts |
| Fraud Detection | Rule-based (not ML) | Auditable, deterministic, explainable; ML requires training data |
| Idempotency | Optional key per transaction | Prevents duplicate processing from network retries |
| Token Storage | HttpOnly cookie | Not accessible via JavaScript (XSS protection) |
| Session Management | Stateless (JWT) | Enables horizontal scaling without shared session store |
| Schema Management | Flyway migrations | Version-controlled, repeatable, auditable schema changes |
| Rate Limiting | Sliding window in-memory | Simple, effective for single-instance; would need Redis for distributed |
| Password Hashing | BCrypt | Industry standard, adaptive cost factor |

---

## 10. Project File Inventory

### Backend (59 Java files + config)

| Layer | Count | Files |
|---|---|---|
| Entry Point | 1 | `SecureTransactApplication.java` |
| Configuration | 2 | `SecurityConfig.java`, `AdminSeeder.java` |
| Controllers | 6 | Auth, Account, Transaction, Admin, User, CSRF |
| Services | 3 | `AccountService`, `TransactionService`, `AdminService` |
| Repositories | 4 | User, Account, Transaction, FraudLog |
| Models | 4 entities + 7 enums | User, Account, Transaction, FraudLog + 7 enums |
| DTOs | 12 | All request/response objects |
| Fraud Engine | 8 | `FraudDetectionService`, `FraudResult`, `FraudRule` interface, 5 rules |
| Security | 6 | JWT provider, auth filter, user details, rate limiter, cookie helper, user details service |
| Exceptions | 6 | 5 custom + `GlobalExceptionHandler` |
| Tests | 2 | `AuthControllerTest` (5 tests), `FraudDetectionServiceTest` (6 tests) |

### Frontend (49 JSX/JS files)

| Category | Count |
|---|---|
| Pages | 6 |
| Landing components | 8 |
| Dashboard components | 6 |
| Admin components | 4 |
| Auth components | 3 |
| Common components | 8 |
| Context providers | 2 |
| Hooks | 2 |
| Services | 1 |
| Config files | 5 |
| CSS | 1 |

### Infrastructure
- `Dockerfile` - Multi-stage Docker build
- `V1__create_schema.sql` - Flyway migration
- `application.yml` + `application-test.yml` - Config profiles
- `.env` + `.env.example` - Environment variables
- `start.ps1` - PowerShell start script
