-- Practice Mode - Educational Simulation Infrastructure
-- Migration: 004_practice_mode
-- Created: 2026-01-03
-- Purpose: Support practice mode for mandatory client education before real issuance

-- Practice sessions table: Tracks all practice mode attempts and completions
CREATE TABLE IF NOT EXISTS practice_sessions (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    quiz_score INTEGER,
    quiz_attempts INTEGER DEFAULT 0 NOT NULL,
    selected_tier TEXT,
    selected_identifier TEXT,
    mock_certificate_json TEXT,
    completion_token TEXT UNIQUE,
    verified_email BOOLEAN DEFAULT FALSE NOT NULL,
    verification_token TEXT UNIQUE,
    verification_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_practice_sessions_email ON practice_sessions(email);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_session_token ON practice_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_completion_token ON practice_sessions(completion_token);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_verified_email ON practice_sessions(verified_email);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_completed_at ON practice_sessions(completed_at);

-- Quiz attempts log: Track individual quiz attempts for analysis
CREATE TABLE IF NOT EXISTS practice_quiz_attempts (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    attempt_number INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    failed_question_ids TEXT, -- Comma-separated list of failed question numbers
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (session_id) REFERENCES practice_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_practice_quiz_attempts_session_id ON practice_quiz_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_quiz_attempts_score ON practice_quiz_attempts(score);

-- Email verification tokens: Track verification status
CREATE TABLE IF NOT EXISTS practice_email_verifications (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (session_id) REFERENCES practice_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_practice_email_verifications_token ON practice_email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_practice_email_verifications_session_id ON practice_email_verifications(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_email_verifications_verified ON practice_email_verifications(verified);

-- Analytics: Track completion funnel
CREATE TABLE IF NOT EXISTS practice_analytics (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'entry', 'email_verified', 'quiz_started', 'quiz_failed', 'quiz_passed', 'completed'
    session_id TEXT NOT NULL,
    screen_number INTEGER,
    metadata TEXT, -- JSON for additional context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (session_id) REFERENCES practice_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_practice_analytics_event_type ON practice_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_practice_analytics_session_id ON practice_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_practice_analytics_created_at ON practice_analytics(created_at);
