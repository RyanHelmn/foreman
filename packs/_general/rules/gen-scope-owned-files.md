---
id: gen-scope-owned-files
title: Change only the files the brief owns; no drive-by refactors
impact: HIGH
impactDescription: "parallel units collide and the diff hides the real change"
roles: [implementer, reviewer]
tags: general
---
Edits outside the owned files are reported as BLOCKED with what is needed. Renames, reformatting and refactors outside the task go in the report as suggestions, not in the diff. Migrations and config changes stay separate from logic changes where practical.

**Incorrect:**

```diff
  src/billing/invoice.service.ts   (owned)
+ src/auth/session.ts              (reformatted while passing)
```

**Correct:**

```text
Suggestion (not done): src/auth/session.ts has two unused imports.
```
