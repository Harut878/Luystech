-- ═══════════════════════════════════════════════════════════
-- LuysTech — PostgreSQL schema (սովորական PostgreSQL, առանց Supabase-ի)
-- Պահանջ՝ PostgreSQL 9.6 կամ ավելի նոր։ Extension-ներ պետք չեն։
-- Գործարկման հերթականություն՝ 1) schema.sql  2) data.sql
-- cPanel → phpPgAdmin → ձեր բազան → SQL → տեղադրեք ֆայլի պարունակությունը → Execute
-- ═══════════════════════════════════════════════════════════

-- ── Ադմիններ (մուտք ադմին վահանակ) ──
CREATE TABLE IF NOT EXISTS admins (
  id            serial PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,              -- PHP password_hash() (bcrypt)
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Ստատիկ տեքստերը (ամբողջ 3-լեզու ծառը մեկ JSON տողում) ──
CREATE TABLE IF NOT EXISTS site_texts (
  id   int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ── Կարգավորումներ (կապ, սոց. ցանցեր, քարտեզ, բաժինների ON/OFF) ──
CREATE TABLE IF NOT EXISTS app_settings (
  id   int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ── Business Control մոդուլներ ──
CREATE TABLE IF NOT EXISTS modules (
  id text PRIMARY KEY, key text, icon text,
  image_url text, image_url_light text,
  title jsonb, "desc" jsonb, long jsonb DEFAULT '{}'::jsonb, video_url text,
  sort int DEFAULT 0, active boolean DEFAULT true
);

-- ── Առավելություններ ──
CREATE TABLE IF NOT EXISTS benefits (
  id text PRIMARY KEY, icon text, title jsonb, "desc" jsonb,
  sort int DEFAULT 0, active boolean DEFAULT true
);

-- ── «Ինչու BC» վիճակագրություն ──
CREATE TABLE IF NOT EXISTS why_stats (
  id text PRIMARY KEY, target numeric, suffix text, decimals int DEFAULT 0,
  label jsonb, sort int DEFAULT 0
);

-- ── Ոլորտներ ──
CREATE TABLE IF NOT EXISTS industries (
  id text PRIMARY KEY, icon text, name jsonb, "desc" jsonb,
  sort int DEFAULT 0, active boolean DEFAULT true
);

-- ── Հաճախորդներ (լոգոներ) ──
CREATE TABLE IF NOT EXISTS clients (
  id text PRIMARY KEY, name text, logo_url text,
  logo_mode text NOT NULL DEFAULT 'both', url text NOT NULL DEFAULT '',
  sort int DEFAULT 0, active boolean DEFAULT true
);

-- ── Գործընկերներ / ինտեգրացիաներ ──
CREATE TABLE IF NOT EXISTS partners (
  id text PRIMARY KEY, name text, logo_url text, logo_mode text NOT NULL DEFAULT 'both',
  "desc" jsonb, long jsonb NOT NULL DEFAULT '{"am":"","en":"","ru":""}'::jsonb, link text,
  sort int DEFAULT 0, active boolean DEFAULT true
);

-- ── Հաջողության պատմություններ ──
CREATE TABLE IF NOT EXISTS stories (
  id text PRIMARY KEY, name text, logo_url text,
  industry jsonb, challenge jsonb, solution jsonb, metrics jsonb,
  sort int DEFAULT 0, active boolean DEFAULT true
);

-- ── Թվեր (սոցիալական ապացույց) ──
CREATE TABLE IF NOT EXISTS proof (
  id text PRIMARY KEY, target numeric, suffix text, label jsonb, sort int DEFAULT 0
);

-- ── Կապի ձևից եկած հարցումներ ──
CREATE TABLE IF NOT EXISTS contact_requests (
  id         uuid PRIMARY KEY,                -- գեներացվում է PHP-ում
  company    text, person text, phone text, email text, message text,
  status     text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','done')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_requests_created_idx ON contact_requests (created_at DESC);

-- ── Չարաշահման սահմանափակում (կապի ձև, մուտք) ──
CREATE TABLE IF NOT EXISTS rate_limits (
  k  text NOT NULL,
  ts timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rate_limits_k_ts_idx ON rate_limits (k, ts);
