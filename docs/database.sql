-- ==============================================================================
-- RapidPath - AI-Powered Emergency Vehicle Route Optimizer
-- Production PostgreSQL Relational Schema (Section 10 Specification)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    badge_number VARCHAR(100),
    jurisdiction VARCHAR(200) DEFAULT 'Metropolitan Emergency Dispatch',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Route Requests Table
CREATE TABLE IF NOT EXISTS route_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    origin_text TEXT NOT NULL,
    destination_text TEXT NOT NULL,
    origin_lat DOUBLE PRECISION NOT NULL,
    origin_lng DOUBLE PRECISION NOT NULL,
    destination_lat DOUBLE PRECISION NOT NULL,
    destination_lng DOUBLE PRECISION NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    emergency_priority VARCHAR(30) NOT NULL,
    incident_type VARCHAR(50),
    notes TEXT,
    recommended_route_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES route_requests(id) ON DELETE CASCADE,
    route_index INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    summary TEXT,
    distance_meters INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    traffic_duration_seconds INTEGER NOT NULL,
    traffic_level VARCHAR(30) NOT NULL DEFAULT 'moderate',
    predicted_delay_seconds INTEGER DEFAULT 0,
    risk_level VARCHAR(30) NOT NULL DEFAULT 'low',
    reliability_score NUMERIC(5,2) NOT NULL,
    emergency_score NUMERIC(5,2) NOT NULL,
    overall_score NUMERIC(5,2) NOT NULL,
    encoded_polyline TEXT NOT NULL,
    is_recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. AI Analyses Table
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES route_requests(id) ON DELETE CASCADE,
    recommended_route_index INTEGER NOT NULL,
    confidence_score NUMERIC(5,2) NOT NULL,
    summary TEXT NOT NULL,
    reasoning TEXT,
    risk_factors JSONB NOT NULL DEFAULT '[]',
    recommendations JSONB NOT NULL DEFAULT '[]',
    model_name VARCHAR(100) DEFAULT 'gemini-1.5-flash',
    is_fallback BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Route Events Table
CREATE TABLE IF NOT EXISTS route_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    request_id UUID REFERENCES route_requests(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(30) NOT NULL DEFAULT 'medium',
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    source VARCHAR(100) DEFAULT 'dispatch-sensor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    level VARCHAR(20) DEFAULT 'info',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_id UUID REFERENCES route_requests(id) ON DELETE SET NULL,
    duration_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Required Indexes
CREATE INDEX IF NOT EXISTS idx_route_requests_user_id ON route_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_route_requests_created_at ON route_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_routes_request_id ON routes(request_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_request_id ON ai_analyses(request_id);
CREATE INDEX IF NOT EXISTS idx_route_events_route_id ON route_events(route_id);
CREATE INDEX IF NOT EXISTS idx_route_events_created_at ON route_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
