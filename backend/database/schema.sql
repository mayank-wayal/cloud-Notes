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
  s3_key TEXT UNIQUE,
  note_type TEXT NOT NULL DEFAULT 'file' CHECK (note_type IN ('file', 'note')),
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  file_name TEXT,
  content_type TEXT,
  file_size BIGINT NOT NULL DEFAULT 0 CHECK (file_size >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notes
  ALTER COLUMN s3_key DROP NOT NULL;

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS note_type TEXT NOT NULL DEFAULT 'file';

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE notes
  ALTER COLUMN file_size SET DEFAULT 0;

ALTER TABLE notes
  DROP CONSTRAINT IF EXISTS notes_note_type_check;

ALTER TABLE notes
  ADD CONSTRAINT notes_note_type_check CHECK (note_type IN ('file', 'note'));

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS file_name TEXT;

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS content_type TEXT;

ALTER TABLE notes
  DROP CONSTRAINT IF EXISTS notes_user_id_fkey;

ALTER TABLE notes
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

CREATE INDEX IF NOT EXISTS idx_notes_user_id_created_at ON notes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_id_note_type_created_at ON notes(user_id, note_type, created_at DESC);
