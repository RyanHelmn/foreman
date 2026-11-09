---
id: lara-mass-fillable
title: Declare $fillable on models; never $guarded = [] or Model::unguard()
impact: CRITICAL
impactDescription: "a request sets is_admin, user_id or team_id by adding a field"
roles: [implementer, reviewer, security]
check: "rg -n 'guarded\\s*=\\s*\\[\\s*\\]|::unguard\\(' app/"
tags: mass-assignment, eloquent
---
Source: request input. Sink: `create`, `fill`, `update`, `firstOrCreate`. With `$guarded = []`, every column is assignable, including ownership and role columns. List assignable columns in `$fillable`, leave privileged columns out, and set them from the session.

**Incorrect:**

```php
class Project extends Model
{
    protected $guarded = [];
}
```

**Correct:**

```php
class Project extends Model
{
    protected $fillable = ['name', 'description'];
}

$request->user()->projects()->create($request->validated());
```

Reference: https://laravel.com/docs/eloquent#mass-assignment
