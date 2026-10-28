<?php
// LuysTech API — ընդհանուր գործիքներ (բազա, JSON, նստաշրջան, անվտանգություն)
// Պահանջ՝ PHP 7.4+ և pdo_pgsql extension։

if (!defined('LT_API')) { http_response_code(403); exit; }

// ── Կարգավորումներ (api/config.php) ──
function cfg(string $key, $default = null) {
    static $CFG = null;
    if ($CFG === null) {
        $file = __DIR__ . '/../config.php';
        if (!is_file($file)) {
            json_out(['ok' => false, 'error' => 'api/config.php չկա. պատճենեք config.sample.php-ը config.php անունով և լրացրեք'], 500);
        }
        $CFG = require $file;
        if (!is_array($CFG)) $CFG = [];
    }
    return array_key_exists($key, $CFG) ? $CFG[$key] : $default;
}

// ── JSON պատասխան ──
function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, max-age=0');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $error, int $code = 400): void {
    json_out(['ok' => false, 'error' => $error], $code);
}

// JSON body (POST)
function body(): array {
    static $b = null;
    if ($b !== null) return $b;
    $raw = file_get_contents('php://input');
    $d = json_decode($raw ? $raw : '[]', true);
    $b = is_array($d) ? $d : [];
    return $b;
}

// ── PostgreSQL կապ (PDO) ──
function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $dsn = sprintf(
        'pgsql:host=%s;port=%d;dbname=%s;sslmode=%s',
        cfg('db_host', 'localhost'), (int) cfg('db_port', 5432), cfg('db_name', ''), cfg('db_sslmode', 'prefer')
    );
    $pdo = new PDO($dsn, (string) cfg('db_user', ''), (string) cfg('db_pass', ''), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $schema = (string) cfg('db_schema', 'public');
    if (!preg_match('/^[a-z_][a-z0-9_]*$/i', $schema)) throw new RuntimeException('bad db_schema');
    $pdo->exec('SET search_path TO ' . $schema);
    $pdo->exec("SET client_encoding TO 'UTF8'");
    $pdo->exec("SET TIME ZONE 'UTC'");
    return $pdo;
}

// Նույնացուցիչի (սյան/աղյուսակի) անվտանգ մեջբերում — միայն allowlist-ից եկած անունների համար
function qi(string $name): string {
    return '"' . str_replace('"', '""', $name) . '"';
}

// ── Նստաշրջան (PHP session cookie) ──
function is_https(): bool {
    if (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') return true;
    if (strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https') return true;
    return (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443;
}

function start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', '28800');
    session_name('LTSESS');
    session_set_cookie_params([
        'lifetime' => 0, 'path' => '/', 'secure' => is_https(), 'httponly' => true, 'samesite' => 'Lax',
    ]);
    session_start();
}

const SESSION_IDLE = 28800; // 8 ժամ անգործությունից հետո՝ ելք

function current_admin(): ?array {
    start_session();
    if (empty($_SESSION['admin_id'])) return null;
    if (time() - (int) ($_SESSION['last'] ?? 0) > SESSION_IDLE) {
        end_session();
        return null;
    }
    $_SESSION['last'] = time();
    return ['id' => (int) $_SESSION['admin_id'], 'email' => (string) ($_SESSION['admin_email'] ?? '')];
}

function require_admin(): array {
    $a = current_admin();
    if (!$a) fail('unauthorized', 401);
    return $a;
}

function end_session(): void {
    start_session();
    $_SESSION = [];
    $p = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires' => time() - 3600, 'path' => $p['path'], 'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Lax',
    ]);
    session_destroy();
}

// ── CSRF պաշտպանություն POST-երի համար ──
// Ճակատը (frontend-ը) միշտ ուղարկում է «X-LT: 1» header — այլ կայքի form-ը դա անել չի կարող։
function require_post(): void {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('POST required', 405);
    if (($_SERVER['HTTP_X_LT'] ?? '') !== '1') fail('bad request', 400);
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '' && $origin !== 'null') {
        $oh = strtolower((string) parse_url($origin, PHP_URL_HOST));
        $hh = strtolower(preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
        if ($oh !== '' && $oh !== $hh) fail('forbidden origin', 403);
    }
}

