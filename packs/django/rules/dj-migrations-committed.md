---
id: dj-migrations-committed
title: Commit the migration with every model change
impact: HIGH
impactDescription: "deploys run against a schema the code doesn't match; the next developer's makemigrations bundles your change into theirs"
roles: [implementer, reviewer, verifier]
check: "python manage.py makemigrations --check --dry-run"
tags: django, migrations
---
A diff that changes a model field, `Meta` option or adds a model includes the generated file under `<app>/migrations/`. Generate it with `python manage.py makemigrations <app>`; don't hand-write schema operations. Data migrations use `RunPython` with `apps.get_model`, never a direct model import. Review the generated operations: a rename detected as drop+add loses data.

**Incorrect (model changed, no migration in the diff):**

```python
class Invoice(models.Model):
    due_at = models.DateTimeField(null=True)
```

**Correct:**

```python
# billing/migrations/0014_invoice_due_at.py (generated, in the same diff)
operations = [migrations.AddField("invoice", "due_at", models.DateTimeField(null=True))]
```

Reference: https://docs.djangoproject.com/en/stable/topics/migrations/
