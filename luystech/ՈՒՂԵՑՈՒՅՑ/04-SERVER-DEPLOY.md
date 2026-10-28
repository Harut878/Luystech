# 04 — Սերվերի վրա տեղադրում (DevOps, ընդհանուր)

> 💡 Ամենապարզ, ավտոմատ ձևի համար (դոմեն + SSL մեկ script-ով)՝ տես **`05-ԴՈՄԵՆ-ՍԵՐՎԵՐ.md`**։
> Այս ֆայլը՝ ձեռքով/ընդհանուր տարբերակների համար է (PM2, Docker, nginx)։

**Stack:** Next.js 15 (App Router) + Supabase։ **Պահանջ:** Node.js **20+**։ Կոդը՝ `web/`-ում։

## Environment փոփոխականներ (`web/.env.local`)

| Փոփոխական | Նկարագրություն |
|-----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (**secret**, server-only) |
| `NEXT_PUBLIC_SITE_URL` | Կայքի հանրային հասցեն (օր. `https://luystech.am`) |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL` *(optional)* | Կապի email-ի համար |

> `NEXT_PUBLIC_*`-ը inline է արվում **build-ի** ժամանակ — դրեք build-ից առաջ։

## Build & Run

```bash
cd web
npm ci
npm run build
npm start            # PORT 3000 (փոխել՝ PORT=8080 npm start)
```

## PM2 (առաջարկվող)

```bash
npm i -g pm2
cd web && npm run build
pm2 start "npm start" --name luystech
pm2 save && pm2 startup
```

## nginx reverse proxy

```nginx
server {
    listen 80;
    server_name luystech.am www.luystech.am;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
SSL՝ `sudo certbot --nginx -d luystech.am -d www.luystech.am`։

## Docker (այլընտրանք)

`web/Dockerfile`.
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm","start"]
```
```bash
cd web
docker build -t luystech .
docker run -d -p 3000:3000 --env-file .env.local --name luystech luystech
```

## Supabase

Բազան արդեն կարգավորված է (ref `pwmnggxjylsvduoxgoku`)։ Նոր/առանձին Supabase ուզելու դեպքում՝ գործարկեք `web/supabase/schema.sql` ապա `seed.sql` (տես `01-SUPABASE.md`), թարմացրեք env keys-ը։
