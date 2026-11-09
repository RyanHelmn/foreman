---
id: lara-raw-bindings
title: Pass values to DB::raw, whereRaw, orderByRaw and DB::select as bindings
impact: CRITICAL
impactDescription: "SQL injection from any interpolated request value"
roles: [implementer, reviewer, security]
check: "rg -n '(DB::raw|DB::select|DB::statement|(where|having|orderBy|select|groupBy)Raw)\\(\\s*\"[^\"]*\\$' --type php"
tags: sql, eloquent
---
Source: request input. Sink: `DB::raw`, `whereRaw`/`havingRaw`/`orderByRaw`/`selectRaw`, `DB::select`/`DB::statement`. The query builder binds values only in its non-raw methods. In raw fragments use `?` and the bindings argument. Column names (sorting) cannot be bound: map input to an allowlist.

**Incorrect:**

```php
$users = DB::select("select * from users where email = '$email'");
Post::whereRaw("title like '%{$request->q}%'")->get();
```

**Correct:**

```php
$users = DB::select('select * from users where email = ?', [$email]);
Post::whereRaw('title like ?', ['%'.$request->q.'%'])->get();
Post::orderBy(in_array($request->sort, ['title', 'created_at'], true) ? $request->sort : 'created_at')->get();
```

Reference: https://laravel.com/docs/queries#raw-expressions
