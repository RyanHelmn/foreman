---
id: gen-test-behaviour
title: Tests assert behaviour through the public interface, including the error path
impact: HIGH
impactDescription: "tests pass while the feature is broken, or break on every refactor"
roles: [implementer, reviewer, verifier]
tags: general
---
Assert outputs and effects a caller sees, not internal calls. Build data with factories, not shared fixtures. Cover at least one failure path. A snapshot alone is not a test.

**Incorrect:**

```ts
expect(repo.save).toHaveBeenCalled()
```

**Correct:**

```ts
await expect(service.create({ email: 'taken@x.io' })).rejects.toThrow(EmailTaken)
expect(await service.findByEmail('new@x.io')).toMatchObject({ status: 'pending' })
```
