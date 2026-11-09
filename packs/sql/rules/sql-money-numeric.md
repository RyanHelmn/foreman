---
id: sql-money-numeric
title: Store money as numeric/decimal or integer minor units, never float, real or double
impact: HIGH
impactDescription: "sums drift by fractions of a cent and invoice totals stop reconciling"
roles: [implementer, reviewer]
check: "rg -n -i '(price|amount|total|balance|cost|fee)\w*\s+(float|real|double)' --glob '*.sql'"
tags: types, sql
---
`float`, `real` and `double precision` are binary approximations: `0.1 + 0.2` is not `0.3`, and `SUM` over many rows accumulates the error. Use `numeric(12,2)` / `DECIMAL(12,2)` with precision sized to the largest amount, or a `bigint` of minor units, and keep the currency in its own column. In code, keep the value in a decimal type end to end.

**Incorrect:**

```sql
CREATE TABLE payments (id bigint PRIMARY KEY, amount double precision NOT NULL);
```

**Correct:**

```sql
CREATE TABLE payments (
  id bigint PRIMARY KEY,
  amount numeric(12,2) NOT NULL,
  currency char(3) NOT NULL
);
```
