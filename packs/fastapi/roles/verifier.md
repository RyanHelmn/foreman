# fastapi · verifier
Applies when: fastapi is a dependency

## Obstacles to report
- `TestClient(app)` outside a `with` block skips lifespan/startup, so tests can pass against an app that fails to boot. Note when changed startup code has no test using `with TestClient(app) as client`.
- `app.dependency_overrides` set in one test and not cleared leaks into later tests; a failure that only appears in the full run is likely this, not flakiness.
