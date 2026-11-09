---
id: php-unserialize-input
title: Never unserialize() data a client can supply; use json_decode
impact: CRITICAL
impactDescription: "object injection: magic methods in loaded classes run attacker-chosen code"
roles: [implementer, reviewer, security]
check: "rg -n '\\bunserialize\\(' --type php"
tags: deserialisation
---
Source: cookies, request bodies, hidden fields, cache or queue entries a client can influence. Sink: `unserialize()`, which instantiates objects and triggers `__wakeup`/`__destruct` gadget chains, and `phar://` paths passed to file functions on PHP < 8. Use `json_decode($s, true, flags: JSON_THROW_ON_ERROR)`. Where `unserialize` must stay for trusted data, pass `['allowed_classes' => false]`.

**Incorrect:**

```php
$cart = unserialize(base64_decode($_COOKIE['cart']));
```

**Correct:**

```php
$cart = json_decode($_COOKIE['cart'] ?? '[]', true, 512, JSON_THROW_ON_ERROR);
```

Reference: https://www.php.net/manual/en/function.unserialize.php
