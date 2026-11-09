# postgres · security
Applies when: a Postgres driver is a dependency
Read order: pg-rls-forced, pg-vector-tenant-filter

## Also trace (no rule file yet)
- Migrations: `DISABLE ROW LEVEL SECURITY`, `DROP POLICY`, policies with `USING (true)`, `ALTER ROLE … BYPASSRLS`, `GRANT … TO PUBLIC`.
- `SECURITY DEFINER` functions without `SET search_path = …`: a caller can shadow objects and run code with the owner's rights.
- Embedding tables for private content without a tenant column, or shared across tenants by design without saying so.

## Commands
- App role must not bypass policies: `psql "$DATABASE_URL" -c "SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user"` (both `f`).
- RLS tables missing FORCE: `psql "$DATABASE_URL" -c "SELECT relname FROM pg_class WHERE relrowsecurity AND NOT relforcerowsecurity"`
