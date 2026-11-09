---
id: py-jinja-autoescape
title: Create Jinja environments with autoescape on, and never Markup() user text
impact: CRITICAL
impactDescription: "user-supplied text renders as script in every viewer's browser (stored XSS)"
roles: [implementer, reviewer, security]
check: "rg -n 'Environment\\(|Markup\\(|\\|\\s*safe\\b'"
tags: security, python, xss
---
Source: any user-controlled string. Sink: a Jinja template rendered as HTML. A bare `jinja2.Environment()` has autoescape off. Flask turns it on for `.html` templates only; `.j2`/`.txt` names rendered as HTML are not escaped. `Markup(x)` and `|safe` switch escaping off for that value.

**Incorrect:**

```python
env = Environment(loader=FileSystemLoader("templates"))
html = env.get_template("email.j2").render(name=Markup(user.display_name))
```

**Correct:**

```python
env = Environment(loader=FileSystemLoader("templates"), autoescape=select_autoescape(["html", "j2"]))
html = env.get_template("email.j2").render(name=user.display_name)
```

Reference: https://jinja.palletsprojects.com/en/stable/api/#autoescaping
