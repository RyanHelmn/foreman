# dotnet · security
Applies when: *.csproj, *.sln or global.json present
Read order: net-authz-fallback, net-ef-raw-sql, net-deser-typename, net-validate-model, net-antiforgery

## Also trace (no rule file yet)
- Secrets in `appsettings*.json` or `launchSettings.json` instead of user-secrets locally and Key Vault/environment in production.
- `XmlDocument`/`XmlReaderSettings` with `DtdProcessing.Parse` or a non-null `XmlResolver` on input (XXE).
- `Process.Start` with a request value in `Arguments`; `Path.Combine(root, input)` where an absolute `input` discards `root`.
- `UseDeveloperExceptionPage`, Swagger UI or `MapOpenApi` without an environment check.
- CORS `AllowAnyOrigin()` or `SetIsOriginAllowed(_ => true)` together with `AllowCredentials()`.
- JWT bearer with `ValidateIssuer`, `ValidateAudience` or `ValidateLifetime` set to false.

## Commands
- `dotnet list package --vulnerable --include-transitive` when a `*.csproj` or `Directory.Packages.props` changed.
