-- V1: Initial schema for SecureTransact
-- Matches JPA entities (User, Account, Transaction, FraudLog) under Hibernate 6 conventions.

CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    first_name  VARCHAR(255) NOT NULL,
    last_name   VARCHAR(255) NOT NULL,
    role        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP(6) NOT NULL
);

CREATE TABLE accounts (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT NOT NULL REFERENCES users(id),
    account_number VARCHAR(255) NOT NULL UNIQUE,
    account_type   VARCHAR(255) NOT NULL,
    balance        NUMERIC(19, 2) NOT NULL,
    status         VARCHAR(255) NOT NULL,
    version        BIGINT,
    created_at     TIMESTAMP(6) NOT NULL
);

CREATE TABLE transactions (
    id               BIGSERIAL PRIMARY KEY,
    from_account_id  BIGINT REFERENCES accounts(id),
    to_account_id    BIGINT REFERENCES accounts(id),
    type             VARCHAR(255) NOT NULL,
    amount           NUMERIC(19, 2) NOT NULL,
    status           VARCHAR(255) NOT NULL,
    risk_score       INTEGER,
    idempotency_key  VARCHAR(255) UNIQUE,
    description      VARCHAR(255),
    created_at       TIMESTAMP(6) NOT NULL
);

CREATE TABLE fraud_logs (
    id              BIGSERIAL PRIMARY KEY,
    transaction_id  BIGINT NOT NULL UNIQUE REFERENCES transactions(id),
    rules_triggered TEXT,
    total_score     INTEGER NOT NULL,
    decision        VARCHAR(255) NOT NULL,
    reviewed_by     BIGINT,
    reviewed_at     TIMESTAMP(6),
    created_at      TIMESTAMP(6) NOT NULL
);

-- Indexes backing repository queries
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON transactions(to_account_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_fraud_logs_decision ON fraud_logs(decision);
