---
id: lara-eager-with
title: Eager load relations a list touches with with()
impact: HIGH
impactDescription: "one query per row; a 50-row index issues 51+ queries"
roles: [implementer, reviewer]
tags: n+1, eloquent
---
Accessing `$post->author` inside a `foreach`, Blade loop or API Resource loads it per row. Add `with('author')` (nested: `with('comments.author')`) to the query, or `load()` on an existing collection. Where the project calls `Model::preventLazyLoading()`, a lazy load throws in dev; don't remove it to get green.

**Incorrect:**

```php
$posts = Post::latest()->paginate(50);
return PostResource::collection($posts);
```

**Correct:**

```php
$posts = Post::with('author')->latest()->paginate(50);
return PostResource::collection($posts);
```

Reference: https://laravel.com/docs/eloquent-relationships#eager-loading
