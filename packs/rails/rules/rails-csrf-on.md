---
id: rails-csrf-on
title: Keep forgery protection on for cookie-authenticated controllers
impact: HIGH
impactDescription: "another site submits state-changing requests with the victim's session cookie"
roles: [implementer, reviewer, security]
check: "rg -n 'skip_before_action :verify_authenticity_token|skip_forgery_protection|protect_from_forgery with: :null_session' app/controllers"
tags: csrf
---
`ActionController::Base` enables CSRF protection by default. `skip_forgery_protection` / `skip_before_action :verify_authenticity_token` is correct only on controllers that authenticate by token (API controllers inheriting `ActionController::API`, webhooks that verify a signature). Never skip it to make a JavaScript `fetch` work; send the `X-CSRF-Token` header from `csrf_meta_tags` instead.

**Incorrect:**

```ruby
class SettingsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: :update
end
```

**Correct:**

```erb
<%= csrf_meta_tags %>
```

```js
fetch("/settings", { method: "PATCH", headers: { "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content } })
```

Reference: https://guides.rubyonrails.org/security.html#cross-site-request-forgery-csrf
