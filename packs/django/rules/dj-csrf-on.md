---
id: dj-csrf-on
title: Keep CsrfViewMiddleware on and no @csrf_exempt on cookie-authenticated views
impact: CRITICAL
impactDescription: "another site makes a logged-in user's browser change their email, password or payouts"
roles: [implementer, reviewer, security]
check: "rg -n 'csrf_exempt|CsrfViewMiddleware' --type py"
tags: security, django, csrf
---
Source: a cross-site form or fetch carrying the session cookie. Sink: any state-changing view authenticated by that cookie. `django.middleware.csrf.CsrfViewMiddleware` stays in `MIDDLEWARE`; forms include `{% csrf_token %}`; JS sends the `X-CSRFToken` header. `@csrf_exempt` is only for endpoints authenticated another way (webhook signature, bearer token), never to make a failing form submit.

**Incorrect:**

```python
@csrf_exempt
@login_required
def update_email(request):
    request.user.email = request.POST["email"]
    request.user.save()
```

**Correct:**

```python
@require_POST
@login_required
def update_email(request):
    form = EmailForm(request.POST, instance=request.user)
    if form.is_valid():
        form.save()
```

Reference: https://docs.djangoproject.com/en/stable/howto/csrf/
