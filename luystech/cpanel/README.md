# LuysTech — cPanel տարբերակ (ստատիկ կայք + PHP API + PostgreSQL)

Այս տարբերակը **չի օգտագործում Supabase և Vercel**։ Աշխատում է սովորական cPanel hosting-ում.

- **Կայքը** (frontend)՝ ստատիկ HTML/CSS/JS ֆայլեր
- **Backend**՝ PHP API (`/api/`)՝ ադմինի մուտք, խմբագրում, կապի ձև, նկարների վերբեռնում
- **Բազա**՝ սովորական **PostgreSQL**

Ներկայիս ամբողջ բովանդակությունը (տեքստեր, մոդուլներ, հաճախորդներ, լոգոներ, կարգավորումներ, կապի հարցումներ) արդեն տեղափոխված է `database/data.sql` և `public_html/uploads/`։

---

## 📦 Ինչ կա այստեղ

```
LuysTech-cPanel/
├── public_html/        ← ՊԱՏՐԱՍՏ է. սրա պարունակությունը վերբեռնվում է cPanel-ի public_html
│   ├── index.html, admin/, login/, _next/, assets/   (ստատիկ կայքը)
│   ├── api/            (PHP backend)
│   │   ├── index.php
│   │   ├── setup.php           ← առաջին ադմինի ստեղծում
│   │   └── config.sample.php   ← պատճենել → config.php
│   ├── uploads/        (նկարներ/լոգոներ)
│   └── .htaccess       (անվտանգության կարգավորումներ)
├── database/
│   ├── schema.sql      ← 1. աղյուսակները
│   └── data.sql        ← 2. ներկայիս բովանդակությունը
├── frontend/           (կայքի source կոդը՝ Next.js, միայն կոդը փոխելու համար)
├── backend/            (PHP API-ի source կոդը)
├── build.mjs           (frontend + backend → public_html հավաքող script)
└── README.md
```

---

## ✅ Պահանջներ

| Ինչ | Նվազագույնը |
|---|---|
| PHP | **7.4** (խորհուրդ՝ 8.1+) |
| PHP extension-ներ | **pdo_pgsql** (պարտադիր), curl, fileinfo, mbstring |
| PostgreSQL | **9.6+**, կոդավորումը՝ **UTF8** |
| Web server | Apache (cPanel-ի ստանդարտը), `mod_headers` |
| Տեղադրություն | Դոմենի կամ subdomain-ի **արմատը** (ոչ ենթաթղթապանակ, օր.՝ `site.am/luystech/`) |

> cPanel → **Select PHP Version** → **Extensions** → նշեք `pdo_pgsql` և `pgsql`։

---

## 🚀 Տեղադրում (6 քայլ)

### 1. Ստեղծել բազան
cPanel → **PostgreSQL Databases**
1. Create New Database (օր.՝ `luystech`) → կլինի `cpaneluser_luystech`
2. Add New User (ուժեղ գաղտնաբառով)
3. «Add User To Database» → ընտրել օգտատիրոջն ու բազան → **ALL PRIVILEGES**

### 2. Լցնել աղյուսակներն ու տվյալները
cPanel → **phpPgAdmin** → ձախից ընտրել ձեր բազան → վերևում **SQL**
1. Տեղադրել `database/schema.sql`-ի ամբողջ պարունակությունը → **Execute**
2. Հետո `database/data.sql`-ի պարունակությունը → **Execute**

*(Կամ SSH-ով՝ `psql -h localhost -U USER -d DBNAME -f schema.sql`, ապա նույնը `data.sql`-ի համար)*

### 3. Վերբեռնել ֆայլերը
cPanel → **File Manager** → `public_html`
- Վերբեռնեք `public_html/` թղթապանակի **ամբողջ պարունակությունը** (ոչ թե թղթապանակը ինքը)
- Ամենահեշտը՝ zip արեք պարունակությունը, Upload, հետո **Extract**
- ⚠️ Համոզվեք, որ թաքնված `.htaccess` ֆայլերը նույնպես վերբեռնվել են (File Manager → Settings → «Show Hidden Files»)

### 4. Կարգավորել կապը բազայի հետ
`public_html/api/` թղթապանակում.
1. `config.sample.php`-ը **պատճենեք** նույն տեղում՝ **`config.php`** անունով
2. Խմբագրեք `config.php`-ը.
   - `db_name`, `db_user`, `db_pass`՝ 1-ին քայլի տվյալները
   - `setup_key`՝ գրեք **երկար պատահական բառ** (առնվազն 16 նիշ, օր.՝ `Lt7-kq93-Zx81-pp20-Mm55`)

### 5. Ստեղծել ադմինին
Բրաուզերում բացեք **`https://ձեր-դոմեն/api/setup.php`**
- Վերևում պետք է գրված լինի «✓ Բազան միացված է, աղյուսակները կան»
- Լրացրեք՝ setup_key, ադմինի էլ. փոստ, գաղտնաբառ → **Պահպանել**
- ⚠️ Հետո `config.php`-ում **դատարկեք** `setup_key`-ը (`'setup_key' => ''`)՝ այս էջն անջատելու համար

