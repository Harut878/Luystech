<?php
// ═══════════════════════════════════════════════════════════
// LuysTech — կարգավորումներ
// 1) Պատճենեք այս ֆայլը նույն թղթապանակում՝ «config.php» անունով
// 2) Լրացրեք PostgreSQL-ի տվյալները (cPanel → PostgreSQL Databases)
// 3) setup_key-ում գրեք երկար, պատահական գաղտնի բառ (առաջին ադմինի ստեղծման համար)
// ⚠️ config.php-ը գաղտնի է. մի տարածեք և մի դրեք public git-ում
// ═══════════════════════════════════════════════════════════

return [
    // ── PostgreSQL ──
    'db_host'    => 'localhost',
    'db_port'    => 5432,
    'db_name'    => 'cpaneluser_luystech',     // cPanel-ում սովորաբար՝ «օգտատեր_անուն»
    'db_user'    => 'cpaneluser_luystech',
    'db_pass'    => 'CHANGE-ME',
    'db_schema'  => 'public',
    'db_sslmode' => 'prefer',                  // localhost-ի համար՝ prefer կամ disable

    // ── Առաջին ադմինի ստեղծում / գաղտնաբառի վերականգնում (/api/setup.php) ──
    // Առնվազն 16 նիշ։ Ադմին ստեղծելուց հետո կարող եք դատարկել ('')՝ setup.php-ը կանջատվի։
    'setup_key'  => '',

    // ── Ոչ պարտադիր՝ նոր հարցման մասին email ծանուցում ──
    'notify_email' => '',                      // օր.՝ 'info@luystech.am'
    'mail_from'    => '',                      // օր.՝ 'noreply@luystech.am'

    // Միայն ստուգման ժամանակ՝ true (սխալների մանրամասները կերևան API-ի պատասխանում)
    'debug' => false,
];
