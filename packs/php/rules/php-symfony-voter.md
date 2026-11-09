---
id: php-symfony-voter
title: Check object access in Symfony with denyAccessUnlessGranted and a voter
impact: CRITICAL
impactDescription: "any signed-in user reads or edits another user's entity by changing the route id"
roles: [implementer, reviewer, security]
tags: auth, symfony
---
Source: an entity loaded from a route parameter (`{id}`, param converter, `#[MapEntity]`). Sink: the controller acting on it. `access_control` in `security.yaml` and `ROLE_USER` only prove sign-in. Call `$this->denyAccessUnlessGranted('EDIT', $post)` (or the `#[IsGranted]` attribute with a subject) and put the ownership logic in a `Voter`.

**Incorrect:**

```php
#[Route('/posts/{id}/edit')]
public function edit(Post $post, Request $request): Response
{
    $form = $this->createForm(PostType::class, $post);
```

**Correct:**

```php
public function edit(Post $post, Request $request): Response
{
    $this->denyAccessUnlessGranted('EDIT', $post);
    $form = $this->createForm(PostType::class, $post);
```

```php
protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
{
    return $subject->getAuthor() === $token->getUser();
}
```

Reference: https://symfony.com/doc/current/security/voters.html
