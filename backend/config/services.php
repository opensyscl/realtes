<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'mercadolibre' => [
        'client_id' => env('ML_CLIENT_ID'),
        'client_secret' => env('ML_CLIENT_SECRET'),
        'redirect_uri' => env('ML_REDIRECT_URI'),
        'site_id' => env('ML_SITE_ID', 'MLC'),
        'auth_base' => env('ML_AUTH_BASE', 'https://auth.mercadolibre.cl/authorization'),
        'api_base' => env('ML_API_BASE', 'https://api.mercadolibre.com'),
        'allowed_ips' => array_values(array_filter(array_map(
            'trim',
            explode(',', env('ML_ALLOWED_IPS', '54.88.218.97,18.215.140.160,18.213.114.129,18.206.34.84')),
        ))),
        // /ajustes con la pestaña Integraciones (no es una ruta separada — es un tab)
        'frontend_redirect' => env(
            'ML_FRONTEND_REDIRECT',
            rtrim((string) env('FRONTEND_URL', 'http://localhost:3001'), '/').'/ajustes',
        ),
    ],

];
