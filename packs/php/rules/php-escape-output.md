---
id: php-escape-output
title: Escape every echoed value with htmlspecialchars, and never |raw user content in Twig
impact: CRITICAL
impactDescription: "stored or reflected XSS runs script in other users' sessions"
roles: [implementer, reviewer, security]
check: "rg -n '<\\?=\\s*\\$|echo\\s+\\$_(GET|POST|REQUEST)|\\|\\s*raw' -g '*.php' -g '*.twig'"
tags: xss, output
---
Source: request values and DB columns users wrote. Sink: `echo`/`<?=` in plain PHP templates, `|raw` or `{% autoescape false %}` in Twig. Plain PHP does not escape; wrap each value in `htmlspecialchars($v, ENT_QUOTES, 'UTF-8')` at the point of output. Twig escapes by default; user HTML that must render goes through an HTML sanitiser (e.g. symfony/html-sanitizer) before `|raw`.

**Incorrect:**

```php
<p>Hello <?= $_GET['name'] ?></p>
```

**Correct:**

```php
<p>Hello <?= htmlspecialchars($_GET['name'] ?? '', ENT_QUOTES, 'UTF-8') ?></p>
```

```twig
{{ comment.body|sanitize_html }}
```

Reference: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
