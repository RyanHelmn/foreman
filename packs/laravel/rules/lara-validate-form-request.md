---
id: lara-validate-form-request
title: Validate with a Form Request (or $request->validate) and persist only validated()
impact: HIGH
impactDescription: "unvalidated or extra fields reach the model and the database"
roles: [implementer, reviewer, security]
check: "rg -n '\\$request->(all|input)\\(\\)' app/Http"
tags: validation, form-request
---
Every write action takes a Form Request (`php artisan make:request`) or calls `$request->validate([...])`, and passes `$request->validated()` (or `safe()->only([...])`) to the model. `$request->all()` passes every field the client sent, validated or not. A Form Request's `authorize()` returning `true` does not replace the policy check.

**Incorrect:**

```php
public function store(Request $request)
{
    return Post::create($request->all());
}
```

**Correct:**

```php
public function store(StorePostRequest $request)
{
    return $request->user()->posts()->create($request->validated());
}
```

```php
public function rules(): array { return ['title' => ['required', 'string', 'max:200']]; }
```

Reference: https://laravel.com/docs/validation#form-request-validation
