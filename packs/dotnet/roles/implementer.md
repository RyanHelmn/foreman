# dotnet · implementer
Applies when: *.csproj, *.sln or global.json present
Read order: net-authz-fallback, net-ef-raw-sql, net-deser-typename, net-validate-model, net-antiforgery, net-ef-include, net-ef-no-tracking, net-options-validated

## Iron laws
- No request value concatenated or `$"..."`-interpolated into `FromSqlRaw`, `ExecuteSqlRaw`, Dapper or `SqlCommand` text. Thinking "it's a Guid, it can't inject"? That is the bug.

## Deviation rules
- Schema changes go through `dotnet ef migrations add <Name>`; commit the migration and the updated model snapshot together; never edit an applied migration.
- Inject dependencies through the constructor (or primary constructor); no `IServiceProvider.GetService` in business code.
- Follow the project's choice of controllers or minimal APIs; don't add the other style.

## Output additions
- Migration added: name, or none.

## Obstacles to report
- `dotnet ef` not installed as a local or global tool: report BLOCKED rather than hand-writing migration files.
- Nullable warnings (`CS86xx`) newly introduced when `<Nullable>enable</Nullable>` and warnings-as-errors are set.
