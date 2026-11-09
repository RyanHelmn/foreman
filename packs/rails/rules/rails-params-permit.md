---
id: rails-params-permit
title: Permit attributes explicitly with params.require(...).permit(...); never permit!
impact: CRITICAL
impactDescription: "a request sets role, account_id or admin by adding a form field"
roles: [implementer, reviewer, security]
check: "rg -n 'permit!|\\.to_unsafe_h|params\\.to_h' app/"
tags: mass-assignment, strong-parameters
---
Source: the request body. Sink: `create`/`update`/`new`/`assign_attributes`. Strong parameters only protect when the permitted list excludes privileged columns. `permit!`, `to_unsafe_h`, and permitting `:role`, `:admin`, `:user_id` or `:account_id` from user forms reopen mass assignment. Set ownership from the session.

**Incorrect:**

```ruby
@user.update(params.require(:user).permit!)
Project.create(params.require(:project).permit(:name, :account_id))
```

**Correct:**

```ruby
@user.update(params.require(:user).permit(:name, :email))
current_account.projects.create(params.require(:project).permit(:name))
```

Reference: https://api.rubyonrails.org/classes/ActionController/StrongParameters.html
