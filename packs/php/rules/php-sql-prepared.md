---
id: php-sql-prepared
title: Use PDO/mysqli prepared statements with bound values, never interpolated SQL
impact: CRITICAL
impactDescription: "SQL injection from any request value placed in the query string"
roles: [implementer, reviewer, security]
check: "rg -n '(->query|->exec|mysqli_query|->executeQuery|->createQuery)\\(\\s*\"[^\"]*\\$' --type php"
tags: sql, pdo
---
Source: `$_GET`, `$_POST`, `$request->get()`, route parameters. Sink: `PDO::query`/`exec`, `mysqli_query`, Doctrine DBAL `executeQuery`, DQL `createQuery` with a variable in the string. Prepare with `?` or `:name` and pass values to `execute`/`setParameter`. Identifiers (`ORDER BY` columns) cannot be bound: map input to an allowlist.

**Incorrect:**

```php
$rows = $pdo->query("SELECT * FROM users WHERE email = '$email'")->fetchAll();
$q = $em->createQuery("SELECT u FROM App\Entity\User u WHERE u.name = '$name'");
```

**Correct:**

```php
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
$q = $em->createQuery('SELECT u FROM App\Entity\User u WHERE u.name = :name')->setParameter('name', $name);
```

Reference: https://www.php.net/manual/en/pdo.prepared-statements.php
