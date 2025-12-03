-- Drizzle migration: create session table for connect-pg-simple

CREATE TABLE IF NOT EXISTS session (
  sid varchar PRIMARY KEY NOT NULL,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
