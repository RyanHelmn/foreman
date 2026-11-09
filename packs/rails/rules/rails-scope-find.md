---
id: rails-scope-find
title: Find records through current_user's associations, not the bare model
impact: CRITICAL
impactDescription: "any signed-in user reads or edits another user's record by changing the id in the URL"
roles: [implementer, reviewer, security]
check: "rg -n '[A-Z][A-Za-z]+\\.find(_by)?\\(params' app/controllers"
tags: auth, idor, activerecord
---
Source: `params[:id]`. Sink: `Model.find`. Start the lookup from the owning association (`current_user.projects`, `current_account.invoices`) so a foreign id raises `RecordNotFound` (404). If the project uses Pundit or CanCanCan, `authorize @record` / `load_and_authorize_resource` on the action is the equivalent.

**Incorrect:**

```ruby
def show
  @project = Project.find(params[:id])
end
```

**Correct:**

```ruby
def show
  @project = current_user.projects.find(params[:id])
end
```

Reference: https://guides.rubyonrails.org/security.html#user-management
