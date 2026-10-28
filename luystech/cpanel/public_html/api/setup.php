<?php
// ═══════════════════════════════════════════════════════════
// LuysTech — առաջին ադմինի ստեղծում / ադմինի գաղտնաբառի վերականգնում
// Բացեք https://ձեր-դոմեն/api/setup.php
// Աշխատում է միայն եթե config.php-ում լրացված է setup_key (առնվազն 16 նիշ)։
// Ավարտելուց հետո դատարկեք setup_key-ը՝ այս էջն անջատելու համար։
// ═══════════════════════════════════════════════════════════

define('LT_API', true);
require __DIR__ . '/lib/bootstrap.php';

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
header('X-Frame-Options: DENY');

$h = function ($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); };
$key = (string) cfg('setup_key', '');
$enabled = strlen($key) >= 16;
$msg = ''; $ok = false;

// Բազայի ստուգում
$dbStatus = '';
try {
    $n = (int) db()->query("SELECT count(*) FROM information_schema.tables WHERE table_name IN ('admins','site_texts','app_settings','modules','contact_requests','rate_limits')")->fetchColumn();
    $admins = $n >= 6 ? (int) db()->query('SELECT count(*) FROM admins')->fetchColumn() : -1;
    $dbStatus = $n >= 6 ? "✓ Բազան միացված է, աղյուսակները կան։ Ադմինների քանակը՝ $admins" : '⚠️ Բազան միացված է, բայց աղյուսակները չկան. նախ գործարկեք database/schema.sql-ը (և data.sql-ը)';
} catch (Throwable $e) {
    $dbStatus = '✗ Բազային միանալ չհաջողվեց. ստուգեք config.php-ի db_* դաշտերը' . (cfg('debug', false) ? ' — ' . $e->getMessage() : '');
}

if ($enabled && ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    try {
        if (rate_limited('setup:' . client_ip(), 10, 3600)) {
            $msg = 'Չափազանց շատ փորձեր։ Փորձեք մեկ ժամից։';
        } elseif (!hash_equals($key, (string) ($_POST['key'] ?? ''))) {
            $msg = 'Սխալ setup_key։';
        } else {
            $email = strtolower(trim((string) ($_POST['email'] ?? '')));
            $pass = (string) ($_POST['password'] ?? '');
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $msg = 'Սխալ էլ. փոստ։';
            elseif (strlen($pass) < 8) $msg = 'Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։';
            elseif ($pass !== (string) ($_POST['password2'] ?? '')) $msg = 'Գաղտնաբառերը չեն համընկնում։';
            else {
                $hash = password_hash($pass, PASSWORD_DEFAULT);
                $st = db()->prepare('SELECT id FROM admins WHERE lower(email) = ?');
                $st->execute([$email]);
                if ($id = $st->fetchColumn()) {
                    db()->prepare('UPDATE admins SET password_hash = ? WHERE id = ?')->execute([$hash, $id]);
                    $msg = "✓ «{$email}» ադմինի գաղտնաբառը փոխված է։";
                } else {
                    db()->prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)')->execute([$email, $hash]);
                    $msg = "✓ Ադմինը ստեղծված է՝ «{$email}»։";
                }
                $ok = true;
            }
        }
    } catch (Throwable $e) {
        error_log('[LuysTech setup] ' . $e->getMessage());
        $msg = 'Սխալ բազայի հետ աշխատելիս' . (cfg('debug', false) ? ' — ' . $e->getMessage() : '');
    }
}
?><!doctype html>
<html lang="hy"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>LuysTech — Setup</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b1120;color:#e2e8f0;font:15px/1.5 system-ui,'Noto Sans Armenian',sans-serif;padding:20px}
.card{width:min(460px,100%);background:#111a2e;border:1px solid #23304d;border-radius:16px;padding:28px}
h1{font-size:20px;margin:0 0 6px}p{color:#94a3b8;margin:0 0 16px;font-size:13.5px}
label{display:block;font-size:13px;color:#94a3b8;margin:12px 0 5px}
input{width:100%;box-sizing:border-box;padding:11px 12px;border-radius:9px;border:1px solid #2b3a5c;background:#0b1325;color:#fff;font-size:14px}
button{margin-top:18px;width:100%;padding:12px;border:0;border-radius:10px;background:#4f63c4;color:#fff;font-weight:700;font-size:15px;cursor:pointer}
.st{font-size:13px;padding:10px 12px;border-radius:9px;background:#0b1325;border:1px solid #23304d;margin-bottom:14px}
.msg{font-size:13.5px;padding:10px 12px;border-radius:9px;margin-top:14px}
.ok{background:rgba(52,211,153,.12);color:#6ee7b7;border:1px solid rgba(52,211,153,.35)}
.err{background:rgba(239,68,68,.1);color:#fca5a5;border:1px solid rgba(239,68,68,.35)}
a{color:#93a5f5}
</style></head><body><div class="card">
<h1>LuysTech — ադմինի կարգավորում</h1>
<p>Ստեղծեք առաջին ադմինին կամ փոխեք գոյություն ունեցող ադմինի գաղտնաբառը։</p>
<div class="st"><?= $h($dbStatus) ?></div>
<?php if (!$enabled): ?>
  <div class="msg err">Այս էջը անջատված է։ Միացնելու համար api/config.php-ում լրացրեք <b>setup_key</b> (առնվազն 16 նիշ)։</div>
<?php else: ?>
  <form method="post" autocomplete="off">
    <label>setup_key (config.php-ից)</label><input name="key" type="password" required>
    <label>Ադմինի էլ. փոստ</label><input name="email" type="email" required>
    <label>Գաղտնաբառ (առնվազն 8 նիշ)</label><input name="password" type="password" required minlength="8">
    <label>Կրկնել գաղտնաբառը</label><input name="password2" type="password" required minlength="8">
    <button type="submit">Պահպանել</button>
  </form>
  <?php if ($msg): ?><div class="msg <?= $ok ? 'ok' : 'err' ?>"><?= $h($msg) ?></div><?php endif; ?>
  <?php if ($ok): ?><p style="margin-top:14px">Մուտք՝ <a href="/login/">/login/</a>։ ⚠️ Անվտանգության համար config.php-ում հիմա <b>դատարկեք setup_key</b>-ը։</p><?php endif; ?>
<?php endif; ?>
</div></body></html>
