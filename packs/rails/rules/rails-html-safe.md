---
id: rails-html-safe
title: Call html_safe, raw or <%== only on content you built or sanitised
impact: CRITICAL
impactDescription: "stored XSS: a user's profile field runs script in every viewer's session"
roles: [implementer, reviewer, security]
check: "rg -n '\\.html_safe|\\braw\\(|<%==' app/"
tags: xss, views
---
Source: any user-supplied string, including DB columns users wrote. Sink: `html_safe`, `raw`, `<%==`, `content_tag` with a pre-marked string, or `link_to` with a user `href` (`javascript:` URLs). ERB escapes by default; these bypass it. Run user HTML through `sanitize` with an explicit tag list, and check link schemes.

**Incorrect:**

```erb
<%= raw @comment.body %>
<%= link_to "Website", @user.website %>
```

**Correct:**

```erb
<%= sanitize @comment.body, tags: %w[p br strong em a], attributes: %w[href] %>
<%= link_to "Website", @user.website if @user.website&.start_with?("https://") %>
```

Reference: https://guides.rubyonrails.org/security.html#cross-site-scripting-xss