Ադմին մուտք՝ **`https://ձեր-դոմեն/login/`**

### 6. SSL (HTTPS)
cPanel → **SSL/TLS Status** → Run AutoSSL։ Հետո `public_html/.htaccess`-ում հեռացրեք `#`-երը «HTTPS-ի պարտադրում» բաժնի 3 տողից։

---

## 🔧 Լրացուցիչ

**Նոր հարցման մասին email.** `config.php`-ում լրացրեք `notify_email` (և ցանկության դեպքում `mail_from`)։ Օգտագործվում է սերվերի `mail()`-ը։

**Գաղտնաբառի փոփոխություն.** Ադմին → «Կապ և կարգավորումներ» → ներքևում «Ադմինի գաղտնաբառ»։

**Մոռացված գաղտնաբառ.** Ժամանակավորապես լրացրեք `setup_key`-ը, բացեք `/api/setup.php`, մուտքագրեք **նույն էլ. փոստը** և նոր գաղտնաբառը. գաղտնաբառը կփոխվի։ Հետո նորից դատարկեք `setup_key`-ը։

**Նկարներ.** Ադմինից վերբեռնված նկարները պահվում են `public_html/uploads/`-ում (PHP-ն պետք է կարողանա գրել այնտեղ. սովորաբար cPanel-ում աշխատում է առանց լրացուցիչ կարգավորման)։

**Պահուստային պատճեն (backup).** Պահեք 2 բան. բազան (phpPgAdmin → Export կամ `pg_dump`) և `public_html/uploads/` թղթապանակը։

---

## 🛠 Կոդը փոխելու դեպքում (ծրագրավորողի համար)

Բովանդակության փոփոխության համար (տեքստեր, նկարներ, մոդուլներ) **build պետք չէ**. ամեն ինչ արվում է ադմինից։

Եթե փոխվում է **կոդը**. համակարգչում պետք է Node.js 18+.
```bash
cd frontend
npm install
cd ..
node build.mjs
```
Արդյունքը՝ նոր `public_html/`։ `config.php`-ն ու վերբեռնված նկարները չեն ջնջվում։ Վերբեռնեք փոփոխված ֆայլերը սերվեր (`_next/`, `index.html`, `admin/`, `login/` և այլն)։

**Ճարտարապետություն.**
- `frontend/` — Next.js 15 (`output: "export"`). Էջերը բովանդակությունը բերում են `/api/?a=content`-ից
- `backend/api/index.php` — բոլոր API գործողությունները (`?a=content|contact|login|logout|me|password|dashboard|list|upsert|delete|texts|settings|section|requests|request_status|request_delete|upload`)
- Ադմինի նստաշրջանը՝ PHP session (HttpOnly cookie), գաղտնաբառերը՝ bcrypt (`password_hash`)

---

## 🔒 Անվտանգություն

- `api/config.php` — **գաղտնի** (բազայի գաղտնաբառ). ուղիղ բրաուզերից հասանելի չէ (`.htaccess`)
- Ադմինի գաղտնաբառերը պահվում են միայն bcrypt hash-ով
- Մուտքի փորձերի սահմանափակում՝ 10 / 15 րոպե մեկ IP-ից, կապի ձև՝ 5 / 10 րոպե
- CSRF պաշտպանություն (custom header + Origin ստուգում), honeypot՝ սպամի դեմ
- Վերբեռնում՝ միայն իրական PNG/JPG/WEBP/GIF (մինչև 5MB), `uploads/`-ում script-եր չեն աշխատում
- Անվտանգության header-ներ (CSP, X-Frame-Options, nosniff...) — `.htaccess`

---

## ❓ Խնդիրների լուծում

| Խնդիր | Լուծում |
|---|---|
| Ամբողջ կայքը տալիս է **500 Internal Server Error** | `.htaccess`-ի ինչ-որ տող չի աջակցվում. ժամանակավորապես անվանափոխեք `.htaccess`-ը ու ստուգեք, հետո կապվեք hosting-ի աջակցության հետ (`mod_headers`) |
| Կայքը բացվում է, բայց ադմին մուտքը տալիս է «server error» | Ստուգեք `api/config.php`-ը. ժամանակավորապես դրեք `'debug' => true` ու նայեք սխալը, կամ cPanel → **Errors** / `error_log` |
| «api/config.php չկա» | Կատարեք 4-րդ քայլը |
| setup.php-ն ասում է «Բազային միանալ չհաջողվեց» | Ստուգեք db_name/db_user/db_pass, օգտատերը ավելացվա՞ծ է բազային (1-ին քայլ), `pdo_pgsql` միացվա՞ծ է |
| «աղյուսակները չկան» | Կատարեք 2-րդ քայլը |
| Նկար չի վերբեռնվում | `public_html/uploads/` թղթապանակին տվեք գրելու իրավունք (755) |
| Քարտեզի կարճ հղումը (maps.app.goo.gl) չի աշխատում | Սերվերում curl չկա. ադմինում դրեք Google Maps-ի **ամբողջական** հղումը կամ պարզապես հասցեն |
