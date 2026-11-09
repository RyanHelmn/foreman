# django · verifier
Applies when: django is a dependency or manage.py exists
Read order: dj-migrations-committed

## Commands
- Subset (Django runner): `python manage.py test billing.tests.test_invoices.InvoiceTests.test_refund` (dotted label: app, module, class, method).
- Subset (pytest-django, if `pytest.ini`/`pyproject` sets `DJANGO_SETTINGS_MODULE`): `pytest billing/tests/test_invoices.py -k refund`.
- Full: `python manage.py test` or `pytest`, whichever the project uses.
- Migrations: `python manage.py makemigrations --check --dry-run` (non-zero exit = missing migration).

## Obstacles to report
- `TestCase` wraps each test in a transaction, so `transaction.on_commit` callbacks never fire unless the test uses `self.captureOnCommitCallbacks(execute=True)`; code in those callbacks is untested.
- pytest-django `--reuse-db` keeps an old schema; after a migration change run with `--create-db`.
