-- Stepaside Golf Course - database schema (SQLite for local dev).
-- IDs and timestamps are generated in application code (crypto.randomUUID(), new Date().toISOString())
-- rather than DB-specific functions, so this schema ports easily to Postgres for the AWS deployment.

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Member' CHECK (role IN ('Admin', 'Member')),
    created_at TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS tee_time_slots (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    available INTEGER NOT NULL DEFAULT 4,
    created_at TEXT NOT NULL,
    UNIQUE (date, time)
);

CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    tee_time_slot_id TEXT NOT NULL REFERENCES tee_time_slots(id),
    type TEXT NOT NULL CHECK (type IN ('Visitor', 'Society', 'Member')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    party_size INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    user_id TEXT REFERENCES users(id)
);
