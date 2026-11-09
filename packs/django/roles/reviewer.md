# django · reviewer
Applies when: django is a dependency or manage.py exists
Read order: dj-orm-owner-filter, dj-csrf-on, dj-raw-params, dj-mark-safe-sanitised, dj-settings-production, dj-select-related, dj-migrations-committed

## Blocker vs should-fix
- Blocker: an unscoped lookup by pk; `@csrf_exempt` on a session-authenticated view; `mark_safe`/`|safe` on user data; formatted SQL in `raw`/`extra`/`execute`; a model change with no migration; `fields = "__all__"` on a writable serializer or ModelForm.
- Should-fix: a loop over a queryset touching relations without `select_related`/`prefetch_related`; logic added to a view that belongs on the model or service; a generated migration that drops and re-adds a renamed column.
