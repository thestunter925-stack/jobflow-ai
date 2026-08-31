-- =========================================================
-- JOBFLOW AI - PostgreSQL DATABASE SCHEMA
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT,

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    email_verified_at TIMESTAMPTZ,

    trial_started_at TIMESTAMPTZ,

    trial_expires_at TIMESTAMPTZ,

    premium_expires_at TIMESTAMPTZ,

    is_owner BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- PROFILES
-- =========================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    full_name VARCHAR(150),

    phone VARCHAR(30),

    headline VARCHAR(255),

    location VARCHAR(150),

    bio TEXT,

    skills TEXT[],

    education TEXT,

    experience TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- JOBS
-- =========================================================

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,

    company VARCHAR(255),

    location VARCHAR(255),

    job_type VARCHAR(100),

    description TEXT,

    application_url TEXT,

    source VARCHAR(100),

    salary_min NUMERIC,

    salary_max NUMERIC,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- SAVED JOBS
-- =========================================================

CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    job_id UUID NOT NULL
        REFERENCES jobs(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, job_id)
);


-- =========================================================
-- APPLICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    job_id UUID
        REFERENCES jobs(id)
        ON DELETE SET NULL,

    company VARCHAR(255),

    position VARCHAR(255),

    status VARCHAR(50) NOT NULL DEFAULT 'Applied',

    applied_at TIMESTAMPTZ,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- RESUMES
-- =========================================================

CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(255),

    title VARCHAR(255),

    skills TEXT,

    experience TEXT,

    education TEXT,

    summary TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- INTERVIEWS
-- =========================================================

CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    job_title VARCHAR(255),

    company VARCHAR(255),

    questions JSONB DEFAULT '[]'::jsonb,

    answers JSONB DEFAULT '[]'::jsonb,

    score NUMERIC,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- COVER LETTERS
-- =========================================================

CREATE TABLE IF NOT EXISTS cover_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    job_title VARCHAR(255),

    company VARCHAR(255),

    content TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- SUBSCRIPTIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    plan VARCHAR(50) NOT NULL DEFAULT 'premium',

    amount NUMERIC NOT NULL DEFAULT 499,

    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    status VARCHAR(50) NOT NULL DEFAULT 'pending',

    payment_reference VARCHAR(255),

    provider VARCHAR(50),

    started_at TIMESTAMPTZ,

    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id
ON profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id
ON saved_jobs(user_id);

CREATE INDEX IF NOT EXISTS idx_applications_user_id
ON applications(user_id);

CREATE INDEX IF NOT EXISTS idx_applications_status
ON applications(status);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id
ON resumes(user_id);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id
ON interviews(user_id);

CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id
ON cover_letters(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
ON subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_reference
ON subscriptions(payment_reference);


-- =========================================================
-- COMPLETE
-- =========================================================

SELECT 'JobFlow AI database schema ready.' AS message;