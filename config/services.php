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

    'ai' => [
        'provider' => env('AI_PROVIDER', 'groq'),
        'base_url' => rtrim((string) env('AI_BASE_URL', 'https://api.groq.com/openai/v1'), '/'),
        'key' => env('AI_API_KEY', env('GROQ_API_KEY')),
        'model' => env('AI_MODEL', env('GROQ_MODEL', 'llama-3.3-70b-versatile')),
        'fallback_models' => array_values(array_filter(array_map(
            fn (string $item) => trim($item),
            explode(',', (string) env(
                'AI_FALLBACK_MODELS',
                'openai/gpt-oss-120b,meta-llama/llama-4-scout-17b-16e-instruct,qwen/qwen3-32b'
            ))
        ))),
        'request_timeout_seconds' => (int) env('AI_REQUEST_TIMEOUT_SECONDS', 25),
        'connect_timeout_seconds' => (int) env('AI_CONNECT_TIMEOUT_SECONDS', 6),
        'request_budget_seconds' => (int) env('AI_REQUEST_BUDGET_SECONDS', 70),
        'http_referer' => env('AI_HTTP_REFERER', env('APP_URL')),
        'app_title' => env('AI_APP_TITLE', env('APP_NAME', 'Convexa')),
    ],

];
