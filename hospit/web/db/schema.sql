-- ═══════════════════════════════════════════════════════════════════════
-- HospIT — PostgreSQL schema (PostgreSQL 13+; gen_random_uuid() is built in)
-- Idempotent: safe to run again on an existing database (only creates what is missing).
--   psql "$DATABASE_URL" -f db/schema.sql        or        npm run db:setup
-- ═══════════════════════════════════════════════════════════════════════

-- ── Users (admins and customers) ──
-- role is the ONLY source of authorization. password_hash: "scrypt$..." (native)
-- or a bcrypt "$2a$..." hash imported from Supabase (upgraded to scrypt on next login).
create table if not exists users (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique check (email = lower(email)),
  password_hash   text not null,
  role            text not null default 'client' check (role in ('admin', 'client')),
  full_name       text not null default '',
  phone           text not null default '',
  institution     text not null default '',
  subscription    jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  last_sign_in_at timestamptz
);

-- ── Login sessions (id = SHA-256 of the cookie token; the token itself is never stored) ──
create table if not exists sessions (
  id         text primary key,
  user_id    uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists sessions_user_id on sessions (user_id);
create index if not exists sessions_expires_at on sessions (expires_at);

-- ── Password-reset links (token_hash = SHA-256 of the token sent by e-mail) ──
create table if not exists password_resets (
  token_hash text primary key,
  user_id    uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at    timestamptz
);

-- ── Uploaded images (logos etc.), served by /media/<id>.<ext> ──
create table if not exists media (
  id           uuid primary key default gen_random_uuid(),
  filename     text not null default '',
  content_type text not null,
  size         int  not null,
  data         bytea not null,
  created_at   timestamptz not null default now()
);

-- ── Static texts: the whole 3-language tree in one JSON row ──
create table if not exists site_texts (
  id   int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  constraint site_texts_single check (id = 1)
);

-- ── Settings: contact, theme, pricing, FAQ, integrations, comparison, privacy, quiz, images ──
create table if not exists app_settings (
  id   int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  constraint app_settings_single check (id = 1)
);

-- ── Card lists edited in the admin panel ──
create table if not exists features (
  id text primary key, icon text, title jsonb, "desc" jsonb,
  sort int default 0, active boolean default true
);
create table if not exists services (
  id text primary key, icon text, title jsonb, "desc" jsonb, bullets jsonb,
  sort int default 0, active boolean default true
);
create table if not exists partners (
  id text primary key, name text, logo_url text,
  sort int default 0, active boolean default true
);
create table if not exists clients (
  id text primary key, name text, logo_url text,
  sort int default 0, active boolean default true
);
create table if not exists about_values (
  id text primary key, emoji text, title jsonb, "desc" jsonb,
  sort int default 0, active boolean default true
);
create table if not exists timeline (
  id text primary key, year text, title jsonb, "desc" jsonb,
  sort int default 0, active boolean default true
);
create table if not exists advantages (
  id text primary key, emoji text, title jsonb, "desc" jsonb,
  stat text, stat_label jsonb, sort int default 0, active boolean default true
);
create table if not exists comparisons (
  id text primary key, feature jsonb, sort int default 0, active boolean default true
);

-- ── Contact-form requests ──
create table if not exists contact_requests (
  id         uuid primary key default gen_random_uuid(),
  name       text, email text, subject text, message text,
  status     text default 'new' check (status in ('new', 'contacted', 'done')),
  created_at timestamptz default now()
);

-- ── Exhibition quiz (/quiz) ──
create table if not exists quiz_players (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  org        text,
  score      int not null default 0,
  total_ms   int not null default 0,
  answers    jsonb not null default '[]'::jsonb,
  day        date not null,
  winner     boolean not null default false,
  created_at timestamptz default now()
);
create unique index if not exists quiz_players_phone_day on quiz_players (phone, day);
create index if not exists quiz_players_day_rank on quiz_players (day, score desc, total_ms asc);
