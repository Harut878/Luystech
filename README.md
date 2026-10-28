# Luystech — projects

| Folder | Project | Stack |
|---|---|---|
| [`hospit/`](hospit/) | **HospIT** — healthcare automation website, admin panel, customer accounts, exhibition quiz | Next.js 15 (frontend + backend) · PostgreSQL |
| [`luystech/`](luystech/) | **LuysTech / Business Control** — business automation website with admin panel | `web/`: Next.js 15 + Supabase · `cpanel/`: static site + PHP API + PostgreSQL |

## Where to start
- **HospIT:** [`hospit/web/README.md`](hospit/web/README.md) — deployment (Docker or Node.js), environment variables, PostgreSQL setup, data import, backups.
  Owner/admin guides (Armenian): [`hospit/ՈՒՂԵՑՈՒՅՑ/`](hospit/ՈՒՂԵՑՈՒՅՑ/).
- **LuysTech:** [`luystech/README.md`](luystech/README.md) (Next.js version) and [`luystech/cpanel/README.md`](luystech/cpanel/README.md) (cPanel/PHP version).
  Guides (Armenian): [`luystech/ՈՒՂԵՑՈՒՅՑ/`](luystech/ՈՒՂԵՑՈՒՅՑ/).

## Secrets
No secrets are stored in this repository: no `.env` files, database passwords, API keys or `config.php`.
Copy the `*.example` / `config.sample.php` templates and fill in the real values on the server.
