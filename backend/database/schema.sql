CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title VARCHAR(120) NOT NULL,
  s3_key TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL CHECK (file_size >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notes
  DROP CONSTRAINT IF EXISTS notes_user_id_fkey;

ALTER TABLE notes
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

CREATE INDEX IF NOT EXISTS idx_notes_user_id_created_at ON notes(user_id, created_at DESC);
