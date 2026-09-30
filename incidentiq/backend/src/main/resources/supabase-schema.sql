-- ====================================================================
-- IncidentIQ — Supabase PostgreSQL Schema (Document 05)
-- Run this in the Supabase SQL Editor if you prefer manual execution
-- or let Spring Data JPA / Hibernate auto-create via ddl-auto=update
-- ====================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('EMPLOYEE', 'IT_STAFF', 'ADMIN')),
    department VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sla_hours INTEGER
);

-- 3. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    raised_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ai_resolution TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITHOUT TIME ZONE,
    sla_deadline TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    sla_breached BOOLEAN NOT NULL DEFAULT FALSE
);

-- 4. Ticket Comments Table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Ticket History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS ticket_history (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    changed_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Initial Category Seeds (Default Rule 8 SLAs)
INSERT INTO categories (name, description, sla_hours) VALUES
('Network', 'Network switches, VPN, internet connectivity, and routers', 4),
('Hardware', 'Physical workstations, monitors, docks, and peripheral equipment', 8),
('Software', 'Operating system anomalies, office suites, and corporate tools', 8),
('Security', 'Unauthorized access, malicious software alerts, and identity breaches', 1)
ON CONFLICT (name) DO NOTHING;

-- Initial Seed Users (BCrypt 12 password: 'password123')
INSERT INTO users (name, email, password, role, department, is_active, created_at) VALUES
('Elena Rostova', 'admin@incidentiq.com', '$2a$12$R.cO2d0bVl92R.oFp2qgVeTjN0k2aVl3oUaR0l3g0q0q0q0q0q0q.', 'ADMIN', 'IT Operations', TRUE, NOW()),
('Marcus Vance', 'staff@incidentiq.com', '$2a$12$R.cO2d0bVl92R.oFp2qgVeTjN0k2aVl3oUaR0l3g0q0q0q0q0q0q.', 'IT_STAFF', 'Network & Systems', TRUE, NOW()),
('Alex Rivers', 'employee@incidentiq.com', '$2a$12$R.cO2d0bVl92R.oFp2qgVeTjN0k2aVl3oUaR0l3g0q0q0q0q0q0q.', 'EMPLOYEE', 'Engineering', TRUE, NOW())
ON CONFLICT (email) DO NOTHING;
