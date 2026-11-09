---
id: dj-mark-safe-sanitised
title: Use format_html, not mark_safe or |safe, for anything containing user data
impact: CRITICAL
impactDescription: "user text renders as script for every viewer, including admins (stored XSS)"
roles: [implementer, reviewer, security]
check: "rg -n 'mark_safe\\(|\\|\\s*safe\\b|autoescape off|SafeString\\('"
tags: security, django, xss
---
Source: any model field or request value a user can write. Sink: `mark_safe`, `SafeString`, the `|safe` filter or `{% autoescape off %}`. Each turns escaping off for the whole string. Build HTML with `format_html`/`format_html_join`, which escape their arguments. Only mark rich text safe after a sanitiser (e.g. `nh3.clean`) the project already uses.

**Incorrect:**

```python
def badge(user):
    return mark_safe(f'<span class="badge">{user.display_name}</span>')
```

**Correct:**

```python
def badge(user):
    return format_html('<span class="badge">{}</span>', user.display_name)
```

Reference: https://docs.djangoproject.com/en/stable/ref/utils/#django.utils.html.format_html