// ── Չարաշահման սահմանափակում (DB-ով, աշխատում է նաև shared hosting-ում) ──
function client_ip(): string {
    return substr((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 0, 64);
}

/** true՝ եթե սահմանը գերազանցված է */
function rate_limited(string $key, int $max, int $windowSec): bool {
    $db = db();
    $st = $db->prepare("SELECT count(*) FROM rate_limits WHERE k = ? AND ts > now() - (?::int * interval '1 second')");
    $st->execute([$key, $windowSec]);
    if ((int) $st->fetchColumn() >= $max) return true;
    $db->prepare('INSERT INTO rate_limits (k, ts) VALUES (?, now())')->execute([$key]);
    if (random_int(1, 40) === 1) $db->exec("DELETE FROM rate_limits WHERE ts < now() - interval '2 days'");
    return false;
}

function uuid4(): string {
    $d = random_bytes(16);
    $d[6] = chr((ord($d[6]) & 0x0f) | 0x40);
    $d[8] = chr((ord($d[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($d), 4));
}

// ── Բովանդակության աղյուսակները ──
// read  — կարդացվող սյուները, write — ադմինից գրվող սյուները (allowlist), json — jsonb սյուները
function tables(): array {
    return [
        'modules'    => ['read' => ['id', 'key', 'icon', 'image_url', 'image_url_light', 'title', 'desc', 'long', 'video_url', 'sort', 'active'],
                         'write' => ['icon', 'image_url', 'image_url_light', 'title', 'desc', 'long', 'video_url', 'sort', 'active'],
                         'json' => ['title', 'desc', 'long']],
        'benefits'   => ['read' => ['id', 'icon', 'title', 'desc', 'sort', 'active'],
                         'write' => ['icon', 'title', 'desc', 'sort', 'active'], 'json' => ['title', 'desc']],
        'why_stats'  => ['read' => ['id', 'target', 'suffix', 'decimals', 'label', 'sort'],
                         'write' => ['target', 'suffix', 'decimals', 'label', 'sort'], 'json' => ['label']],
        'industries' => ['read' => ['id', 'icon', 'name', 'desc', 'sort', 'active'],
                         'write' => ['icon', 'name', 'desc', 'sort', 'active'], 'json' => ['name', 'desc']],
        'clients'    => ['read' => ['id', 'name', 'logo_url', 'logo_mode', 'url', 'sort', 'active'],
                         'write' => ['name', 'logo_url', 'logo_mode', 'url', 'sort', 'active'], 'json' => []],
        'partners'   => ['read' => ['id', 'name', 'logo_url', 'logo_mode', 'desc', 'long', 'link', 'sort', 'active'],
                         'write' => ['name', 'logo_url', 'logo_mode', 'desc', 'long', 'link', 'sort', 'active'], 'json' => ['desc', 'long']],
        'stories'    => ['read' => ['id', 'name', 'logo_url', 'industry', 'challenge', 'solution', 'metrics', 'sort', 'active'],
                         'write' => ['name', 'logo_url', 'industry', 'challenge', 'solution', 'metrics', 'sort', 'active'],
                         'json' => ['industry', 'challenge', 'solution', 'metrics']],
        'proof'      => ['read' => ['id', 'target', 'suffix', 'label', 'sort'],
                         'write' => ['target', 'suffix', 'label', 'sort'], 'json' => ['label']],
    ];
}

const BOOL_COLS = ['active'];
const INT_COLS = ['sort', 'decimals'];
const NUM_COLS = ['target'];

// DB-ից կարդացած տողը → JSON-ի համար ճիշտ տիպերով
function norm_row(array $r, array $def): array {
    foreach ($def['json'] as $c) {
        if (array_key_exists($c, $r) && $r[$c] !== null) $r[$c] = json_decode((string) $r[$c], true);
    }
    foreach (BOOL_COLS as $c) {
        if (array_key_exists($c, $r)) $r[$c] = in_array($r[$c], [true, 1, '1', 't', 'true'], true);
    }
    foreach (INT_COLS as $c) {
        if (array_key_exists($c, $r) && $r[$c] !== null) $r[$c] = (int) $r[$c];
    }
    foreach (NUM_COLS as $c) {
        if (array_key_exists($c, $r) && $r[$c] !== null) {
            $f = (float) $r[$c];
            $r[$c] = (floor($f) == $f && abs($f) < PHP_INT_MAX) ? (int) $f : $f;
        }
    }
    return $r;
}

// JSON-ից եկած արժեքը → SQL պարամետր
function encode_val(string $col, $v, array $def) {
    if ($v === null) return null;
    if (in_array($col, $def['json'], true)) return json_encode($v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (in_array($col, BOOL_COLS, true)) return ($v === true || $v === 1 || $v === '1' || $v === 'true' || $v === 't') ? 't' : 'f';
    if (in_array($col, INT_COLS, true)) return (int) $v;
    if (in_array($col, NUM_COLS, true)) return is_numeric($v) ? (string) $v : '0';
    if (is_array($v)) return json_encode($v, JSON_UNESCAPED_UNICODE);
    return mb_substr((string) $v, 0, 5000);
}

function select_rows(string $table, array $def): array {
    $rows = db()->query('SELECT ' . implode(', ', array_map('qi', $def['read'])) . ' FROM ' . qi($table) . ' ORDER BY sort, id')->fetchAll();
    $out = [];
    foreach ($rows as $r) $out[] = norm_row($r, $def);
    return $out;
}

function get_json_doc(string $table): array {
    $st = db()->query('SELECT data FROM ' . qi($table) . ' WHERE id = 1');
    $v = $st->fetchColumn();
    $d = $v === false || $v === null ? [] : json_decode((string) $v, true);
    return is_array($d) ? $d : [];
}

function put_json_doc(string $table, array $data): void {
    $st = db()->prepare('INSERT INTO ' . qi($table) . ' (id, data) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data');
    $st->execute([json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
}

// Կարճ Google Maps հղումը (maps.app.goo.gl / goo.gl) → իրական հասցե (iframe-ում ցուցադրելու համար)
function resolve_map_link($embed) {
    if (!is_string($embed)) return $embed;
    $m = trim($embed);
    if (!preg_match('~^https?://(maps\.app\.goo\.gl|goo\.gl)/~i', $m)) return $embed;
    if (!function_exists('curl_init')) return $embed;
    $ch = curl_init($m);
    curl_setopt_array($ch, [
        CURLOPT_FOLLOWLOCATION => true, CURLOPT_MAXREDIRS => 6, CURLOPT_RETURNTRANSFER => true,
        CURLOPT_NOBODY => true, CURLOPT_TIMEOUT => 8, CURLOPT_USERAGENT => 'Mozilla/5.0',
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS | CURLPROTO_HTTP,
    ]);
    curl_exec($ch);
    $final = (string) curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    curl_close($ch);
    return preg_match('~google\.[^/]+/maps~i', $final) ? $final : $embed;
}
