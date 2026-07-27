-- D1 schema for gallery delivery (token + optional passcode auth).
-- Apply with: npm run db:migrate (wrangler d1 execute site-db --file=./schema.sql)

CREATE TABLE IF NOT EXISTS galleries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  label TEXT,
  passcode_hash TEXT,
  passcode_salt TEXT,
  passcode_iterations INTEGER,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  revoked_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_galleries_token ON galleries(token);

-- One row per media item delivered in a gallery. Normalized rather than a
-- JSON blob column so items can be queried/reordered/added individually.
CREATE TABLE IF NOT EXISTS gallery_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gallery_id INTEGER NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  poster_key TEXT NOT NULL,
  loop_key TEXT,
  reel_sd_key TEXT NOT NULL,
  reel_hd_key TEXT
);

CREATE INDEX IF NOT EXISTS idx_gallery_media_gallery_id ON gallery_media(gallery_id);
