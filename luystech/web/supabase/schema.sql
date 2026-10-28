-- ═══════════════════════════════════════════════════════════
-- LuysTech — Supabase schema (tables + RLS)
-- Գործարկեք Supabase Dashboard → SQL Editor-ում մեկ անգամ։
-- ═══════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Օգտատերերի պրոֆիլներ (ադմին / հաճախորդ) ──
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'client' check (role in ('admin','client')),
  created_at timestamptz default now()
);

-- ── Ստատիկ տեքստերը (ամբողջ 3-լեզու ծառը մեկ JSON տողում) ──
create table if not exists public.site_texts (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  constraint site_texts_single check (id = 1)
);

-- ── Կարգավորումներ (կապ, սոց. ցանցեր, կանխադրվածներ) ──
create table if not exists public.app_settings (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  constraint app_settings_single check (id = 1)
);

-- ── Business Control մոդուլներ ──
create table if not exists public.modules (
  id text primary key, key text, icon text, image_url text, image_url_light text,
  title jsonb, "desc" jsonb, long jsonb default '{}'::jsonb, video_url text,
  sort int default 0, active boolean default true
);
alter table public.modules add column if not exists image_url_light text;

-- ── Առավելություններ ──
create table if not exists public.benefits (
  id text primary key, icon text, title jsonb, "desc" jsonb,
  sort int default 0, active boolean default true
);

-- ── «Ինչու BC» վիճակագրություն ──
create table if not exists public.why_stats (
  id text primary key, target numeric, suffix text, decimals int default 0,
  label jsonb, sort int default 0
);

-- ── Ոլորտներ ──
create table if not exists public.industries (
  id text primary key, icon text, name jsonb, "desc" jsonb,
  sort int default 0, active boolean default true
);

-- ── Հաճախորդներ (լոգոներ) ──
create table if not exists public.clients (
  id text primary key, name text, logo_url text,
  logo_mode text not null default 'both', url text not null default '',
  sort int default 0, active boolean default true
);
-- Եթե աղյուսակն արդեն կար՝ ավելացնում ենք նոր սյուները
alter table public.clients add column if not exists logo_mode text not null default 'both';
alter table public.clients add column if not exists url text not null default '';

-- ── Գործընկերներ ──
create table if not exists public.partners (
  id text primary key, name text, logo_url text, logo_mode text not null default 'both',
  "desc" jsonb, long jsonb not null default '{"am":"","en":"","ru":""}'::jsonb, link text,
  sort int default 0, active boolean default true
);
alter table public.partners add column if not exists logo_mode text not null default 'both';
alter table public.partners add column if not exists long jsonb not null default '{"am":"","en":"","ru":""}'::jsonb;

-- ── Հաջողության պատմություններ ──
create table if not exists public.stories (
  id text primary key, name text, logo_url text,
  industry jsonb, challenge jsonb, solution jsonb, metrics jsonb,
  sort int default 0, active boolean default true
);

-- ── Սոցիալական ապացույց (թվեր) ──
create table if not exists public.proof (
  id text primary key, target numeric, suffix text, label jsonb, sort int default 0
);

-- ── Կապի ձևից եկած հարցումներ ──
create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  company text, person text, phone text, email text, message text,
  status text default 'new' check (status in ('new','contacted','done')),
  created_at timestamptz default now()
);

-- ═══════════════════════ RLS ═══════════════════════
alter table public.profiles enable row level security;
alter table public.site_texts enable row level security;
alter table public.app_settings enable row level security;
alter table public.modules enable row level security;
alter table public.benefits enable row level security;
alter table public.why_stats enable row level security;
alter table public.industries enable row level security;
alter table public.clients enable row level security;
alter table public.partners enable row level security;
alter table public.stories enable row level security;
alter table public.proof enable row level security;
alter table public.contact_requests enable row level security;

-- Հանրային ընթերցում բովանդակության համար (գրելը՝ միայն service-role-ով՝ ադմինից)
do $$
declare tbl text;
begin
  foreach tbl in array array['site_texts','app_settings','modules','benefits','why_stats','industries','clients','partners','stories','proof']
  loop
    execute format('drop policy if exists "public read %1$s" on public.%1$s;', tbl);
    execute format('create policy "public read %1$s" on public.%1$s for select using (true);', tbl);
  end loop;
end $$;

-- Պրոֆիլ՝ օգտատերը կարդում է իր տողը
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select using (auth.uid() = id);

-- contact_requests — ոչ մի հանրային քաղաքականություն. մուտքագրումն ու ընթերցումը
-- կատարվում են service-role-ով (API route / ադմին), որը շրջանցում է RLS-ը։

-- ═══════════════ Նոր օգտատիրոջ trigger ═══════════════
-- ԱՆՎՏԱՆԳՈՒԹՅՈՒՆ: role-ը ՄԻՇՏ 'client' է։ Երբեք չվստահել օգտատիրոջ metadata-ին։
-- Ադմին դարձնելը կատարվում է միայն ձեռքով SQL-ով (update profiles set role='admin' ...)։
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''), 'client')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════ Storage (նկարներ/լոգոներ) ═══════════════
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

drop policy if exists "assets public read" on storage.objects;
create policy "assets public read" on storage.objects
  for select using (bucket_id = 'assets');
