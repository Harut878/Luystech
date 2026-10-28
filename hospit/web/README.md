# HospIT website — deployment guide (DevOps)

Public website, admin panel and customer accounts for **HospIT** (`hospit.am`).
Frontend and backend are one Next.js application; the only external dependency is **PostgreSQL**.

- **Stack:** Next.js 15 (App Router, TypeScript) · React 19 · PostgreSQL 13+ (node-postgres `pg`)
- **Runtime:** Node.js **20.9+** (22 LTS recommended) — or the provided Docker image
- **State:** the app server is stateless. Everything — content, users, sessions, uploaded images — lives in PostgreSQL.
  No local disk writes, no cron, no queue, no third-party auth/storage service.

> ### Static hosting is not enough
> The admin panel, login/registration, contact form and quiz run on the server (Node.js) and talk to PostgreSQL.
> A host that only serves static HTML files cannot run them. You need a VPS / container host / any
> platform that runs Node.js 20.9+ (or Docker), plus a PostgreSQL database (same server or managed).

---

## 1. Environment variables

All variables are read at **runtime** — nothing is baked into the build, so one build works everywhere.

| Variable | Required | What |
|---|---|---|
| `DATABASE_URL` | **yes** | `postgres://user:password@host:5432/dbname` (URL-encode special characters in the password) |
| `DATABASE_SSL` | no | empty = as in the URL · `require` = TLS with verified certificate · `no-verify` = TLS, certificate not verified (managed DBs with self-signed certs) |
| `SITE_URL` | recommended | `https://hospit.am` — used to build password-reset links in e-mails |
| `RESEND_API_KEY` | no | resend.com key. Enables password-reset e-mails and contact-form notifications |
| `MAIL_FROM` | no | sender, e.g. `HospIT <noreply@hospit.am>` (domain must be verified in Resend) |
| `CONTACT_TO_EMAIL` | no | recipient of contact-form notifications |
| `COOKIE_SECURE` | no | session cookies are `Secure` in production by default. Set `false` **only** for testing over plain `http://` |
| `DATABASE_POOL_MAX` | no | max DB connections per app instance (default 10) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | docker only, optional | first admin, created on container start **only if no admin exists yet** |
| `POSTGRES_PASSWORD` | docker compose only | password of the bundled `postgres` container |

Template: [`.env.local.example`](.env.local.example). Without `RESEND_API_KEY`, "Forgot password?" tells the user to contact
the administrator, and an admin can set a new password in **Admin → Users**.

## 2. Deploy — option A: Docker Compose (app + PostgreSQL)

```bash
cp .env.local.example .env
#   set POSTGRES_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD, SITE_URL (leave DATABASE_URL empty)
docker compose up -d --build      # PostgreSQL 17 + the site on 127.0.0.1:3000
docker compose logs -f web        # "✓ schema", "✓ seed", "✓ admin created: ..." then "Ready"
```

- On every start the `web` container runs `db/schema.sql` + `db/seed.sql` (idempotent: creates what is missing,
  never overwrites existing content) and creates the first admin from `ADMIN_*` if there is no admin yet.
  After the first start remove `ADMIN_PASSWORD` from `.env`.
- Data is kept in the `pgdata` volume. **Back it up** (see §6).
- Using an existing PostgreSQL server instead? Delete the `db` service and `depends_on` from
  [`docker-compose.yml`](docker-compose.yml) and set `DATABASE_URL` in `.env`.
- Image: [`Dockerfile`](Dockerfile) — multi-stage `node:22-alpine`, Next.js standalone output, non-root user, port `3000`.

## 3. Deploy — option B: plain Node.js + your PostgreSQL

```bash
# 1. database (once): create an empty database and a user that owns it, e.g.
#    createuser -P hospit && createdb -O hospit hospit
# 2. app
npm ci
cp .env.local.example .env.local         # set DATABASE_URL (+ SITE_URL, RESEND_API_KEY ...)
npm run db:setup                         # tables + default content (safe to re-run)
npm run db:create-admin -- admin@hospit.am 'StrongPassword123' "Full Name"
npm run build
# standalone server (what the Docker image runs):
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
cd .next/standalone && PORT=3000 HOSTNAME=127.0.0.1 node server.js
```

In production pass the variables via the environment (systemd `EnvironmentFile=`, PM2 ecosystem file, etc.).
The `npm run db:*` scripts also read `.env.local` / `.env` from this folder.

## 4. Reverse proxy, HTTPS, DNS

Put the app behind nginx / Caddy with TLS. The admin panel uploads images up to **7 MB**, so allow ≥ 10 MB request bodies.

```nginx
server {
    listen 443 ssl http2;
    server_name hospit.am www.hospit.am;
    # ssl_certificate ... (e.g. certbot)

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host  $host;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        "upgrade";
    }
}
server { listen 80; server_name hospit.am www.hospit.am; return 301 https://$host$request_uri; }
```

DNS: point `hospit.am` (A/AAAA) and `www.hospit.am` to the server.

