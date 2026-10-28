// ═══════════════════════════════════════════════════════════
// LuysTech — build. Հավաքում է պատրաստի `public_html/` թղթապանակը՝
//   frontend/out/  (ստատիկ կայք)  +  backend/api/  +  backend/uploads/  +  backend/.htaccess
// Գործարկում (Node.js 18+):   node build.mjs
// Արդյունքը՝ public_html/ — այն ամբողջությամբ վերբեռնվում է cPanel-ի public_html-ում։
// ═══════════════════════════════════════════════════════════
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FE = path.join(ROOT, "frontend");
const BE = path.join(ROOT, "backend");
const OUT = path.join(ROOT, "public_html");

const run = (cmd, cwd) => { console.log(`\n▶ ${cmd}`); execSync(cmd, { cwd, stdio: "inherit", shell: true }); };

if (!fs.existsSync(path.join(FE, "node_modules"))) run("npm install", FE);
run("npm run build", FE);

// public_html/-ը նորից ենք հավաքում, բայց պահում ենք այնտեղ եղած config.php-ն ու վերբեռնված նկարները
const keepCfg = path.join(OUT, "api", "config.php");
const savedCfg = fs.existsSync(keepCfg) ? fs.readFileSync(keepCfg) : null;
fs.rmSync(OUT, { recursive: true, force: true });

fs.cpSync(path.join(FE, "out"), OUT, { recursive: true });
fs.cpSync(path.join(BE, "api"), path.join(OUT, "api"), { recursive: true });
fs.cpSync(path.join(BE, "uploads"), path.join(OUT, "uploads"), { recursive: true });
fs.copyFileSync(path.join(BE, ".htaccess"), path.join(OUT, ".htaccess"));
if (savedCfg) fs.writeFileSync(keepCfg, savedCfg);

// Next.js export-ը 404-ը դնում է 404/index.html-ում — .htaccess-ը սպասում է /404.html
const nf = path.join(OUT, "404", "index.html");
if (fs.existsSync(nf) && !fs.existsSync(path.join(OUT, "404.html"))) fs.copyFileSync(nf, path.join(OUT, "404.html"));

console.log(`\n✓ Պատրաստ է՝ ${OUT}\n  Վերբեռնեք դրա ամբողջ պարունակությունը cPanel-ի public_html թղթապանակ։`);
