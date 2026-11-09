# dotnet · reviewer
Applies when: *.csproj, *.sln or global.json present
Read order: net-authz-fallback, net-ef-raw-sql, net-deser-typename, net-validate-model, net-antiforgery, net-ef-include, net-ef-no-tracking, net-options-validated

## Blocker vs should-fix
- Blocker: net-ef-raw-sql, net-deser-typename; a new endpoint reachable anonymously without `[AllowAnonymous]` stating it; anti-forgery disabled on a cookie-authenticated endpoint; an applied migration edited.
- Should-fix: net-validate-model, net-ef-include; `.Result`/`.Wait()` on a task in request code; `IConfiguration["..."]` read in a service.
- Nit: net-ef-no-tracking on small lookups.
