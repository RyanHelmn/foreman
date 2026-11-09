# sql · security
Applies when: a SQL driver or ORM is a dependency, or a pack extends this one
Read order: sql-least-privilege-user, sql-tls-connection

## Also trace (no rule file yet)
- ORM escape hatches with interpolated input: Drizzle and Kysely `sql.raw()`, Kysely `sql.lit()`, Knex `.raw()` / `whereRaw()` with template strings, TypeORM `.query()` or `.where()` with template strings, SQLAlchemy `text()` with f-strings, GORM `.Raw()`/`.Where()` with `fmt.Sprintf`.
- Migrations that widen access: `GRANT … TO PUBLIC`, new login roles with default passwords, dropped constraints that enforced tenancy.
- Database dumps and backups: encrypted at rest, never committed or written to a public bucket.
- Seeds and fixtures containing production data or real credentials.

## Commands
- `rg -n 'sql\.raw\(|sql\.lit\(|\.raw\(`|whereRaw\(`|text\(f' --glob '!**/node_modules/**'`
- `git ls-files '*.sql.gz' '*.dump' '*.bak'` for committed dumps.
