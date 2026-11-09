---
id: react-no-html-unsanitised
title: Sanitise HTML before dangerouslySetInnerHTML
impact: CRITICAL
impactDescription: "stored XSS: script in a comment, bio or CMS field runs in every viewer's session"
roles: [implementer, reviewer, security]
check: "rg -n 'dangerouslySetInnerHTML' --glob '*.{tsx,jsx}'"
tags: security, xss, react
---
Source: any HTML not written by the developer (API fields, CMS content, markdown rendered to HTML, URL params). Sink: `dangerouslySetInnerHTML`, `innerHTML`, `insertAdjacentHTML`. Pass it through the project's sanitiser at the sink, every time; a sanitiser on write does not protect rows written before it or by another client. If the project has no sanitiser, render text instead and report the need.

**Incorrect (post body comes from the API):**

```tsx
<div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
```

**Correct:**

```tsx
import DOMPurify from 'dompurify'

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.bodyHtml) }} />
```

Reference: https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html
