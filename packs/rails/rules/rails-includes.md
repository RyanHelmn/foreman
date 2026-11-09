---
id: rails-includes
title: Preload associations a view or serializer iterates with includes
impact: HIGH
impactDescription: "one query per row; a 50-item index page issues 51+ queries"
roles: [implementer, reviewer]
tags: n+1, activerecord
---
An association called inside an `each`, partial collection or serializer loads per record. Add `includes(:association)` (nested: `includes(comments: :author)`) to the relation the controller builds. Where the project enables `strict_loading`, a lazy load raises instead; don't disable it to get green.

**Incorrect:**

```ruby
@posts = Post.order(created_at: :desc).limit(50)
```

```erb
<% @posts.each do |post| %><%= post.author.name %><% end %>
```

**Correct:**

```ruby
@posts = Post.includes(:author).order(created_at: :desc).limit(50)
```

Reference: https://guides.rubyonrails.org/active_record_querying.html#eager-loading-associations
