<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Railway Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration specific to Railway deployment
    |
    */

    'trusted_proxies' => [
        '0.0.0.0/0',
        '::/0',
    ],

    'trusted_hosts' => [
        'news-production-2839.up.railway.app',
        '*.up.railway.app',
    ],

    'force_https' => env('FORCE_HTTPS', true),

    'session_domain' => env('SESSION_DOMAIN', '.up.railway.app'),

    'cors_origins' => [
        'https://news-production-2839.up.railway.app',
        'https://*.up.railway.app',
        'https://public-frontend-news.vercel.app',
        'https://admin-frontend-news.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
    ],
];
