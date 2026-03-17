# SecureTransact

A production-grade transaction processing and fraud detection platform. Built to simulate how real banking systems handle financial transactions — with ACID-compliant processing, concurrent transaction safety, and an intelligent rule-based fraud scoring engine.

## The Problem

Financial institutions process millions of transactions daily. Each one needs to be:
- **Validated** — sufficient funds, correct accounts, proper authorization
- **Processed atomically** — no partial state, no double-spending
- **Screened for fraud** — suspicious patterns flagged before money moves
- **Auditable** — every decision logged and reviewable

SecureTransact implements all four of these at the application level.

## How It Works

```
User submits transaction
        │
        ▼
┌─────────────────────┐
│  Validation Layer    │  ── Check accounts exist, balance sufficient, accounts active
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Fraud Detection     │  ── 5 rules evaluate in parallel, each contributing risk points
│  Engine              │
│                      │
│  ┌───────────────┐   │     Score 0-20   → AUTO_APPROVED
│  │ LargeAmount   │+25│     Score 21-50  → Approved + logged
│  │ HighVelocity  │+25│     Score 51-75  → FLAGGED for admin review
│  │ OddHours      │+15│     Score 76+    → BLOCKED
│  │ NewAccount    │+20│
│  │ RapidTransfer │+20│
│  └───────────────┘   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Transaction Engine  │  ── Optimistic locking (version field) prevents race conditions
│                      │     Idempotency keys prevent duplicate processing
│                      │     @Transactional with proper isolation levels
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  PostgreSQL          │  ── ACID-compliant persistence
│                      │     Balance updates are atomic
└──────────────────────┘
```

## Fraud Detection Rules

| Rule | Triggers When | Points |
|------|--------------|--------|
| **LargeAmount** | Transaction exceeds threshold | +25 |
| **HighVelocity** | >5 transactions from same account in 1 minute | +25 |
| **OddHours** | Transaction submitted between 1:00 AM — 5:00 AM | +15 |
| **NewAccount** | Account is < 7 days old AND transaction is large | +20 |
| **RapidTransfer** | Multiple transfers to the same destination in 10 minutes | +20 |

Rules are pluggable — each implements a `FraudRule` interface, making it easy to add new ones without touching existing code.

## Concurrency Safety

The core engineering challenge in a transaction system is handling concurrent access to the same account.

**Problem:** Two withdrawals hit Account A (balance: $1000) simultaneously. Without protection, both read $1000, both succeed, and the balance goes to -$500.

**Solution:** Optimistic locking via a `version` column on the Account entity. When a transaction reads an account, it captures the version number. On write, Spring Data JPA checks if the version has changed — if another transaction modified it first, an `OptimisticLockException` is thrown and the transaction is retried or failed.

```java
@Entity
public class Account {
    @Version
    private Long version;  // Incremented on every update
    // ...
}
```

## Idempotent Processing

Every transaction can carry an optional `idempotencyKey`. If a client submits the same key twice (e.g., due to a network retry), the server returns the original result instead of processing a duplicate.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3 |
| Security | Spring Security + JWT (BCrypt hashing, 24hr token expiry) |
| Database | PostgreSQL + Spring Data JPA (Hibernate) |
| Testing | JUnit 5 + Mockito + H2 (in-memory for tests) |
| API Docs | Swagger / OpenAPI 3.0 |
| Frontend | React + Tailwind CSS |

## API Reference

### Public
```
POST /api/auth/register    { firstName, lastName, email, password }  →  { token, email, role }
POST /api/auth/login       { email, password }                      →  { token, email, role }
```

### User (requires Bearer token)
```
POST /api/accounts                    Create savings/checking account
GET  /api/accounts                    List my accounts
GET  /api/accounts/{id}               Account details + balance
GET  /api/accounts/{id}/statement     Transaction statement (date range filter)

POST /api/transactions                Submit deposit/withdrawal/transfer
GET  /api/transactions/{id}           Transaction status + risk score
GET  /api/transactions/history        Paginated transaction history
```

### Admin (requires ADMIN role)
```
GET  /api/admin/dashboard             Real-time metrics (txn count, volume, flagged count)
GET  /api/admin/fraud/flagged         All flagged transactions (paginated)
PUT  /api/admin/fraud/{id}/review     Approve or reject a flagged transaction
GET  /api/admin/accounts              All accounts in the system (paginated)
```

## Transaction States

```
PENDING  →  PROCESSING  →  COMPLETED   (success)
                         →  FAILED      (insufficient funds, frozen account, etc.)
                         →  FLAGGED     (fraud score 51+, awaiting admin review)
                                          → ADMIN_APPROVED
                                          → ADMIN_REJECTED
```

## Project Structure

```
SecureTransact/
├── backend/
│   └── src/main/java/com/securetransact/
│       ├── controller/        REST endpoints (Auth, Account, Transaction, Admin)
│       ├── service/           Business logic (AccountService, TransactionService, AdminService)
│       ├── model/             JPA entities (User, Account, Transaction, FraudLog) + enums
│       ├── repository/        Spring Data JPA repositories
│       ├── fraud/             Fraud detection engine
│       │   ├── FraudDetectionService.java    Orchestrates all rules
│       │   ├── FraudResult.java              Score + risk level + triggered rules
│       │   └── rules/                        Individual rule implementations
│       ├── security/          JWT token provider, auth filter, user details
│       ├── dto/               Request/Response DTOs with validation annotations
│       ├── exception/         Global exception handler
│       └── config/            Security config, Swagger config
│
├── frontend/                  React dashboard (in development)
│
└── README.md
```

## Running Locally

**Prerequisites:** Java 17+, PostgreSQL, Maven

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE securetransact;"

# 2. Start the backend
cd backend
mvn spring-boot:run
# Server starts on http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html

# 3. Run tests
mvn test
```

## Design Decisions

**Why optimistic locking over pessimistic?**
Pessimistic locking (SELECT FOR UPDATE) holds database row locks, reducing throughput under high concurrency. Optimistic locking allows parallel reads and only fails on conflicting writes — better for a system where most transactions don't compete for the same account simultaneously.

**Why rule-based fraud detection over ML?**
Rule-based systems are transparent, auditable, and immediately explainable — critical requirements in financial compliance. Each flagged transaction shows exactly which rules triggered and why. ML models are black boxes that are harder to audit and justify to regulators.

**Why idempotency keys?**
Network failures are inevitable. A client might retry a transaction without knowing the first attempt succeeded. Without idempotency protection, the user gets charged twice. With it, the retry safely returns the original result.

**Why JWT over sessions?**
Stateless authentication scales horizontally — any backend instance can validate a token without checking a session store. This mirrors how production banking APIs work behind load balancers.
