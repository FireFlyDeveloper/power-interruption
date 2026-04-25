-- Power Interruption Monitoring System - PostgreSQL Schema
-- Optimized for IoT device inserts and time-based queries

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- DEVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    signal_strength INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(100) NOT NULL REFERENCES devices(device_id),
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    severity VARCHAR(20) NOT NULL DEFAULT 'Medium',
    location TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration INTEGER,
    notes TEXT,
    affected_customers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_device_id ON events(device_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- ============================================
-- STATUS_LOGS TABLE
-- Optimized for frequent IoT inserts
-- ============================================
CREATE TABLE IF NOT EXISTS status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    current DOUBLE PRECISION,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_logs_device_id ON status_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_status_logs_timestamp ON status_logs(timestamp);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update last_seen on device activity
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update device last_seen
DROP TRIGGER IF EXISTS device_last_seen_trigger ON devices;
CREATE TRIGGER device_last_seen_trigger
    BEFORE UPDATE ON devices
    FOR EACH ROW
    WHEN (OLD.last_seen IS DISTINCT FROM NEW.last_seen)
    EXECUTE FUNCTION update_device_last_seen();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS devices_updated_at_trigger ON devices;
CREATE TRIGGER devices_updated_at_trigger
    BEFORE UPDATE ON devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS events_updated_at_trigger ON events;
CREATE TRIGGER events_updated_at_trigger
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS
-- ============================================

-- Active power events view
CREATE OR REPLACE VIEW active_power_events AS
SELECT
    e.id,
    e.device_id,
    d.name AS device_name,
    e.status,
    e.severity,
    e.location,
    e.lat,
    e.lng,
    e.start_time,
    EXTRACT(EPOCH FROM (NOW() - e.start_time)) / 60 AS duration_minutes,
    e.affected_customers,
    e.notes,
    e.created_at
FROM events e
LEFT JOIN devices d ON e.device_id = d.device_id
WHERE e.status IN ('Active', 'Investigating');

-- Device status summary
CREATE OR REPLACE VIEW device_status_summary AS
SELECT
    device_id,
    name,
    status,
    lat,
    lng,
    last_seen,
    signal_strength,
    CASE
        WHEN last_seen > NOW() - INTERVAL '5 minutes' THEN 'online'
        ELSE 'offline'
    END AS current_status
FROM devices;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default admin user (password: admin123)
-- Note: In production, use proper password hashing
INSERT INTO users (email, password_hash, display_name, role)
VALUES ('admin@example.com', '$2a$10$YourHashedPasswordHere', 'System Admin', 'admin')
ON CONFLICT (email) DO NOTHING;