## 5. Moving the existing data from the old Supabase project

The previous version stored content, accounts and images in a Supabase project. To bring them over (one time):

1. In the Supabase dashboard make sure the project is active (restore it if paused) → **Connect** → copy the
   **Session pooler** connection string (contains the database password).
2. On a machine that can reach both databases, in this folder:
   ```bash
   npm ci
   npm run db:setup                                   # DATABASE_URL = the NEW database
   SOURCE_DATABASE_URL='postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres' \
     npm run db:import-supabase -- --dry-run          # shows what would be imported
   SOURCE_DATABASE_URL='...' npm run db:import-supabase
   ```
3. What it does: replaces the default content with the real one (texts, settings, all lists), copies all users
   **with their existing passwords** (bcrypt hashes; upgraded to scrypt on first login), roles and subscriptions,
   contact requests and quiz results, and downloads every image from Supabase Storage into the `media` table
   (links are rewritten to `/media/...`). Safe to re-run.

If the Supabase project no longer exists, skip this: the site starts with the default content, which the owner can edit in `/admin`.

## 6. Backups

Everything is in one database:
```bash
pg_dump --format=custom --file=hospit-$(date +%F).dump "$DATABASE_URL"          # backup
pg_restore --clean --if-exists --dbname="$DATABASE_URL" hospit-2026-10-27.dump   # restore
# docker compose: docker compose exec -T db pg_dump -U hospit -Fc hospit > hospit-$(date +%F).dump
```

## 7. Smoke test after deploy

```bash
B=https://hospit.am
curl -s -o /dev/null -w "%{http_code}  /\n"              $B/            # 200
curl -s -o /dev/null -w "%{http_code}  /login\n"         $B/login       # 200
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" $B/admin       # 307 → /login
curl -s -o /dev/null -w "%{http_code}  /api/quiz\n"      $B/api/quiz    # 200
```

Then sign in at `/login` with the admin account and open `/admin`. If the app log shows
`loadContent: database unreachable, serving defaults`, check `DATABASE_URL` / `DATABASE_SSL` / firewall.

## 8. How it works (what DevOps should know)

| Route | What |
|---|---|
| `/` | Public single-page site (3 languages: hy / en / ru). Content is read from the DB on every request. |
| `/login`, `/register`, `/reset-password` | Accounts. After login admins go to `/admin`, customers to `/account`. |
| `/account` | Customer page: assigned plan, monthly price, contract dates, modules, terms. |
| `/admin/**` | Admin panel (hy / en): every text, image, list, price; users & roles; contact requests; quiz. |
| `/media/<id>.<ext>` | Images uploaded in the admin panel (stored in table `media`, cached by browsers for 1 year). |
| `/quiz`, `/quiz/board`, `/api/quiz` | Exhibition QR quiz and live leaderboard. |
| `/api/contact` | Contact form → table `contact_requests` (+ optional e-mail). |
| `/auth/signout` | POST: ends the session. |

- **Auth:** own implementation, no external provider. Passwords: scrypt (Node built-in). Sessions: random 256-bit token in an
  `httpOnly`, `SameSite=Lax`, `Secure` cookie (`hospit_session`, 30 days); the DB stores only its SHA-256 (table `sessions`).
  Login is rate-limited per e-mail (10 failures / 15 min, per app instance). Code: `src/lib/auth.ts`, `src/app/auth/actions.ts`.
- **Roles:** only `users.role` (`admin` | `client`) grants rights; it is checked on the server on every request, so a change made in
  Admin → Users takes effect immediately. Registration always creates `client`. The last admin cannot be removed or demoted.
- **Resilience:** DB connect timeout 5 s, query timeout 15 s. If the DB is down the public site serves built-in default content and
  stops retrying for 30 s (`src/lib/content.ts`); the admin panel shows an error instead of editing defaults.
- **External services called from the browser:** Google Fonts; `formsubmit.co` and Google Forms (pricing-calculator order form).
  Allow them in any CSP you add.
- **npm 11 `allow-scripts` notice** during `npm ci`: harmless — no install script is needed.

## 9. Project layout

```
src/app/            routes (site, admin, account, auth, api, quiz, media)
src/components/     site/, admin/, account/, quiz/
src/lib/            db.ts (PostgreSQL pool), auth.ts, password.ts, content.ts, defaults.ts (default content), types
db/                 schema.sql (tables) · seed.sql (default content, generated)
scripts/            db-setup · create-admin · import-supabase · gen-seed
```

| Command | What |
|---|---|
| `npm run db:setup` | Creates missing tables and inserts default content where nothing exists yet. Never overwrites. `-- --no-seed` = tables only. |
| `npm run db:create-admin -- <email> <password> ["Name"]` | Creates an admin, or makes an existing user admin and sets the password. |
| `npm run db:import-supabase` | One-time import from the old Supabase project (§5). |
| `npm run db:gen-seed` | Regenerates `db/seed.sql` from `src/lib/defaults.ts` (file only; needs Node 22.18+). |
