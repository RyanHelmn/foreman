---
id: mono-no-deep-import
title: Import other workspace packages by name and exported path, never into their src
impact: HIGH
impactDescription: "the import bypasses the package's build and boundary, and breaks when its files move"
roles: [implementer, reviewer]
check: "rg -n -e \"from '(\\.\\./)+(packages|apps|libs)/\" -e \"from '@[\\w-]+/[\\w-]+/(src|dist)/\""
tags: monorepo
---
Cross-package imports go through the package name and an `exports` entry. A relative path that climbs out of the package, or `@scope/pkg/src/...`, couples to internals, skips the package's own build and often compiles locally but fails in CI or in the bundler.

**Incorrect:**

```ts
import { formatMoney } from '../../../packages/utils/src/money'
import { Button } from '@acme/ui/src/components/button'
```

**Correct:**

```ts
import { formatMoney } from '@acme/utils'
import { Button } from '@acme/ui/button'
```
