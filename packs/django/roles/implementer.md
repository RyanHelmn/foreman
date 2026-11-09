# django · implementer
Applies when: django is a dependency or manage.py exists
Read order: dj-orm-owner-filter, dj-csrf-on, dj-raw-params, dj-mark-safe-sanitised, dj-settings-production, dj-select-related, dj-migrations-committed

## Iron laws
- Every queryset that serves a request is filtered by `request.user` (or its tenant) in the query. Thinking "the view has @login_required"? That is the bug.
- Every model change ships its migration in the same diff. Thinking "I'll run makemigrations later"? That is the bug.

## Deviation rules
- Business logic on models, managers or a services module; views parse input, call it, render. Don't grow views.
- Input goes through a `Form`/`ModelForm` or DRF serializer with explicit `fields`, never `fields = "__all__"` on a writable serializer.
- New settings go in the env-specific module or read from env in base; never edit production values into dev settings.

## Output additions
- Migrations generated: file names, or "none: no model change".

## Obstacles to report
- Conflicting migration numbers with another branch: report, don't renumber.
