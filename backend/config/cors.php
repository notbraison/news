<?php
return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://admin-frontend-news.up.railway.app',
        'https://public-frontend-news.up.railway.app',
        'https://news-production-2839.up.railway.app',
        'http://localhost:3000',//remove when deploying
        'http://localhost:3001',
        "https://eastafricabulletin.com/",
        "https://eastafricabulletin.com/admin"
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
