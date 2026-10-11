-- LegalCostGuides shop: orders, idempotent Stripe events, downloads, anonymous funnel counters.
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,            -- Stripe event id (evt_...)
  type TEXT NOT NULL,
  livemode INTEGER NOT NULL,
  received_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS orders (
  session_id TEXT PRIMARY KEY,    -- Checkout Session id (cs_...)
  sku TEXT,
  status TEXT NOT NULL,           -- pending | paid | failed | expired | refunded | review
  email TEXT,                     -- lowercased; used only for delivery and access recovery
  amount INTEGER,
  currency TEXT,
  payment_intent TEXT,
  payment_link TEXT,
  order_code TEXT UNIQUE,
  livemode INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  note TEXT
);
CREATE INDEX IF NOT EXISTS orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS orders_pi ON orders(payment_intent);
CREATE TABLE IF NOT EXISTS receipts (
  payment_intent TEXT PRIMARY KEY,
  receipt_number TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS downloads (
  session_id TEXT NOT NULL,
  file_key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_at TEXT,
  PRIMARY KEY (session_id, file_key)
);
CREATE TABLE IF NOT EXISTS funnel (
  day TEXT NOT NULL,
  event TEXT NOT NULL,
  path TEXT NOT NULL,
  sku TEXT NOT NULL DEFAULT '',
  placement TEXT NOT NULL DEFAULT '',
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, event, path, sku, placement)
);
CREATE TABLE IF NOT EXISTS recover_attempts (
  key TEXT NOT NULL,              -- sha256(ip + hour), no raw IP stored
  hour TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, hour)
);
