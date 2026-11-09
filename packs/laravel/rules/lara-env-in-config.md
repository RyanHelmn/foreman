---
id: lara-env-in-config
title: Call env() only inside config/ files; read config() everywhere else
impact: MEDIUM
impactDescription: "after php artisan config:cache in production, env() returns null and the feature silently breaks"
roles: [implementer, reviewer]
check: "rg -n '\\benv\\(' app/ routes/ resources/"
tags: config
---
Production runs `php artisan config:cache`, after which `.env` is not loaded and `env()` outside `config/*.php` returns `null` (or its default). Add the key to a config file and read it with `config()`.

**Incorrect:**

```php
$client = new StripeClient(env('STRIPE_SECRET'));
```

**Correct:**

```php
'stripe' => ['secret' => env('STRIPE_SECRET')],
```

```php
$client = new StripeClient(config('services.stripe.secret'));
```

Reference: https://laravel.com/docs/configuration#configuration-caching
