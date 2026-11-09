---
id: php-include-input
title: Never build include/require paths from input; map input to a fixed list
impact: CRITICAL
impactDescription: "local file inclusion reads secrets, or runs an uploaded file as PHP"
roles: [implementer, reviewer, security]
check: "rg -n '(include|require)(_once)?\\s*\\(?[^;]*\\$_(GET|POST|REQUEST|COOKIE)' --type php"
tags: lfi, rce
---
Source: any request value, including one that was "sanitised" with `basename` or a suffix. Sink: `include`, `include_once`, `require`, `require_once`. PHP executes whatever the path names, including `../../storage/uploads/avatar.jpg` with PHP inside it. Select the file from a fixed map.

**Incorrect:**

```php
include __DIR__ . '/pages/' . $_GET['page'] . '.php';
```

**Correct:**

```php
$pages = ['home' => 'home.php', 'pricing' => 'pricing.php'];
include __DIR__ . '/pages/' . ($pages[$_GET['page'] ?? 'home'] ?? 'home.php');
```

Reference: https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/11.1-Testing_for_Local_File_Inclusion
