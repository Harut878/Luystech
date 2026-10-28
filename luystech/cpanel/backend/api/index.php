<?php
// ═══════════════════════════════════════════════════════════
// LuysTech API — մեկ մուտքի կետ.  /api/?a=<գործողություն>
// Հանրային՝  content, contact
// Մուտք՝     login, logout, me, password
// Ադմին՝     dashboard, list, upsert, delete, texts, settings, section,
//            requests, request_status, request_delete, upload
// ═══════════════════════════════════════════════════════════

define('LT_API', true);
require __DIR__ . '/lib/bootstrap.php';

$action = (string) ($_GET['a'] ?? '');

try {
    switch ($action) {

        // ─────────── Հանրային ───────────

        case 'content': {
            // Ամբողջ կայքի բովանդակությունը (ակտիվության ֆիլտրը՝ ճակատում)
            $out = ['ok' => true, 'texts' => get_json_doc('site_texts'), 'settings' => get_json_doc('app_settings')];
            $keys = ['why_stats' => 'whyStats'];
            foreach (tables() as $t => $def) $out[$keys[$t] ?? $t] = select_rows($t, $def);
            json_out($out);
        }

        case 'contact': {
            require_post();
            if (rate_limited('contact:' . client_ip(), 5, 600)) fail('Չափազանց շատ հարցումներ։ Փորձեք քիչ ուշ։', 429);
            $b = body();
            $cap = function ($k, $n) use ($b) { return mb_substr(trim((string) ($b[$k] ?? '')), 0, $n); };
            // Honeypot — բոտերը լրացնում են այս թաքնված դաշտը. ընդունում ենք լուռ, առանց պահելու
            if ($cap('website', 1) !== '') json_out(['ok' => true, 'stored' => false]);
            $company = $cap('company', 200); $person = $cap('person', 200);
            $phone = $cap('phone', 60); $email = $cap('email', 200); $message = $cap('message', 2000);
            if ($company === '' || $person === '' || $phone === '' || $email === '') fail('missing fields');
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('bad email');
            db()->prepare('INSERT INTO contact_requests (id, company, person, phone, email, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, \'new\', now())')
                ->execute([uuid4(), $company, $person, $phone, $email, $message]);

            // Ոչ պարտադիր email ծանուցում (config.php → notify_email)
            $to = trim((string) cfg('notify_email', ''));
            if ($to !== '' && function_exists('mail')) {
                $from = trim((string) cfg('mail_from', '')) ?: ('noreply@' . preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? 'localhost')));
                $subject = '=?UTF-8?B?' . base64_encode('Նոր հարցում — ' . $company) . '?=';
                $text = "Ընկերություն: $company\nԱնձ: $person\nՀեռախոս: $phone\nԷլ.փոստ: $email\n\n$message";
                $headers = "From: $from\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8";
                @mail($to, $subject, $text, $headers);
            }
            json_out(['ok' => true, 'stored' => true]);
        }

        // ─────────── Մուտք ───────────

        case 'login': {
            require_post();
            if (rate_limited('login:' . client_ip(), 10, 900)) fail('Չափազանց շատ փորձեր։ Փորձեք 15 րոպեից։', 429);
            $b = body();
            $email = strtolower(trim((string) ($b['email'] ?? '')));
            $pass = (string) ($b['password'] ?? '');
            $st = db()->prepare('SELECT id, email, password_hash FROM admins WHERE lower(email) = ?');
            $st->execute([$email]);
            $row = $st->fetch();
            // Նույն ժամանակը թե՛ կա, թե՛ չկա օգտատերը
            $hash = $row ? (string) $row['password_hash'] : '$2y$10$xoHXNETKVDzRmcdKwJHPTuneFBeS5.s3a1qIMezdzN/uRJa/ZvcOS';
            $ok = password_verify($pass, $hash) && $row;
            if (!$ok) fail('Սխալ էլ. փոստ կամ գաղտնաբառ։', 401);
            start_session();
            session_regenerate_id(true);
            $_SESSION['admin_id'] = (int) $row['id'];
            $_SESSION['admin_email'] = (string) $row['email'];
            $_SESSION['last'] = time();
            if (password_needs_rehash($hash, PASSWORD_DEFAULT)) {
                db()->prepare('UPDATE admins SET password_hash = ? WHERE id = ?')->execute([password_hash($pass, PASSWORD_DEFAULT), (int) $row['id']]);
            }
            json_out(['ok' => true, 'email' => $row['email']]);
        }

        case 'logout': {
            require_post();
            end_session();
            json_out(['ok' => true]);
        }

        case 'me': {
            $a = current_admin();
            if (!$a) fail('unauthorized', 401);
            json_out(['ok' => true, 'email' => $a['email']]);
        }

        case 'password': {
            require_post();
            $a = require_admin();
            $b = body();
            $cur = (string) ($b['current'] ?? '');
            $next = (string) ($b['next'] ?? '');
            if (strlen($next) < 8) fail('Նոր գաղտնաբառը պետք է լինի առնվազն 8 նիշ։');
            $st = db()->prepare('SELECT password_hash FROM admins WHERE id = ?');
            $st->execute([$a['id']]);
            $hash = (string) $st->fetchColumn();
            if (!password_verify($cur, $hash)) fail('Ընթացիկ գաղտնաբառը սխալ է։');
            db()->prepare('UPDATE admins SET password_hash = ? WHERE id = ?')->execute([password_hash($next, PASSWORD_DEFAULT), $a['id']]);
            session_regenerate_id(true);
            json_out(['ok' => true]);
        }

        // ─────────── Ադմին ───────────

        case 'dashboard': {
            require_admin();
            $db = db();
            $c = function ($sql) use ($db) { return (int) $db->query($sql)->fetchColumn(); };
            $recent = $db->query("SELECT id, company, person, phone, email, message, status,
                to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') AS created_at
                FROM contact_requests ORDER BY created_at DESC LIMIT 5")->fetchAll();
            json_out(['ok' => true, 'counts' => [
                'modules' => $c('SELECT count(*) FROM modules'),
                'industries' => $c('SELECT count(*) FROM industries'),
                'partners' => $c('SELECT count(*) FROM partners'),
                'requests' => $c('SELECT count(*) FROM contact_requests'),
                'newRequests' => $c("SELECT count(*) FROM contact_requests WHERE status = 'new'"),
            ], 'recent' => $recent]);
        }

        case 'list': {
            require_admin();
            $t = (string) ($_GET['t'] ?? '');
            $defs = tables();
            if (!isset($defs[$t])) fail('bad table');
            json_out(['ok' => true, 'rows' => select_rows($t, $defs[$t])]);
        }

        case 'upsert': {
            require_post();
            require_admin();
            $b = body();
            $t = (string) ($b['table'] ?? '');
            $row = is_array($b['row'] ?? null) ? $b['row'] : [];
            $defs = tables();
            if (!isset($defs[$t])) fail('bad table');
            $def = $defs[$t];
            $id = is_string($row['id'] ?? null) ? trim($row['id']) : '';
            if ($id === '' || strlen($id) > 64) fail('bad id');
            $cols = ['id']; $vals = [$id];
            foreach ($def['write'] as $col) {
                if (!array_key_exists($col, $row)) continue;
                $cols[] = $col;
                $vals[] = encode_val($col, $row[$col], $def);
            }
            $sql = 'INSERT INTO ' . qi($t) . ' (' . implode(', ', array_map('qi', $cols)) . ') VALUES (' . implode(', ', array_fill(0, count($cols), '?')) . ')';
            $upd = [];
            foreach (array_slice($cols, 1) as $col) $upd[] = qi($col) . ' = EXCLUDED.' . qi($col);
            $sql .= $upd ? ' ON CONFLICT (id) DO UPDATE SET ' . implode(', ', $upd) : ' ON CONFLICT (id) DO NOTHING';
            db()->prepare($sql)->execute($vals);
            json_out(['ok' => true]);
        }

        case 'delete': {
            require_post();
            require_admin();
            $b = body();
            $t = (string) ($b['table'] ?? '');
            if (!isset(tables()[$t])) fail('bad table');
            db()->prepare('DELETE FROM ' . qi($t) . ' WHERE id = ?')->execute([(string) ($b['id'] ?? '')]);
            json_out(['ok' => true]);
        }

        case 'texts': {
            require_post();
            require_admin();
            $d = body()['data'] ?? null;
            if (!is_array($d)) fail('bad data');
            put_json_doc('site_texts', $d);
            json_out(['ok' => true]);
        }

        case 'settings': {
            require_post();
            require_admin();
            $d = body()['data'] ?? null;
            if (!is_array($d)) fail('bad data');
            if (array_key_exists('map_embed', $d)) $d['map_embed'] = resolve_map_link($d['map_embed']);
            put_json_doc('app_settings', $d);
            json_out(['ok' => true]);
        }

        case 'section': {
            require_post();
            require_admin();
            $b = body();
            $key = (string) ($b['key'] ?? '');
            $allowed = ['about', 'bc', 'benefits', 'stats', 'industries', 'clients', 'partners', 'stories', 'proof', 'demo'];
            if (!in_array($key, $allowed, true)) fail('bad key');
            $cur = get_json_doc('app_settings');
            $sections = is_array($cur['sections'] ?? null) ? $cur['sections'] : [];
            $sections[$key] = !empty($b['on']);
            $cur['sections'] = $sections;
            put_json_doc('app_settings', $cur);
            json_out(['ok' => true]);
        }

        case 'requests': {
            require_admin();
            $rows = db()->query("SELECT id, company, person, phone, email, message, status,
                to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') AS created_at
                FROM contact_requests ORDER BY created_at DESC")->fetchAll();
            json_out(['ok' => true, 'rows' => $rows]);
        }

        case 'request_status': {
            require_post();
            require_admin();
            $b = body();
            $status = (string) ($b['status'] ?? '');
            if (!in_array($status, ['new', 'contacted', 'done'], true)) fail('bad status');
            db()->prepare('UPDATE contact_requests SET status = ? WHERE id::text = ?')->execute([$status, (string) ($b['id'] ?? '')]);
            json_out(['ok' => true]);
        }

        case 'request_delete': {
            require_post();
            require_admin();
            db()->prepare('DELETE FROM contact_requests WHERE id::text = ?')->execute([(string) (body()['id'] ?? '')]);
            json_out(['ok' => true]);
        }

        case 'upload': {
            require_post();
            require_admin();
            $folders = ['modules', 'clients', 'partners', 'stories'];
            $folder = (string) ($_POST['folder'] ?? '');
            if (!in_array($folder, $folders, true)) fail('bad folder');
            $f = $_FILES['file'] ?? null;
            if (!$f || !is_array($f) || ($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp_name'])) {
                $code = is_array($f) ? (int) ($f['error'] ?? 0) : 0;
                fail(in_array($code, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) ? 'նկարը շատ մեծ է սերվերի համար' : 'no file');
            }
            if ((int) $f['size'] > 5 * 1024 * 1024) fail('նկարը շատ մեծ է (առավելագույնը 5MB)');
            // Միայն իրական ռաստր նկարներ (SVG-ն արգելված է՝ XSS-ից խուսափելու համար)
            $exts = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp', 'image/gif' => 'gif'];
            $mime = '';
            if (function_exists('finfo_open')) {
                $fi = finfo_open(FILEINFO_MIME_TYPE);
                $mime = (string) finfo_file($fi, $f['tmp_name']);
                finfo_close($fi);
            }
            $info = @getimagesize($f['tmp_name']);
            if ($mime === '' && $info) $mime = (string) $info['mime'];
            if (!isset($exts[$mime]) || !$info) fail('միայն PNG, JPG, WEBP կամ GIF նկարներ են թույլատրված');
            $dir = dirname(__DIR__) . '/uploads/' . $folder;
            if (!is_dir($dir) && !mkdir($dir, 0755, true)) fail('uploads թղթապանակը գրելի չէ', 500);
            $name = time() . '-' . bin2hex(random_bytes(4)) . '.' . $exts[$mime];
            if (!move_uploaded_file($f['tmp_name'], $dir . '/' . $name)) fail('չհաջողվեց պահել ֆայլը', 500);
            @chmod($dir . '/' . $name, 0644);
            json_out(['ok' => true, 'url' => '/uploads/' . $folder . '/' . $name]);
        }

        default:
            fail('unknown action', 404);
    }
} catch (Throwable $e) {
    error_log('[LuysTech API] ' . $action . ': ' . $e->getMessage());
    json_out(['ok' => false, 'error' => cfg('debug', false) ? $e->getMessage() : 'server error'], 500);
}
