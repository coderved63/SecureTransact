-- V2: Add risk platform tables
-- Adds configurable fraud rules, behavioral profiling, risk cases, and audit trail.

CREATE TABLE fraud_rule_configs (
    id                  BIGSERIAL PRIMARY KEY,
    rule_name           VARCHAR(255) NOT NULL UNIQUE,
    description         VARCHAR(255) NOT NULL,
    enabled             BOOLEAN NOT NULL,
    score_weight        INTEGER NOT NULL,
    priority            INTEGER NOT NULL,
    threshold_numeric   NUMERIC(19, 2),
    threshold_integer   INTEGER,
    threshold_string    VARCHAR(255),
    created_at          TIMESTAMP(6) NOT NULL,
    updated_at          TIMESTAMP(6) NOT NULL
);

CREATE TABLE user_behavior_profiles (
    id                          BIGSERIAL PRIMARY KEY,
    user_id                     BIGINT NOT NULL UNIQUE REFERENCES users(id),
    avg_transaction_amount      NUMERIC(19, 2) NOT NULL,
    stddev_transaction_amount   NUMERIC(19, 2) NOT NULL,
    total_transaction_count     INTEGER NOT NULL,
    transactions_last_24h       INTEGER NOT NULL,
    transactions_last_hour      INTEGER NOT NULL,
    typical_start_hour          NUMERIC(5, 2) NOT NULL,
    typical_end_hour            NUMERIC(5, 2) NOT NULL,
    has_baseline                BOOLEAN NOT NULL,
    last_updated                TIMESTAMP(6) NOT NULL
);

CREATE TABLE fraud_blacklist (
    id              BIGSERIAL PRIMARY KEY,
    type            VARCHAR(255) NOT NULL,
    value           VARCHAR(255) NOT NULL,
    reason          VARCHAR(255),
    active          BOOLEAN NOT NULL,
    created_at      TIMESTAMP(6) NOT NULL
);

CREATE TABLE risk_evaluations (
    id                  BIGSERIAL PRIMARY KEY,
    transaction_id      BIGINT NOT NULL UNIQUE REFERENCES transactions(id),
    total_score         INTEGER NOT NULL,
    risk_level          VARCHAR(255) NOT NULL,
    decision            VARCHAR(255) NOT NULL,
    model_version       VARCHAR(255) NOT NULL,
    triggered_rules     VARCHAR(2000),
    reasons             VARCHAR(2000),
    ml_probability      NUMERIC(5, 4),
    evaluated_at        TIMESTAMP(6) NOT NULL
);

CREATE TABLE risk_cases (
    id                      BIGSERIAL PRIMARY KEY,
    transaction_id          BIGINT NOT NULL REFERENCES transactions(id),
    risk_evaluation_id      BIGINT NOT NULL REFERENCES risk_evaluations(id),
    status                  VARCHAR(255) NOT NULL,
    assigned_to             BIGINT REFERENCES users(id),
    review_notes            VARCHAR(2000),
    admin_decision          VARCHAR(255),
    created_at              TIMESTAMP(6) NOT NULL,
    reviewed_at             TIMESTAMP(6),
    reviewed_by             BIGINT REFERENCES users(id)
);

CREATE TABLE audit_events (
    id              BIGSERIAL PRIMARY KEY,
    actor_user_id   BIGINT REFERENCES users(id),
    action          VARCHAR(255) NOT NULL,
    resource_type   VARCHAR(255) NOT NULL,
    resource_id     BIGINT,
    metadata        VARCHAR(2000),
    ip_address      VARCHAR(255),
    user_agent      VARCHAR(255),
    created_at      TIMESTAMP(6) NOT NULL
);

-- Indexes
CREATE INDEX idx_fraud_rule_configs_name ON fraud_rule_configs(rule_name);
CREATE INDEX idx_fraud_rule_configs_enabled ON fraud_rule_configs(enabled);
CREATE INDEX idx_user_behavior_profiles_user ON user_behavior_profiles(user_id);
CREATE INDEX idx_fraud_blacklist_type_value ON fraud_blacklist(type, value, active);
CREATE INDEX idx_risk_evaluations_transaction ON risk_evaluations(transaction_id);
CREATE INDEX idx_risk_cases_status ON risk_cases(status);
CREATE INDEX idx_risk_cases_transaction ON risk_cases(transaction_id);
CREATE INDEX idx_audit_events_action ON audit_events(action);
CREATE INDEX idx_audit_events_actor ON audit_events(actor_user_id);
CREATE INDEX idx_audit_events_resource ON audit_events(resource_type, resource_id);
CREATE INDEX idx_audit_events_created ON audit_events(created_at);
