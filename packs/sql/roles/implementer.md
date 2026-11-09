# sql · implementer
Applies when: a SQL driver or ORM is a dependency (MySQL drivers, Drizzle, Kysely, TypeORM, Knex, Sequelize, SQLAlchemy, GORM, sqlx, Diesel), or a pack extends this one
Read order: sql-transaction-multi-write, sql-least-privilege-user, sql-tls-connection, sql-migrations-only, sql-index-filter-columns, sql-index-composite-order, sql-money-numeric, sql-closed-set-constraint

## Deviation rules
- A new query filtering, joining or sorting on an unindexed column: add the index in a migration in your files and say so.

## Output additions
- Migrations added: file name, and whether each locks, rewrites or drops data.

## Obstacles to report
- Load relations explicitly in the query (joins, `selectinload`, TypeORM `relations`, Drizzle `with`); ORM lazy loading inside a loop is an N+1 you must not introduce.
- MySQL commits implicitly after each DDL statement: a migration that fails halfway leaves earlier statements applied. Report which.
