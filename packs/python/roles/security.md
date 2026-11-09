# python · security
Applies when: pyproject.toml, requirements*.txt, setup.py or Pipfile present
Read order: py-subprocess-no-shell, py-deserialize-safe, py-jinja-autoescape

## Also trace (no rule file yet)
- `eval`/`exec`/`compile` on input; `__import__`/`importlib` with a user-chosen name.
- `tarfile.extractall`/`zipfile.extractall` on uploads without a path check (`filter="data"` on Python 3.12+).
- Stdlib `xml.etree`/`minidom` on untrusted XML → `defusedxml`.
- `random` for tokens, codes or reset links → `secrets`.
- `requests`/`httpx` with `verify=False`.
- `open()` / `send_file` with a path built from input (traversal).

## Commands
- `pip-audit` (or `uv run pip-audit`) when a manifest or lockfile changed.
- `bandit -r <changed paths>` only if bandit is in the project's dev deps.
