# django · security
Applies when: django is a dependency or manage.py exists
Read order: dj-orm-owner-filter, dj-csrf-on, dj-raw-params, dj-mark-safe-sanitised, dj-settings-production

## Also trace (no rule file yet)
- Admin: mounted at a non-default path, staff accounts limited, and restricted by IP/VPN or SSO at the proxy where the project does so; new `ModelAdmin`s don't expose secrets in `list_display`/`readonly_fields`.
- DRF `DEFAULT_PERMISSION_CLASSES` defaults to `AllowAny`: check the setting and each new view's `permission_classes`.
- `redirect(request.GET["next"])` without `url_has_allowed_host_and_scheme`.
- `FileField` uploads served from `MEDIA_URL` without auth when they are private.

## Commands
- `DJANGO_SETTINGS_MODULE=<prod settings> python manage.py check --deploy` when settings changed.
- `pip-audit` when requirements or the lockfile changed.
