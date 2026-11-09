# mongodb · reviewer
Applies when: `mongodb`, `mongoose`, `pymongo` or `motor` is a dependency
Read order: mongo-operator-injection, mongo-transaction-multi-doc, mongo-index-per-query, mongo-bounded-in, mongo-schema-validation

## Blocker vs should-fix
- Blocker: a request value in a filter without schema parsing; an operation inside `withTransaction` missing `{ session }`.
- Should-fix: a new query shape with no matching index; an unbounded `$in` from input.
