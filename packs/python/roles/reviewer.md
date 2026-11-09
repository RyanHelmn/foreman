# python · reviewer
Applies when: pyproject.toml, requirements*.txt, setup.py or Pipfile present
Read order: py-subprocess-no-shell, py-deserialize-safe, py-jinja-autoescape, py-async-no-blocking, py-task-pass-ids, py-mutable-default, py-deps-locked

## Blocker vs should-fix
- Blocker: shell, pickle/yaml or autoescape rules broken on any path reachable from input; a blocking call inside an async request handler.
- Should-fix: a test that reaches the network (mock at the client: `respx`, `responses`, or the project's fixture); a new function without type hints in a typed codebase; a dict where the codebase uses Pydantic/dataclass models; a factory_boy factory exists but the test builds rows by hand.
- Nit: ruff-fixable style the formatter would change anyway.

## Obstacles to report
- `# type: ignore` or `# noqa` added without a code: list each.
