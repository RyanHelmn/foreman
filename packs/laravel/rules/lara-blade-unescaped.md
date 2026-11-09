---
id: lara-blade-unescaped
title: Use {{ }} in Blade; {!! !!} only on HTML you built or sanitised
impact: CRITICAL
impactDescription: "stored XSS: a user's field runs script in every viewer's session"
roles: [implementer, reviewer, security]
check: "rg -n '\\{!!' resources/views"
tags: xss, blade
---
Source: any user-written value, including DB columns. Sink: `{!! $x !!}`, which outputs unescaped. `{{ }}` escapes with `htmlspecialchars`. User HTML that must render goes through an HTML sanitiser (e.g. mews/purifier, if the project has one) before `{!! !!}`. Also check `href="{{ $user->website }}"`: escaping doesn't stop `javascript:` URLs.

**Incorrect:**

```blade
<div class="bio">{!! $user->bio !!}</div>
```

**Correct:**

```blade
<div class="bio">{{ $user->bio }}</div>
```

Reference: https://laravel.com/docs/blade#displaying-data
