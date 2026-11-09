# sql · reviewer
Applies when: a SQL driver or ORM is a dependency, or a pack extends this one
Read order: sql-transaction-multi-write, sql-least-privilege-user, sql-tls-connection, sql-migrations-only, sql-index-filter-columns, sql-index-composite-order, sql-money-numeric, sql-closed-set-constraint

## Blocker vs should-fix
- Blocker: a schema change with no migration, or an edit to an applied migration; float types for money; dependent writes outside a transaction on a money, stock or auth path; the app connecting as a superuser or owner role.
- Should-fix: a new filter, join or sort column without an index; composite index columns in the wrong order; a status or type column without `CHECK`/enum or `NOT NULL`; relations loaded lazily inside a loop (SQLAlchemy default `lazy="select"`, TypeORM lazy relations).
- Nit: a redundant single-column index already covered by a composite's leading column.
