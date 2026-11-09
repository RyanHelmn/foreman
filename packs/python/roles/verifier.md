# python · verifier
Applies when: pyproject.toml, requirements*.txt, setup.py or Pipfile present

## Commands
- Prefix with the project's runner: `uv run`, `poetry run`, `pdm run`, or the activated venv.
- Subset: `pytest tests/test_orders.py::test_refund_rejects_closed -x`, or `pytest tests/test_orders.py -k "refund and not slow"`.
- Full: `pytest` (add `-x` in targeted mode to stop at the first failure).
- Lint: `ruff check <paths>`; format: `ruff format --check <paths>`.
- Types: `mypy <paths>` only if `[tool.mypy]`/`mypy.ini` exists; `pyright <paths>` only if `[tool.pyright]`/`pyrightconfig.json` exists.

## Obstacles to report
- Exit code 5 means no tests were collected: a `-k` or node id that matched nothing. Report it, not PASS.
- Skips hide failures: run with `-rs` and report skip reasons for changed tests (missing env, missing marker, `importorskip`).
- `async def` tests need pytest-asyncio or anyio configured; without it they don't run their body. Check the warnings summary.
- `ruff format --check` and `ruff check` are separate; one passing says nothing about the other.
