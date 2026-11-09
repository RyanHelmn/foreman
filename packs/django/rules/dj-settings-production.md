---
id: dj-settings-production
title: Production settings take DEBUG, ALLOWED_HOSTS and SECRET_KEY from the environment, DEBUG off by default
impact: CRITICAL
impactDescription: "DEBUG pages leak settings, SQL and source to anyone; a committed SECRET_KEY lets anyone forge sessions"
roles: [implementer, reviewer, security]
check: "rg -n 'DEBUG\\s*=\\s*True|ALLOWED_HOSTS.*\\*|insecure' --type py"
tags: security, django, config
---
Split settings by environment (base, dev, prod modules, or env-driven). In production: `DEBUG` defaults to `False` and is only enabled by an explicit env value; `ALLOWED_HOSTS` lists real hosts, never `["*"]`; `SECRET_KEY` comes from the environment with no fallback literal. `python manage.py check --deploy` with production settings flags these and the cookie/HSTS settings.

**Incorrect:**

```python
DEBUG = True
ALLOWED_HOSTS = ["*"]
SECRET_KEY = os.environ.get("SECRET_KEY", "django-insecure-abc123")
```

**Correct:**

```python
DEBUG = os.environ.get("DJANGO_DEBUG") == "1"
ALLOWED_HOSTS = os.environ["DJANGO_ALLOWED_HOSTS"].split(",")
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
```

Reference: https://docs.djangoproject.com/en/stable/howto/deployment/checklist/
