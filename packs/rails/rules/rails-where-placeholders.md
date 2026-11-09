---
id: rails-where-placeholders
title: Pass values to where, order and find_by_sql as hashes or placeholders, never interpolated
impact: CRITICAL
impactDescription: "SQL injection from any interpolated request value"
roles: [implementer, reviewer, security]
check: "rg -n '(where|order|having|group|pluck|select|joins|find_by_sql|exists\\?)\\(\\s*\"[^\"]*#\\{' --type ruby"
tags: sql, activerecord
---
Source: params or any string from outside. Sink: Active Record methods that accept SQL fragments: `where`, `order`, `group`, `having`, `pluck`, `select`, `joins`, `find_by_sql`, `exists?`. Use a hash, `?` or `:named` placeholders, or `sanitize_sql_like` for LIKE. Column names in `order` cannot be bound: map input to an allowlist.

**Incorrect:**

```ruby
User.where("email = '#{params[:email]}'")
Post.order("#{params[:sort]} DESC")
```

**Correct:**

```ruby
User.where(email: params[:email])
Post.where("title LIKE ?", "%#{Post.sanitize_sql_like(params[:q])}%")
Post.order(SORTS.fetch(params[:sort], :created_at) => :desc)
```

Reference: https://guides.rubyonrails.org/security.html#sql-injection
