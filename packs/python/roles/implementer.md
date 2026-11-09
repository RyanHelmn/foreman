# python · implementer
Applies when: pyproject.toml, requirements*.txt, setup.py or Pipfile present
Read order: py-subprocess-no-shell, py-deserialize-safe, py-jinja-autoescape, py-async-no-blocking, py-task-pass-ids, py-mutable-default, py-deps-locked

## Iron laws
- No `shell=True`, `os.system`, `pickle.loads` or `yaml.load` on anything that came from outside the process. Thinking "it's only an internal value"? That is the bug.

## Deviation rules
- Type-hint every function you add or change; match the project's mypy/pyright strictness if configured.
- Pydantic (v2) models at IO boundaries, dataclasses or attrs for internal data; don't pass raw dicts between layers.
- Flask: new routes go in a blueprint registered in the app factory, never on a module-level `app`.
- Run commands through the project's runner (`uv run`, `poetry run`, the active venv); never `pip install` into the system interpreter.

## Output additions
- Lockfile regenerated: yes/no/not needed.

## Obstacles to report
- No lockfile and unpinned deps: say so; don't introduce a lock tool.
- Tests need a service (Postgres, Redis) not available: report which, don't mock it out of an integration test.
