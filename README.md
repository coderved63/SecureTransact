# SecureTransact — Transaction Processing & Fraud Detection Platform

A full-stack banking simulation platform with real-time fraud detection, built with Java Spring Boot and React.

## Tech Stack

**Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, PostgreSQL
**Frontend:** React, Tailwind CSS, Recharts, Axios
**Testing:** JUnit 5, Mockito, H2 (in-memory)
**API Docs:** Swagger/OpenAPI

## Features

- **User Authentication** — JWT-based registration/login with BCrypt password hashing
- **Account Management** — Create savings/checking accounts, view balances, generate statements
- **Transaction Engine** — Deposit, withdrawal, and transfer with optimistic locking for concurrency safety and idempotency keys to prevent duplicate processing
- **Fraud Detection** — 5 pluggable rule-based detection engine:
  - Large Amount (>$50K)
  - High Velocity (>5 txns/min)
  - Odd Hours (1-5 AM)
  - New Account + Large Transaction
  - Rapid Transfers to same account
- **Risk Scoring** — LOW (0-20) / MEDIUM (21-50) / HIGH (51-75) / CRITICAL (76+)
- **Admin Dashboard** — Real-time metrics, charts, flagged transaction review (approve/reject)
- **Role-Based Access** — USER and ADMIN roles with Spring Security

## Getting Started

### Prerequisites
- Java 17+
- PostgreSQL
- Node.js 18+
- Maven

### Backend Setup

```bash
# Create PostgreSQL database
createdb securetransact

# Run the backend
cd backend
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui.html`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Running Tests

```bash
cd backend
mvn test
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login | Public |
| POST | /api/accounts | Create account | USER |
| GET | /api/accounts | List my accounts | USER |
| GET | /api/accounts/{id} | Account details | USER |
| POST | /api/transactions | Submit transaction | USER |
| GET | /api/transactions/history | Transaction history | USER |
| GET | /api/admin/dashboard | Dashboard metrics | ADMIN |
| GET | /api/admin/fraud/flagged | Flagged transactions | ADMIN |
| PUT | /api/admin/fraud/{id}/review | Approve/reject | ADMIN |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  React UI   │────▶│  Spring Boot │────▶│   PostgreSQL    │
│  (Vite)     │     │  REST API    │     │                 │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
                    ┌──────▼───────┐
                    │    Fraud     │
                    │  Detection   │
                    │   Engine     │
                    └──────────────┘
```

## Project Structure

```
SecureTransact/
├── backend/
│   ├── src/main/java/com/securetransact/
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic
│   │   ├── model/          # JPA entities & enums
│   │   ├── repository/     # Data access layer
│   │   ├── fraud/          # Fraud detection engine & rules
│   │   ├── security/       # JWT & Spring Security
│   │   ├── dto/            # Request/Response objects
│   │   ├── exception/      # Global error handling
│   │   └── config/         # App configuration
│   └── src/test/java/      # Unit & integration tests
│
├── frontend/
│   └── src/
│       ├── pages/          # Login, Register, Dashboard, Admin
│       ├── components/     # Navbar, shared components
│       ├── services/       # Axios API layer
│       └── context/        # Auth state management
│
└── README.md
```
