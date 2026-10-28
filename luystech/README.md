# LuysTech — Business Control կայք

Բիզնեսի ավտոմատացման կայք (Next.js 15 + Supabase)՝ ամբողջովին հայերեն ադմին վահանակով, որով խմբագրվում է կայքի ամբողջ բովանդակությունը (3 լեզու՝ Հայ/EN/РУ)։

## Կառուցվածք

```
luystech/
├── web/                  # Next.js հավելվածը (ամբողջ կոդը)
│   ├── src/              # source (app router, components, lib)
│   ├── public/           # ստատիկ ֆայլեր, լոգոներ
│   ├── supabase/         # schema.sql + seed.sql (տվյալների բազա)
│   ├── scripts/          # gen-seed.ts
│   ├── deploy.sh         # ← ԱՎՏՈՄԱՏ սերվեր+դոմեն տեղադրում
│   ├── .env.local        # Supabase կապ (իրական արժեքներ)
│   └── package.json
└── ՈՒՂԵՑՈՒՅՑ/            # Ուղեցույցներ (հայերեն)
    ├── 00-ԸՆԴՀԱՆՈՒՐ.md
    ├── 01-SUPABASE.md
    ├── 02-VERCEL.md
    ├── 03-ԱԴՄԻՆ-ՁԵՌՆԱՐԿ.md      # ինչպես խմբագրել բովանդակությունը
    ├── 04-SERVER-DEPLOY.md      # DevOps: սերվերի ընդհանուր տեղադրում
    └── 05-ԴՈՄԵՆ-ՍԵՐՎԵՐ.md       # ← ԴՈՄԵՆ կապել ձեր սերվերին (ավտոմատ)
```

## Ամենաարագ ճանապարհը՝ դոմեն + ձեր սերվեր (ավտոմատ)

1. Ուղղեք դոմենի DNS-ը սերվերի IP-ին (A գրառում)
2. `web/` թղթապանակը դրեք սերվերում, ապա՝
```bash
cd web
sudo bash deploy.sh ՁԵՐԴՈՄԵՆԸ ՁԵՐ@ԷԼՓՈՍՏԸ
```
Script-ը ինքն է անում ամեն ինչ (Node, build, PM2, nginx, SSL)։ Մանրամասն՝ **`ՈՒՂԵՑՈՒՅՑ/05-ԴՈՄԵՆ-ՍԵՐՎԵՐ.md`**։

## ⚙️ DevOps — կարևոր (որ deploy-ը անցնի առանց խնդիր)

**Պահանջներ:** Ubuntu 20/22/24 (`deploy.sh`-ը `apt`-ով է), Node.js 20+, ≥1GB RAM (Next.js build-ի համար), բացված 80/443 պորտեր, DNS ուղղված սերվերին։ CentOS/Alpine-ի դեպքում՝ `deploy.sh`-ը պետք է հարմարեցնել (կամ ձեռքով՝ `npm ci && npm run build && npm start`)։

**Ձեռքով (առանց script-ի)՝**
```bash
cd web
npm ci
npm run build
npm start           # PORT 3000 (nginx reverse proxy հետևում)
```

**⚠️ Տվյալների բազան (կարևոր):** `.env.local`-ը կապված է **անվճ. Supabase** project-ին (`wiephtfeqtskdcmssdtb`)։ Անվճ. փաթեթում project-ը **ավտոմատ «քնում» է ~7 օր անգործությունից հետո** → login-ը կտա «Failed to fetch»։ Production-ի համար՝ կա՛մ **Supabase Pro** (չի քնում), կա՛մ **սեփական/paid DB**՝ գործարկելով `web/supabase/schema.sql` ապա `seed.sql` նոր բազայի վրա և թարմացնելով `.env.local`-ի բանալիները։ Տես `ՈՒՂԵՑՈՒՅՑ/04-SERVER-DEPLOY.md` և `01-SUPABASE.md`։

## Ադմին

- Հասցե՝ `/login` → `/admin`
- Ամբողջ բովանդակությունը խմբագրվում է ադմինից — տես `ՈՒՂԵՑՈՒՅՑ/03-ԱԴՄԻՆ-ՁԵՌՆԱՐԿ.md`
- Ամեն մոդուլ/քարտ և ամբողջ բաժինը կարելի է **միացնել/անջատել** ադմինից (ցուցադրվի՞ կայքում, թե՞ ոչ)

## ⚠️ Անվտանգություն

`web/.env.local`-ը պարունակում է **secret** բանալի (`SUPABASE_SERVICE_ROLE_KEY`)։
Մի դրեք public git repo-ում։ Եթե փաթեթը շրջանառվել է լայն, rotate արեք բանալիները Supabase-ից (Project Settings → API)։
