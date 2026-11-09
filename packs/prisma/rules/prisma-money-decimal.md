---
id: prisma-money-decimal
title: Store money as Decimal or integer minor units, never Float
impact: HIGH
impactDescription: "totals drift by fractions of a cent and invoices stop reconciling"
roles: [implementer, reviewer]
check: "rg -n -i '(price|amount|total|balance|cost|fee)\w*\s+Float' --glob '*.prisma'"
tags: types, prisma
---
`Float` maps to a binary floating-point column; sums and comparisons round. Use `Decimal @db.Decimal(12, 2)`, which Prisma returns as `Prisma.Decimal`, and do arithmetic with its methods rather than after `Number()`; or store `Int`/`BigInt` minor units. Keep the currency in its own field.

**Incorrect:**

```prisma
total Float
```

```ts
const total = items.reduce((sum, i) => sum + Number(i.price), 0)
```

**Correct:**

```prisma
total    Decimal @db.Decimal(12, 2)
currency String  @db.Char(3)
```

```ts
const total = items.reduce((sum, i) => sum.add(i.price), new Prisma.Decimal(0))
```

Reference: https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types#working-with-decimal
