-- Hanzo Base schema for Daily Standup (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org`.
--
-- Access rules (enforced by Base from the verified IAM principal on every
-- list / view / create / update / delete):
--
--   @request.auth.org_id = org
--
-- i.e. a member of your org reads and writes your team's standup; other orgs
-- cannot see it. Keep this file in lockstep with what the app reads/writes
-- (src/lib/standup.ts `Update`, src/views/*.tsx).

CREATE TABLE IF NOT EXISTS updates (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user      TEXT NOT NULL,              -- display name of the poster (Base also stamps owner)
  day       TEXT NOT NULL,              -- standup date, YYYY-MM-DD
  yesterday TEXT NOT NULL DEFAULT '',   -- what they wrapped up
  today     TEXT NOT NULL,              -- what they're focused on
  blockers  TEXT NOT NULL DEFAULT ''    -- anything in the way (empty = clear)
);
