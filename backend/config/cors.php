<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3001'),
        'http://localhost:3000',
        'http://localhost:3001',
        // Astro dev (sitio público astro-valenciapro)
        'http://localhost:4321',
        'http://localhost:4322',
        'http://localhost:4323',
    ],
    'allowed_origins_patterns' => [
        // Cualquier puerto local (preview/dev/test)
        '#^https?://localhost(:\d+)?$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
