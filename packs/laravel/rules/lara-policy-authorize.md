---
id: lara-policy-authorize
title: Authorise every resource action with a policy (authorize, can middleware or Gate)
impact: CRITICAL
impactDescription: "any signed-in user views, edits or deletes another user's model by changing the route id"
roles: [implementer, reviewer, security]
tags: auth, policies
---
Source: a route-model-bound `{post}` or an id from the request. Sink: the controller acting on that model. The `auth` middleware only proves sign-in. Call `$this->authorize('update', $post)` / `Gate::authorize(...)`, add `->can('update', 'post')` to the route, or `authorizeResource` in a resource controller, with the ownership logic in a Policy. Alternatively scope the lookup: `$request->user()->posts()->findOrFail($id)`.

**Incorrect:**

```php
public function update(UpdatePostRequest $request, Post $post)
{
    $post->update($request->validated());
}
```

**Correct:**

```php
public function update(UpdatePostRequest $request, Post $post)
{
    Gate::authorize('update', $post);
    $post->update($request->validated());
}
```

```php
public function update(User $user, Post $post): bool { return $user->id === $post->user_id; }
```

Reference: https://laravel.com/docs/authorization
