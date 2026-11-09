---
id: react-url-validate
title: Allow only http(s) and mailto schemes in user-supplied URLs
impact: HIGH
impactDescription: "a javascript: link in a profile or message runs script when another user clicks it"
roles: [implementer, reviewer, security]
tags: security, xss, react
---
Source: a URL from users or an API (profile website, message link, `?next=` param). Sinks: `href`, `src`, `formAction`, `window.location`, `window.open`. React escapes text, not URL schemes, and `window.location`/`window.open` bypass React entirely. Parse with `new URL()` and allow-list the protocol; render plain text when it fails.

**Incorrect:**

```tsx
<a href={user.website}>{user.website}</a>
```

**Correct:**

```tsx
const safeHref = (raw: string) => {
  try {
    const u = new URL(raw)
    return ['http:', 'https:', 'mailto:'].includes(u.protocol) ? u.href : undefined
  } catch {
    return undefined
  }
}

<a href={safeHref(user.website)}>{user.website}</a>
```
