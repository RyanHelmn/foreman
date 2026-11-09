# dotnet · verifier
Applies when: *.csproj, *.sln or global.json present

## Commands
- Subset by class: `dotnet test --filter "FullyQualifiedName~Acme.Billing.Tests.InvoiceServiceTests"`; one test: `--filter "FullyQualifiedName=Acme.Billing.Tests.InvoiceServiceTests.RejectsNegativeTotal"`; one project: `dotnet test tests/Billing.Tests/Billing.Tests.csproj`.
- Format check when configured: `dotnet format --verify-no-changes`.
- Full: `dotnet build` (warnings count when `TreatWarningsAsErrors` is set) then `dotnet test`.

## Obstacles to report
- A `--filter` that matches nothing still exits 0 with "No test matches the given testcase filter"; report no tests run, not PASS.
- Testcontainers tests failing because Docker is unavailable: INCONCLUSIVE, not FAILED.
- An SDK mismatch with `global.json` ("A compatible .NET SDK was not found"): INCONCLUSIVE with the version needed.
